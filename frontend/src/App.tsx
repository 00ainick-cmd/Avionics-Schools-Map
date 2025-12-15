import { useState, useEffect, useCallback } from 'react';
import MapView from './components/MapView';
import FilterPanel from './components/FilterPanel';
import CSVUploader from './components/CSVUploader';
import { schoolsApi, militaryApi, aeaApi } from './services/api';
import type { School, MilitaryBase, AEAMember, EntityType } from './types';
import './index.css';

// Distance calculation using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface ReferencePoint {
  lat: number;
  lng: number;
  label: string;
}

function App() {
  // Data state
  const [schools, setSchools] = useState<School[]>([]);
  const [militaryBases, setMilitaryBases] = useState<MilitaryBase[]>([]);
  const [aeaMembers, setAEAMembers] = useState<AEAMember[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    entityTypes: ['school', 'military', 'aea'] as EntityType[],
    schoolTypes: [] as School['type'][],
    searchQuery: '',
  });

  // Proximity search state
  const [referencePoint, setReferencePoint] = useState<ReferencePoint | null>(null);
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null); // in miles
  const [locationSearch, setLocationSearch] = useState('');
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [schoolsData, militaryData, aeaData] = await Promise.all([
        schoolsApi.getAll(),
        militaryApi.getAll(),
        aeaApi.getAll(),
      ]);
      setSchools(schoolsData);
      setMilitaryBases(militaryData);
      setAEAMembers(aeaData);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load data. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Geocode address to coordinates
  const geocodeAddress = async (address: string) => {
    setIsGeolocating(true);
    setGeoError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=us`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setReferencePoint({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          label: data[0].display_name.split(',').slice(0, 3).join(','),
        });
        setLocationSearch('');
      } else {
        setGeoError('Location not found. Try a city, state, or zip code.');
      }
    } catch (err) {
      setGeoError('Failed to search location. Please try again.');
    } finally {
      setIsGeolocating(false);
    }
  };

  // Use browser geolocation
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }
    setIsGeolocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setReferencePoint({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'My Location',
        });
        setIsGeolocating(false);
      },
      () => {
        setGeoError('Unable to get your location. Please check permissions.');
        setIsGeolocating(false);
      }
    );
  };

  // Calculate counts
  const counts = {
    schools: schools.length,
    military: militaryBases.length,
    aea: aeaMembers.length,
  };

  // Add distance to entities if reference point is set
  const schoolsWithDistance = referencePoint
    ? schools.map(s => ({
        ...s,
        distance: s.latitude && s.longitude
          ? calculateDistance(referencePoint.lat, referencePoint.lng, s.latitude, s.longitude)
          : null,
      }))
    : schools.map(s => ({ ...s, distance: null as number | null }));

  const militaryWithDistance = referencePoint
    ? militaryBases.map(b => ({
        ...b,
        distance: b.latitude && b.longitude
          ? calculateDistance(referencePoint.lat, referencePoint.lng, b.latitude, b.longitude)
          : null,
      }))
    : militaryBases.map(b => ({ ...b, distance: null as number | null }));

  const aeaWithDistance = referencePoint
    ? aeaMembers.map(a => ({
        ...a,
        distance: a.latitude && a.longitude
          ? calculateDistance(referencePoint.lat, referencePoint.lng, a.latitude, a.longitude)
          : null,
      }))
    : aeaMembers.map(a => ({ ...a, distance: null as number | null }));

  // Filter by radius if set
  const filteredSchools = radiusFilter
    ? schoolsWithDistance.filter(s => s.distance !== null && s.distance <= radiusFilter)
    : schoolsWithDistance;

  const filteredMilitary = radiusFilter
    ? militaryWithDistance.filter(b => b.distance !== null && b.distance <= radiusFilter)
    : militaryWithDistance;

  const filteredAEA = radiusFilter
    ? aeaWithDistance.filter(a => a.distance !== null && a.distance <= radiusFilter)
    : aeaWithDistance;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg">
        <div className="max-w-full mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AEA Membership & Aviation Schools Map</h1>
              <p className="text-blue-200 text-sm">
                Find aviation schools, military bases, and AEA member shops near you
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-900 rounded-lg text-sm font-medium transition-colors"
              >
                {showHelp ? 'Hide Help' : 'How to Use'}
              </button>
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
              >
                {showUploader ? 'Hide Upload' : 'Upload Data'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Welcome to the AEA Map Tool</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-blue-800 mb-2">For Schools</h3>
                <p className="text-sm text-gray-600">
                  Find AEA member shops near your institution for student placement,
                  partnerships, and equipment sourcing. Use the proximity search to
                  discover shops within your desired radius.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-green-800 mb-2">For AEA Member Shops</h3>
                <p className="text-sm text-gray-600">
                  Locate aviation schools and programs in your area to build recruitment
                  pipelines, establish internship programs, and connect with emerging talent.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-purple-800 mb-2">For Students & Job Seekers</h3>
                <p className="text-sm text-gray-600">
                  Explore education options and potential employers in your area.
                  Enter your location to see what schools and shops are nearby,
                  then click markers for contact information.
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <strong>Quick Tips:</strong> Use "Find My Location" or search by city/zip to center the map on you.
              Then select a radius to filter results by distance. Click any marker to view details and contact info.
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto p-4">
          {/* Location Search */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Find Near You</h2>

            <div className="space-y-3">
              <button
                onClick={useMyLocation}
                disabled={isGeolocating}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGeolocating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Locating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use My Location
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-xs text-gray-500">or search</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && locationSearch && geocodeAddress(locationSearch)}
                  placeholder="City, State or Zip..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => locationSearch && geocodeAddress(locationSearch)}
                  disabled={!locationSearch || isGeolocating}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                >
                  Go
                </button>
              </div>

              {geoError && (
                <p className="text-sm text-red-600">{geoError}</p>
              )}

              {referencePoint && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-green-700 font-medium">Searching from:</p>
                      <p className="text-sm text-green-900">{referencePoint.label}</p>
                    </div>
                    <button
                      onClick={() => {
                        setReferencePoint(null);
                        setRadiusFilter(null);
                      }}
                      className="text-green-700 hover:text-green-900"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Radius Filter */}
              {referencePoint && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance Radius
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[25, 50, 100, 250, null].map((radius) => (
                      <button
                        key={radius ?? 'all'}
                        onClick={() => setRadiusFilter(radius)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          radiusFilter === radius
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {radius ? `${radius} mi` : 'All'}
                      </button>
                    ))}
                  </div>
                  {radiusFilter && (
                    <p className="text-xs text-gray-500 mt-2">
                      Showing {filteredSchools.length + filteredMilitary.length + filteredAEA.length} locations
                      within {radiusFilter} miles
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CSV Uploader */}
          {showUploader && (
            <CSVUploader onUploadSuccess={fetchData} />
          )}

          {/* Filters */}
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            counts={counts}
          />
        </aside>

        {/* Map Area */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="text-gray-600">Loading map data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-8">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                <svg className="h-16 w-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="space-y-2 text-sm text-gray-500 text-left bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="font-medium">Quick Fix:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open a terminal in the project folder</li>
                    <li>Run: <code className="bg-gray-200 px-1 rounded">cd backend && npm run dev</code></li>
                    <li>Wait for "Server running on port 3001"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
                <button
                  onClick={fetchData}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : (
            <MapView
              schools={filteredSchools}
              militaryBases={filteredMilitary}
              aeaMembers={filteredAEA}
              filters={filters}
              referencePoint={referencePoint}
            />
          )}

          {/* Stats Overlay */}
          {!loading && !error && (
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg px-4 py-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span>{filteredSchools.length} Schools</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span>{filteredMilitary.length} Military</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span>{filteredAEA.length} AEA Members</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
