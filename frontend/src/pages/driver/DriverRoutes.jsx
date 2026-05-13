import { useState, useEffect } from 'react';
import { Route, MapPin, Calendar, Users, Navigation } from 'lucide-react';
import { getMyDriverProfile } from '../../api/driver';
import axios from '../../api/axios';

export default function DriverRoutes() {
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [fullRoutes, setFullRoutes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError("");

      const profileRes = await getMyDriverProfile();
      if (profileRes.success && profileRes.data) {
        setDriver(profileRes.data);
        const assignedRouteIds = profileRes.data.assignedRoutes?.map(r => r.routeId) || [];

        if (assignedRouteIds.length > 0) {
          const routesRes = await axios.get('/routes');
          if (routesRes.data.success) {
            // Backend returns { content: [...], data: { routes: [...] } }
            const allRoutes = routesRes.data.content || routesRes.data.data?.routes || [];
            
            if (Array.isArray(allRoutes)) {
              const myFullRoutes = allRoutes.filter(r => assignedRouteIds.includes(r._id) || assignedRouteIds.includes(r.routeNumber));
              setFullRoutes(myFullRoutes);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError("Failed to load your routes.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">{error}</div>;
  }

  const assignedRoutes = driver?.assignedRoutes || [];

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Routes</h1>
        <p className="text-gray-500 mt-1">View your assigned collection routes and schedules.</p>
      </div>

      {assignedRoutes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Assigned Routes</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You currently have no active route assignments. When the transport manager assigns a route to you, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignedRoutes.map((route, idx) => {
            // Match basic route assignment with full route details if available
            const fullRoute = fullRoutes.find(r => r._id === route.routeId || r.routeNumber === route.routeId);
            
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{route.routeName}</h3>
                        <p className="text-sm font-medium text-emerald-600">Route #{route.routeId}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wide">
                      Active
                    </span>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <div className="flex items-start gap-3">
                      <Navigation className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Area</p>
                        <p className="text-sm text-gray-500">{fullRoute?.area || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Collection Days</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(fullRoute?.collectionDays?.length > 0 ? fullRoute.collectionDays : ['Not specified']).map(day => (
                            <span key={day} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Supplier Count</p>
                        <p className="text-sm text-gray-500">{fullRoute?.supplierCount || 0} stops</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    Assigned on {new Date(route.assignedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
