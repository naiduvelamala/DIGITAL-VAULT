import { useState } from 'react';
import { Shield, Clock, MapPin, Search, Filter, BarChart3, Activity, Globe, AlertTriangle, Lock, User } from 'lucide-react';
import CapsuleCard from './CapsuleCard';

function Dashboard({ userLocation, onUnlock }) {
  // Mock data for demonstration
  const capsules = [
    {
      id: 1,
      title: "Operation Thunder Strike",
      description: "Classified battle plans and strategic documents for upcoming mission deployment",
      fileName: "battle_plans.pdf",
      fileSize: 2048576,
      fileType: "application/pdf",
      ipfsHash: "QmX7Y8Z9A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U",
      unlockTimestamp: Date.now() + 2 * 60 * 60 * 1000, // 2 hours from now
      hasGeoLock: true,
      geoLocation: {
        name: "Fort Bragg, NC",
        latitude: 35.1427,
        longitude: -79.0059,
        radius: 500
      },
      priority: "top-secret",
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000
    },
    {
      id: 2,
      title: "Intelligence Report Alpha-7",
      description: "Surveillance data from sector 7",
      fileName: "intel_report.pdf",
      fileSize: 1024000,
      fileType: "application/pdf",
      ipfsHash: "QmA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X",
      unlockTimestamp: Date.now() - 1000,
      hasGeoLock: false,
      priority: "classified",
      createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000
    },
    {
      id: 3,
      title: "Mission Briefing Delta",
      description: "Tactical briefing documents with embedded images and maps",
      fileName: "mission_briefing.pdf",
      fileSize: 5242880,
      fileType: "application/pdf",
      ipfsHash: "QmB3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y",
      unlockTimestamp: Date.now() + 6 * 60 * 60 * 1000, // 6 hours from now
      hasGeoLock: false,
      priority: "top-secret",
      createdAt: Date.now() - 3 * 60 * 60 * 1000
    }
  ];
  
  const loading = false;
  const error = '';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
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

  const filteredCapsules = capsules.filter(capsule => {
    const matchesSearch = capsule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capsule.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Priority filter
    if (filterPriority !== 'all' && capsule.priority !== filterPriority) return false;

    // Status filter
    if (filterStatus === 'all') return true;
    
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

    return filterStatus === 'unlocked' ? canUnlock : !canUnlock;
  });

  const stats = {
    total: capsules.length,
    locked: capsules.filter(c => {
      const isTimeUnlocked = Date.now() >= c.unlockTimestamp;
      const isGeoUnlocked = !c.hasGeoLock || (
        userLocation && 
        calculateDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          c.geoLocation.latitude, 
          c.geoLocation.longitude
        ) <= c.geoLocation.radius
      );
      return !(isTimeUnlocked && isGeoUnlocked);
    }).length,
    unlocked: capsules.filter(c => {
      const isTimeUnlocked = Date.now() >= c.unlockTimestamp;
      const isGeoUnlocked = !c.hasGeoLock || (
        userLocation && 
        calculateDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          c.geoLocation.latitude, 
          c.geoLocation.longitude
        ) <= c.geoLocation.radius
      );
      return isTimeUnlocked && isGeoUnlocked;
    }).length,
    topSecret: capsules.filter(c => c.priority === 'top-secret').length,
    classified: capsules.filter(c => c.priority === 'classified').length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">Command Dashboard</h1>
        <p className="text-navy-300">Monitor and access your secure time capsules</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-sm text-navy-400 uppercase tracking-wide">Total Capsules</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.locked}</div>
          <div className="text-sm text-navy-400 uppercase tracking-wide">Secured</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.unlocked}</div>
          <div className="text-sm text-navy-400 uppercase tracking-wide">Accessible</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.topSecret}</div>
          <div className="text-sm text-navy-400 uppercase tracking-wide">Top Secret</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Search operations, files, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-navy-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="min-w-32"
              >
                <option value="all">All Status</option>
                <option value="locked">Locked</option>
                <option value="unlocked">Unlocked</option>
              </select>
            </div>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="min-w-40"
            >
              <option value="all">All Classifications</option>
              <option value="standard">Unclassified</option>
              <option value="classified">Classified</option>
              <option value="top-secret">Top Secret</option>
            </select>
          </div>
        </div>
      </div>

      {/* Capsules Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Loading Operations...</h3>
          <p className="text-navy-400">Fetching capsules from Aptos blockchain</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Error Loading Operations</h3>
          <p className="text-navy-400">{error}</p>
        </div>
      ) : filteredCapsules.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-navy-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">
            {capsules.length === 0 ? 'No Operations Deployed' : 'No Results Found'}
          </h3>
          <p className="text-navy-400 max-w-md mx-auto">
            {capsules.length === 0 
              ? 'Deploy your first secure time capsule to begin classified operations.' 
              : 'Adjust your search criteria or classification filters to find specific operations.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCapsules.map((capsule) => (
            <CapsuleCard 
              key={capsule.id} 
              capsule={capsule} 
              userLocation={userLocation}
              onUnlock={onUnlock}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;