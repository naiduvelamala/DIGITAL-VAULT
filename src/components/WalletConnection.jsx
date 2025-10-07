import { Shield, Lock, CheckCircle, AlertTriangle, Zap, Globe, Clock } from 'lucide-react';

function WalletConnection({ onConnect }) {
  const mockPetraInstalled = true;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full animate-slide-in">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 glow">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Digital Vault</h1>
          <p className="text-xl text-navy-300 mb-2">Military Grade Security Platform</p>
          <p className="text-navy-400">Secure • Decentralized • Time-Locked</p>
        </div>

        {/* Main Card */}
        <div className="card space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Secure Access Required</h2>
            <p className="text-navy-300">
              Connect your Petra wallet to access classified time capsules
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-navy-700 rounded-xl">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-xs text-navy-300 font-medium">Time Lock</div>
            </div>
            <div className="text-center p-4 bg-navy-700 rounded-xl">
              <Globe className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-xs text-navy-300 font-medium">Geo Lock</div>
            </div>
            <div className="text-center p-4 bg-navy-700 rounded-xl">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-xs text-navy-300 font-medium">Blockchain</div>
            </div>
          </div>

          {/* Connection Status */}
          {mockPetraInstalled ? (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-green-400 font-medium">Petra Wallet Detected</div>
                    <div className="text-sm text-navy-400">Ready for secure connection</div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onConnect}
                className="btn-primary w-full text-lg py-4"
              >
                <Shield className="w-6 h-6" />
                Connect to Digital Vault
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div>
                    <div className="text-red-400 font-medium">Petra Wallet Required</div>
                    <div className="text-sm text-navy-400">Install wallet to continue</div>
                  </div>
                </div>
              </div>
              
              <a 
                href="https://petra.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary w-full text-lg py-4 block text-center"
              >
                <Shield className="w-6 h-6" />
                Install Petra Wallet
              </a>
            </div>
          )}

          {/* Security Features */}
          <div className="pt-6 border-t border-navy-600">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Security Protocol</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-navy-700/50 rounded-lg">
                <Lock className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-white">AES-256 Encryption</div>
                  <div className="text-xs text-navy-400">Military-grade file encryption</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-navy-700/50 rounded-lg">
                <Shield className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-sm font-medium text-white">Blockchain Verification</div>
                  <div className="text-xs text-navy-400">Tamper-proof access control</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-navy-700/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium text-white">Zero-Knowledge Architecture</div>
                  <div className="text-xs text-navy-400">Complete privacy protection</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="text-sm text-navy-400 mb-2">Powered by Aptos Blockchain</div>
          <div className="text-xs text-navy-500">
            Classification Level: UNCLASSIFIED // FOR OFFICIAL USE ONLY
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletConnection;