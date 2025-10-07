import { useState } from 'react';
import Header from './components/Header';
import WalletConnection from './components/WalletConnection';
import Dashboard from './components/Dashboard';
import CreateCapsule from './components/CreateCapsule';
import LocationStatus from './components/LocationStatus';
import { Shield, Plus, BarChart3 } from 'lucide-react';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [userLocation, setUserLocation] = useState(null);

  const connectWallet = async () => {
    try {
      // Mock wallet connection
      setIsConnected(true);
      setWalletAddress('0x1234567890abcdef1234567890abcdef12345678');
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
  };


  const handleCreateCapsule = () => {
    setCurrentView('dashboard');
  };


  const handleUnlockCapsule = (capsuleId) => {
    console.log('Capsule unlocked:', capsuleId);
  };

  if (!isConnected) {
    return <WalletConnection onConnect={connectWallet} />;
  }

  return (
    <div className="min-h-screen">
      <Header 
        isConnected={isConnected}
        walletAddress={walletAddress}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-80">
            <div className="space-y-6">
              {/* Navigation */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Command Center</h3>
                <nav className="space-y-2">
                  <button 
                    onClick={() => setCurrentView('dashboard')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                      currentView === 'dashboard' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'text-navy-300 hover:bg-navy-700/50 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    Operations Dashboard
                  </button>
                  <button 
                    onClick={() => setCurrentView('create')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                      currentView === 'create' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'text-navy-300 hover:bg-navy-700/50 hover:text-white'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    Deploy Capsule
                  </button>
                </nav>
              </div>

              {/* Location Status */}
              <LocationStatus onLocationUpdate={setUserLocation} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {currentView === 'dashboard' && (
              <Dashboard 
                userLocation={userLocation}
                onUnlock={handleUnlockCapsule}
              />
            )}
            
            {currentView === 'create' && (
              <CreateCapsule onCreateCapsule={handleCreateCapsule} />
            )}
          </div>
        </div>
      </main>

    </div>
  );
}

export default App;