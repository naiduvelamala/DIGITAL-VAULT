import { useState, useEffect } from 'react';
import { MapPin, RefreshCw, AlertCircle, Target, Satellite, Navigation } from 'lucide-react';

function LocationStatus({ onLocationUpdate }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accuracy, setAccuracy] = useState(null);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this device');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject, 
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000 // 1 minute
          }
        );
      });

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      };

      setLocation(newLocation);
      setAccuracy(position.coords.accuracy);
      onLocationUpdate(newLocation);
    } catch (err) {
      let errorMessage = 'Location access denied';
      if (err.code === 1) errorMessage = 'Location access denied by user';
      else if (err.code === 2) errorMessage = 'Location unavailable';
      else if (err.code === 3) errorMessage = 'Location request timeout';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getAccuracyStatus = (accuracy) => {
    if (!accuracy) return { text: 'Unknown', color: 'text-navy-400' };
    if (accuracy <= 10) return { text: 'Excellent', color: 'text-green-400' };
    if (accuracy <= 50) return { text: 'Good', color: 'text-blue-400' };
    if (accuracy <= 100) return { text: 'Fair', color: 'text-yellow-400' };
    return { text: 'Poor', color: 'text-red-400' };
  };

  const accuracyStatus = getAccuracyStatus(accuracy);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Satellite className="w-5 h-5 text-cyan-400" />
            GPS Tracking
          </h3>
          <p className="text-sm text-navy-400">Real-time location verification</p>
        </div>
        <button 
          onClick={getCurrentLocation}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          {loading ? 'Scanning...' : 'Update'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-sm font-medium text-red-400">Location Error</div>
              <div className="text-xs text-navy-400 mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}

      {location ? (
        <div className="space-y-4">
          {/* Status Indicator */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-sm font-medium text-green-400">GPS Lock Acquired</div>
                <div className="text-xs text-navy-400">Location services active</div>
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-navy-800/50 rounded-lg">
              <span className="text-sm text-navy-400">Latitude</span>
              <span className="font-mono text-white">{location.latitude.toFixed(6)}°</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-navy-800/50 rounded-lg">
              <span className="text-sm text-navy-400">Longitude</span>
              <span className="font-mono text-white">{location.longitude.toFixed(6)}°</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-navy-800/50 rounded-lg">
              <span className="text-sm text-navy-400">Accuracy</span>
              <div className="text-right">
                <span className="font-mono text-white">±{Math.round(location.accuracy)}m</span>
                <div className={`text-xs ${accuracyStatus.color} font-medium`}>
                  {accuracyStatus.text}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-navy-800/50 rounded-lg">
              <span className="text-sm text-navy-400">Last Update</span>
              <span className="text-white text-sm">
                {new Date(location.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-navy-400 opacity-50" />
          </div>
          <div className="text-lg font-medium text-navy-400 mb-2">Location Unavailable</div>
          <div className="text-sm text-navy-500 mb-4">
            Enable location services to access geo-restricted capsules
          </div>
          <button 
            onClick={getCurrentLocation}
            className="btn-primary"
          >
            <Target className="w-4 h-4" />
            Enable GPS
          </button>
        </div>
      )}
    </div>
  );
}

export default LocationStatus;