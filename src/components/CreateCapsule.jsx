import { useState } from 'react';
import { Upload, Clock, MapPin, Lock, Plus, FileText, Calendar, Search, Target, Shield, AlertTriangle, X } from 'lucide-react';
import { useCapsules } from '../hooks/useCapsules';
import { useAptos } from '../hooks/useAptos';

function CreateCapsule({ onCreateCapsule }) {
  const { walletAddress } = useAptos();
  const { createCapsule, loading } = useCapsules(walletAddress);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    unlockDate: '',
    unlockTime: '',
    hasGeoLock: false,
    locationSearch: '',
    latitude: '',
    longitude: '',
    radius: '500',
    priority: 'standard'
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Mock location search (replace with Google Maps API)
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setIsSearchingLocation(true);
    
    setTimeout(() => {
      const mockResults = [
        { name: 'Fort Bragg, NC, USA', lat: 35.1427, lng: -79.0059 },
        { name: 'Pentagon, Arlington, VA, USA', lat: 38.8719, lng: -77.0563 },
        { name: 'Naval Base San Diego, CA, USA', lat: 32.6866, lng: -117.1268 },
        { name: 'Wright-Patterson AFB, OH, USA', lat: 39.8261, lng: -84.0481 },
        { name: 'Camp Pendleton, CA, USA', lat: 33.3547, lng: -117.3128 }
      ].filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setLocationSuggestions(mockResults);
      setIsSearchingLocation(false);
    }, 500);
  };

  const selectLocation = (location) => {
    setFormData({
      ...formData,
      locationSearch: location.name,
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    });
    setLocationSuggestions([]);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            locationSearch: `Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`
          });
        },
        (error) => {
          alert('Unable to get current location: ' + error.message);
        }
      );
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFileType(file)) {
        setFormData({...formData, file});
      } else {
        alert('Please upload a valid file type (PDF, DOC, DOCX, TXT, JPG, PNG, GIF)');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFileType(file)) {
        setFormData({...formData, file});
      } else {
        alert('Please upload a valid file type (PDF, DOC, DOCX, TXT, JPG, PNG, GIF)');
      }
    }
  };

  const isValidFileType = (file) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];
    return validTypes.includes(file.type);
  };

  const removeFile = () => {
    setFormData({...formData, file: null});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      alert('Please select a file to upload');
      return;
    }

    if (!formData.unlockDate || !formData.unlockTime) {
      alert('Please set unlock date and time');
      return;
    }

    if (formData.hasGeoLock && (!formData.latitude || !formData.longitude)) {
      alert('Please set location for geo-lock');
      return;
    }

    try {
      const unlockTimestamp = new Date(`${formData.unlockDate}T${formData.unlockTime}`).getTime();
      
      const capsuleData = {
        ...formData,
        unlockTimestamp,
        fileSize: formData.file.size,
        fileType: formData.file.type
      };

      await createCapsule(capsuleData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        file: null,
        unlockDate: '',
        unlockTime: '',
        hasGeoLock: false,
        locationSearch: '',
        latitude: '',
        longitude: '',
        radius: '500',
        priority: 'standard'
      });
      
      if (onCreateCapsule) {
        onCreateCapsule({ success: true });
      }
    } catch (error) {
      alert('Failed to create capsule: ' + error.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('document') || fileType?.includes('word')) return '📝';
    if (fileType?.includes('text')) return '📃';
    return '📁';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'top-secret': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'classified': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-in">
      <div className="card space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Create Secure Time Capsule</h2>
          <p className="text-navy-300 max-w-2xl mx-auto">
            Upload classified documents with military-grade encryption, time-lock, and geo-lock security protocols
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-navy-600">
              <Shield className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Mission Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-navy-200 mb-3">
                  Operation Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Operation Thunder Strike"
                  className="w-full p-4 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder-navy-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-navy-200 mb-3">
                  Classification Level *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full p-4 bg-navy-800 border border-navy-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="standard">UNCLASSIFIED</option>
                  <option value="classified">CLASSIFIED</option>
                  <option value="top-secret">TOP SECRET</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-200 mb-3">
                Mission Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the operation and classified content..."
                rows="4"
                className="w-full p-4 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder-navy-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-navy-600">
              <FileText className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Classified Document Upload</h3>
            </div>
            
            {!formData.file ? (
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-navy-600 hover:border-navy-500 hover:bg-navy-800/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-navy-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-navy-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white mb-2">
                      Drop classified files here or click to browse
                    </p>
                    <p className="text-navy-400 text-sm">
                      Supported: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max 100MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-navy-800/50 border border-navy-600 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{getFileIcon(formData.file.type)}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-lg">{formData.file.name}</div>
                    <div className="text-navy-400">
                      {formatFileSize(formData.file.size)} • {formData.file.type}
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${getPriorityColor(formData.priority)}`}>
                      {formData.priority.toUpperCase().replace('-', ' ')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Time Lock Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-navy-600">
              <Clock className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Time Lock Configuration</h3>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-yellow-400">TEMPORAL SECURITY PROTOCOL</span>
              </div>
              <p className="text-navy-300 text-sm mb-6">
                Files will remain encrypted and inaccessible until the specified unlock time. This cannot be reversed.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy-200 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Unlock Date *
                  </label>
                  <input
                    type="date"
                    value={formData.unlockDate}
                    onChange={(e) => setFormData({...formData, unlockDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-4 bg-navy-800 border border-navy-600 rounded-xl text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-200 mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Unlock Time *
                  </label>
                  <input
                    type="time"
                    value={formData.unlockTime}
                    onChange={(e) => setFormData({...formData, unlockTime: e.target.value})}
                    className="w-full p-4 bg-navy-800 border border-navy-600 rounded-xl text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Geo Lock Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-navy-600">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">Geographic Access Control</h3>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasGeoLock}
                  onChange={(e) => setFormData({...formData, hasGeoLock: e.target.checked})}
                  className="w-5 h-5 text-cyan-500 bg-navy-800 border-navy-600 rounded focus:ring-cyan-500"
                />
                <span className="text-sm font-semibold text-navy-200">Enable Geo-Lock</span>
              </label>
            </div>
            
            {formData.hasGeoLock && (
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold text-cyan-400">GEOGRAPHIC SECURITY PROTOCOL</span>
                </div>
                <p className="text-navy-300 text-sm mb-6">
                  Files will only be accessible within the specified geographic radius. GPS verification required.
                </p>
                
                {/* Location Search */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-navy-200 mb-3">
                    <Search className="w-4 h-4 inline mr-2" />
                    Search Military Base or Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.locationSearch}
                      onChange={(e) => {
                        setFormData({...formData, locationSearch: e.target.value});
                        searchLocations(e.target.value);
                      }}
                      placeholder="e.g., Fort Bragg, Pentagon, Naval Base San Diego..."
                      className="w-full p-4 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder-navy-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    />
                    <Search className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-navy-400" />
                  </div>
                  
                  {locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-navy-800 border border-navy-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {locationSuggestions.map((location, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectLocation(location)}
                          className="w-full text-left px-4 py-3 hover:bg-navy-700 first:rounded-t-xl last:rounded-b-xl transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Target className="w-4 h-4 text-cyan-400" />
                            <div>
                              <div className="text-sm font-medium text-white">{location.name}</div>
                              <div className="text-xs text-navy-400">
                                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Current Location Button */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    Use Current Location
                  </button>
                  <span className="text-xs text-navy-400">
                    GPS coordinates will be detected automatically
                  </span>
                </div>

                {/* Manual Coordinates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-200 mb-2">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      placeholder="35.1427"
                      className="w-full p-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-navy-400 focus:border-cyan-500"
                      required={formData.hasGeoLock}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-200 mb-2">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      placeholder="-79.0059"
                      className="w-full p-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-navy-400 focus:border-cyan-500"
                      required={formData.hasGeoLock}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-200 mb-2">
                      Security Radius
                    </label>
                    <select
                      value={formData.radius}
                      onChange={(e) => setFormData({...formData, radius: e.target.value})}
                      className="w-full p-3 bg-navy-800 border border-navy-600 rounded-lg text-white focus:border-cyan-500"
                    >
                      <option value="100">100m - Building</option>
                      <option value="500">500m - Compound</option>
                      <option value="1000">1km - Base</option>
                      <option value="5000">5km - Area</option>
                      <option value="10000">10km - Region</option>
                    </select>
                  </div>
                </div>

                {formData.latitude && formData.longitude && (
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
                      <MapPin className="w-4 h-4" />
                      Geographic Lock Configured
                    </div>
                    <div className="text-xs text-navy-400">
                      Access restricted to {formData.radius}m radius around {formData.latitude}, {formData.longitude}
                      {formData.locationSearch && ` (${formData.locationSearch})`}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-8 border-t border-navy-600">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary text-xl py-6 relative overflow-hidden"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                  Deploying to Aptos Blockchain...
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6 mr-3" />
                  Deploy Secure Time Capsule
                </>
              )}
            </button>
            <p className="text-center text-xs text-navy-500 mt-4">
              By deploying, you confirm this operation follows military security protocols
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCapsule;