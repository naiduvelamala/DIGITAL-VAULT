import { useState } from 'react';
import { Download, Shield, X, CheckCircle, Copy, FileText, Clock, MapPin, AlertTriangle } from 'lucide-react';

function UnlockModal({ capsule, onClose, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const handleDownload = async () => {
    setDecrypting(true);
    
    // Simulate blockchain verification and decryption
    setTimeout(() => {
      setDecrypting(false);
      setDownloading(true);
      
      // Simulate file download
      setTimeout(() => {
        onDownload(capsule);
        setDownloading(false);
      }, 1500);
    }, 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('document') || fileType?.includes('word')) return '📝';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'top-secret': 
        return { color: 'text-red-400', bg: 'bg-red-500/10', label: 'TOP SECRET' };
      case 'classified': 
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'CLASSIFIED' };
      default: 
        return { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'UNCLASSIFIED' };
    }
  };

  const priorityConfig = getPriorityConfig(capsule.priority);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass border border-navy-600 rounded-2xl max-w-2xl w-full p-8 animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Access Authorized</h3>
              <p className="text-navy-300">All security protocols verified</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-navy-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Capsule Details */}
        <div className="space-y-6 mb-8">
          {/* Title and Classification */}
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold text-white">{capsule.title}</h4>
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${priorityConfig.color} ${priorityConfig.bg}`}>
              {priorityConfig.label}
            </span>
          </div>

          {/* File Information */}
          <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-600">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">{getFileIcon(capsule.fileType)}</div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-white">{capsule.fileName}</div>
                <div className="text-navy-400">
                  {formatFileSize(capsule.fileSize)} • {capsule.fileType || 'Unknown type'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-400">IPFS Hash:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-400">{capsule.ipfsHash.slice(0, 16)}...</span>
                  <button 
                    onClick={() => copyToClipboard(capsule.ipfsHash)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Created:</span>
                <span className="text-white">{new Date(capsule.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Access Conditions Met */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <Clock className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-green-400">Time Lock: SATISFIED</div>
                <div className="text-xs text-navy-400">
                  Unlocked at {new Date(capsule.unlockTimestamp).toLocaleString()}
                </div>
              </div>
            </div>
            
            {capsule.hasGeoLock && (
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <MapPin className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-green-400">Geo Lock: AUTHORIZED</div>
                  <div className="text-xs text-navy-400">
                    Within {capsule.geoLocation.radius}m of {capsule.geoLocation.name || 'target coordinates'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="font-semibold text-blue-400">Blockchain Verification Complete</span>
          </div>
          <div className="text-sm text-navy-300 space-y-1">
            <p>✓ Smart contract access rules verified</p>
            <p>✓ Wallet signature authenticated</p>
            <p>✓ File integrity confirmed on IPFS</p>
            <p>✓ Ready for secure decryption</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={handleDownload}
            disabled={downloading || decrypting}
            className="btn-primary flex-1 text-lg py-4"
          >
            {decrypting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Decrypting...
              </>
            ) : downloading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download & Decrypt
              </>
            )}
          </button>
          <button 
            onClick={onClose}
            className="btn-secondary px-6"
          >
            Close
          </button>
        </div>

        {/* Footer Warning */}
        <div className="text-center mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            SECURITY NOTICE
          </div>
          <div className="text-xs text-navy-400 mt-1">
            This access event will be permanently recorded on the Aptos blockchain for audit compliance
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnlockModal;