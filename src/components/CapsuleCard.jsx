import { Clock, MapPin, Shield, Lock, Unlock, FileText, Calendar, AlertTriangle, Target, Download } from 'lucide-react';


function CapsuleCard({ capsule, userLocation, onUnlock }) {

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const isTimeUnlocked = Date.now() >= capsule.unlockTimestamp;
  const isGeoUnlocked = !capsule.hasGeoLock || (
    userLocation && 
    calculateDistance(
      userLocation.latitude, 
      userLocation.longitude, 
      capsule.geoLocation.latitude, 
      capsule.geoLocation.longitude
    ) <= capsule.geoLocation.radius
  );
  
  const canUnlock = isTimeUnlocked && isGeoUnlocked;
  const timeRemaining = capsule.unlockTimestamp - Date.now();
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));

  const handleUnlock = async () => {
    try {
      // Mock unlock process
      alert(`✅ File "${capsule.fileName}" unlocked successfully!\nTransaction: 0x123...abc`);
      
      if (onUnlock) {
        onUnlock(capsule.id);
      }
    } catch (error) {
      alert(`❌ Failed to unlock capsule: ${error.message}`);
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'top-secret': 
        return { 
          color: 'priority-top-secret', 
          icon: <AlertTriangle className="w-3 h-3" />,
          label: 'TOP SECRET'
        };
      case 'classified': 
        return { 
          color: 'priority-classified', 
          icon: <Shield className="w-3 h-3" />,
          label: 'CLASSIFIED'
        };
      default: 
        return { 
          color: 'priority-standard', 
          icon: <FileText className="w-3 h-3" />,
          label: 'UNCLASSIFIED'
        };
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('document') || fileType?.includes('word')) return '📝';
    return '📁';
  };

  const getTimeRemainingText = () => {
    if (timeRemaining <= 0) return 'UNLOCKED';
    if (daysRemaining > 1) return `${daysRemaining} days`;
    if (hoursRemaining > 1) return `${hoursRemaining} hours`;
    return 'Soon';
  };

  const priorityConfig = getPriorityConfig(capsule.priority);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-white">{capsule.title}</h3>
            <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 font-bold ${priorityConfig.color}`}>
              {priorityConfig.icon}
              {priorityConfig.label}
            </span>
          </div>
          {capsule.description && (
            <p className="text-navy-300 text-sm leading-relaxed">{capsule.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {canUnlock ? (
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Unlock className="w-6 h-6 text-green-400" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-red-400" />
            </div>
          )}
        </div>
      </div>

      {/* File Information */}
      <div className="bg-navy-700/50 rounded-xl p-4 mb-6 border border-navy-600">
        <div className="flex items-center gap-4">
          <div className="text-3xl">{getFileIcon(capsule.fileType)}</div>
          <div className="flex-1">
            <div className="font-semibold text-white mb-1">{capsule.fileName}</div>
            <div className="text-sm text-navy-400">
              {formatFileSize(capsule.fileSize)} • {capsule.fileType || 'Unknown type'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-navy-400 uppercase tracking-wide">IPFS Hash</div>
            <div className="font-mono text-xs text-blue-400">{capsule.ipfsHash.slice(0, 12)}...</div>
          </div>
        </div>
      </div>

      {/* Access Controls */}
      <div className="space-y-4 mb-6">
        {/* Time Lock Status */}
        <div className="flex items-center gap-4 p-4 bg-navy-800/50 rounded-xl">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-medium text-white">Time Lock</span>
              {isTimeUnlocked ? (
                <span className="status-unlocked">ACTIVE</span>
              ) : (
                <span className="status-locked">{getTimeRemainingText()}</span>
              )}
            </div>
            <div className="text-xs text-navy-400">
              Target: {formatDate(capsule.unlockTimestamp)}
            </div>
          </div>
        </div>

        {/* Geo Lock Status */}
        {capsule.hasGeoLock && (
          <div className="flex items-center gap-4 p-4 bg-navy-800/50 rounded-xl">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-medium text-white">Geographic Lock</span>
                {isGeoUnlocked ? (
                  <span className="status-unlocked">IN RANGE</span>
                ) : (
                  <span className="status-locked">OUT OF RANGE</span>
                )}
              </div>
              <div className="text-xs text-navy-400">
                {capsule.geoLocation.name || `${capsule.geoLocation.latitude.toFixed(4)}, ${capsule.geoLocation.longitude.toFixed(4)}`}
                <span className="ml-2">±{capsule.geoLocation.radius}m</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="space-y-4">
        {canUnlock ? (
          <button 
            onClick={handleUnlock}
            className="btn-success w-full text-lg py-4"
          >
            <Download className="w-5 h-5" />
            Access Classified Content
          </button>
        ) : (
          <div className="space-y-3">
            <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="text-sm font-medium text-red-400 mb-1">ACCESS DENIED</div>
              <div className="text-xs text-navy-400">
                {!isTimeUnlocked && !isGeoUnlocked 
                  ? 'Time & Location requirements not met' 
                  : !isTimeUnlocked 
                    ? 'Waiting for scheduled unlock time' 
                    : 'Must be within authorized location'}
              </div>
            </div>
            <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed py-4">
              <Lock className="w-5 h-5" />
              Capsule Secured
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-xs text-navy-500 mt-6 pt-4 border-t border-navy-700 flex justify-between">
        <span>Created: {formatDate(capsule.createdAt)}</span>
        <span className="font-mono">ID: {capsule.id}</span>
      </div>
    </div>
  );
}

export default CapsuleCard;