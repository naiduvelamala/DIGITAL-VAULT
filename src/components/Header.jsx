import { Shield, User, LogOut, Lock } from 'lucide-react';

function Header({ isConnected, walletAddress, onConnect, onDisconnect }) {
  return (
    <header className="glass border-b border-navy-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center glow">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Digital Vault</h1>
              <p className="text-xs text-navy-400 uppercase tracking-wider">Military Grade Security</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-4">
                <div className="glass px-4 py-2 rounded-xl border border-navy-600">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-navy-400 uppercase tracking-wide">Connected</div>
                      <div className="text-sm font-mono text-white">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onDisconnect}
                  className="btn-secondary"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={onConnect}
                className="btn-primary text-lg px-8 py-4"
              >
                <Lock className="w-5 h-5" />
                Connect Petra Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;