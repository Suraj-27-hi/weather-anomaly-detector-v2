import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Compass, MapPin, History } from 'lucide-react';
import { searchLocations } from '../api/geocodingApi';
import { INDIAN_STATES, POPULAR_WORLD_CITIES } from '../data/indianStatesData';

export default function LocationBar({
  currentLocation,
  onSelectLocation,
  onLocateMe,
  isLocating
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('weather_recent_searches');
      return stored ? JSON.parse(stored) : [
        { name: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946 },
        { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777 },
        { name: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 }
      ];
    } catch {
      return [];
    }
  });
  const searchContainerRef = useRef(null);

  // Common quick locations for the "Location" dropdown
  const quickLocations = [
    { name: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946 },
    { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777 },
    { name: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
    { name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707 },
    { name: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639 },
    { name: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lon: 78.4867 },
    { name: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873 },
    { name: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lon: 72.5714 }
  ];

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery || searchQuery.trim().length < 2) return;
    setIsSearching(true);
    const results = await searchLocations(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
    setIsOpen(true);
    if (results.length > 0) {
      handleSelect(results[0]);
    }
  };

  const saveToRecents = (item) => {
    if (!item || !item.name) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(p => p.name.toLowerCase() !== item.name.toLowerCase());
      const updated = [item, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSelect = (item) => {
    onSelectLocation(item);
    saveToRecents(item);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleLocationDropdownChange = (e) => {
    const city = e.target.value;
    const found = quickLocations.find(l => l.name === city);
    if (found) {
      onSelectLocation(found);
    }
  };

  const handleStateDropdownChange = (e) => {
    const stateName = e.target.value;
    const foundState = INDIAN_STATES.find(s => s.name === stateName);
    if (foundState) {
      onSelectLocation({
        name: foundState.capital,
        state: foundState.name,
        country: 'India',
        displayName: `${foundState.capital}, ${foundState.name}, India`,
        lat: foundState.lat,
        lon: foundState.lon
      });
    }
  };

  const isIndia = (currentLocation.country || '').toLowerCase().includes('india');

  return (
    <div className="w-full mb-4">
      {/* Top Row: Location & State Dropdowns matching Image 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2.5">
        
        {/* Location Dropdown */}
        <div className="flex flex-col">
          <label className="text-[11px] font-mono text-slate-300 mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-medium text-slate-300">Location</span>
          </label>
          <div className="relative">
            <select
              value={currentLocation.name || 'Bengaluru'}
              onChange={handleLocationDropdownChange}
              className="w-full appearance-none px-3.5 py-2.5 rounded-lg bg-[#07152b] border border-[#142a4a] focus:border-[#38bdf8] text-sm font-semibold text-slate-100 outline-none cursor-pointer pr-10 shadow-inner"
            >
              {quickLocations.map(l => (
                <option key={l.name} value={l.name} className="bg-[#040a16] text-white">
                  {l.name}, {l.state}
                </option>
              ))}
              {!quickLocations.some(l => l.name === currentLocation.name) && (
                <option value={currentLocation.name} className="bg-[#040a16] text-white">
                  {currentLocation.name}{currentLocation.state ? `, ${currentLocation.state}` : (currentLocation.country ? `, ${currentLocation.country}` : '')}
                </option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* State Dropdown */}
        <div className="flex flex-col">
          <label className="text-[11px] font-mono text-[#8ea4be] mb-1.5 flex items-center gap-1.5">
            <span className="text-[#38bdf8] text-xs">❖</span>
            <span className="font-medium text-[#8ea4be]">State</span>
          </label>
          <div className="relative">
            <select
              value={currentLocation.state || (isIndia ? 'Karnataka' : 'International')}
              onChange={handleStateDropdownChange}
              className="w-full appearance-none px-3.5 py-2.5 rounded-lg bg-[#07152b] border border-[#142a4a] focus:border-[#38bdf8] text-sm font-semibold text-slate-100 outline-none cursor-pointer pr-10 shadow-inner"
            >
              {!isIndia && (
                <option value="International" className="bg-[#040a16] text-[#38bdf8]">
                  {currentLocation.state ? `${currentLocation.state} (${currentLocation.country})` : `International (${currentLocation.country || 'Global'})`}
                </option>
              )}
              {isIndia && !INDIAN_STATES.some(s => s.name === currentLocation.state) && currentLocation.state && (
                <option value={currentLocation.state} className="bg-[#040a16] text-white">
                  {currentLocation.state}
                </option>
              )}
              <optgroup label="Indian States & UTs" className="bg-[#040a16] text-slate-400">
                {INDIAN_STATES.map(s => (
                  <option key={s.name} value={s.name} className="bg-[#040a16] text-white">
                    {s.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Bottom Search Row: Input with Search Button matching Image 3 */}
      <form onSubmit={handleManualSearch} className="relative flex items-center gap-2" ref={searchContainerRef}>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8ea4be] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setIsOpen(true);
            }}
            placeholder="Search another city or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#07152b] border border-[#142a4a] focus:border-[#38bdf8] text-sm text-slate-100 placeholder-[#5e7694] outline-none shadow-inner"
          />
        </div>

        {/* Solid Blue Search Button */}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-medium text-sm transition-all shadow-[0_0_12px_rgba(2,132,199,0.4)] whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Search</span>
          )}
        </button>

        {/* Search Results Dropdown */}
        {isOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-24 mt-1.5 py-1.5 rounded-lg bg-[#071426] border border-cyan-500/40 shadow-2xl z-50 max-h-60 overflow-y-auto">
            {searchResults.map((res, i) => (
              <button
                key={res.id || i}
                type="button"
                onClick={() => handleSelect(res)}
                className="w-full px-4 py-2 text-left hover:bg-cyan-950/40 flex items-start gap-2.5 text-xs text-slate-200 border-b border-slate-800 last:border-0"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white">{res.name}</span>
                  {res.state && <span className="text-slate-400">, {res.state}</span>}
                  <span className="text-slate-500"> ({res.country})</span>
                  <p className="text-[10px] text-slate-500 truncate">{res.displayName}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Recent Searches Chips */}
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-2 mt-2.5 text-xs font-mono">
          <span className="text-slate-400 text-[11px] flex items-center gap-1 shrink-0">
            <History className="w-3 h-3 text-[#38bdf8]" />
            Recent:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5">
            {recentSearches.map((rec, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(rec)}
                className="px-2.5 py-0.5 rounded bg-[#07152b] hover:bg-[#0c2347] border border-[#142a4a] hover:border-[#38bdf8] text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer"
              >
                {rec.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
