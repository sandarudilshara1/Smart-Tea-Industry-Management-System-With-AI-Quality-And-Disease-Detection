import { useState, useEffect } from 'react';
import { 
  Leaf, Users, Package, DollarSign, TrendingUp, TrendingDown,
  CheckCircle, Clock, AlertTriangle, ShoppingCart, BarChart3, Weight, Banknote
} from 'lucide-react';
import axios from '../../api/axios';

const StatCard = ({ title, value, change, trend, icon: Icon, colorClass, bgColorClass, iconColorClass }) => {
  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColorClass || 'bg-blue-100'}`}>
          <Icon className={`w-6 h-6 ${iconColorClass || 'text-blue-600'}`} />
        </div>
        
        {change && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${
            isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <TrendIcon className="w-3 h-3" />
            <span>{change}</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-gray-600 text-sm">{title}</p>
      </div>
    </div>
  );
};

export default function SupplierDashboard() {
  const [loading, setLoading] = useState(true);
  const [supplierId, setSupplierId] = useState(null);
  const [stats, setStats] = useState({
    teaLeaf: { totalNetWeight: 0 },
    payments: { totalPaid: 0 },
    advances: { totalAdvances: 0 }
  });
  const [recentDeliveries, setRecentDeliveries] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Get my supplier profile — no auto-linking (security: never link to a random supplier)
      const profileRes = await axios.get('/suppliers/me');

      if (profileRes.data.success && profileRes.data.data) {
        const id = profileRes.data.data._id;
        setSupplierId(id);

        // 2. Get Statistics
        try {
          const statsRes = await axios.get(`/suppliers/${id}/statistics`);
          if (statsRes.data.success) {
            setStats(statsRes.data.data);
          }
        } catch (statsErr) {
          console.warn('Could not load statistics:', statsErr.message);
        }

        // 3. Get Recent Deliveries
        try {
          const deliveriesRes = await axios.get(`/tea-leaf-entries/supplier/${id}?limit=5`);
          if (deliveriesRes.data.success) {
            setRecentDeliveries(deliveriesRes.data.content || deliveriesRes.data.data || deliveriesRes.data);
          }
        } catch (delErr) {
          console.warn('Could not load deliveries:', delErr.message);
        }
      }
    } catch (error) {
      console.error('Error fetching supplier dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Leaves Supplied',
      value: `${stats.teaLeaf?.totalNetWeight?.toLocaleString() || 0} kg`,
      icon: Weight,
      bgColorClass: 'bg-green-50',
      iconColorClass: 'text-green-600'
    },
    {
      title: 'Total Accrued Earnings',
      value: `Rs. ${(stats.totalAccrued || 0).toLocaleString()}`,
      icon: DollarSign,
      bgColorClass: 'bg-blue-50',
      iconColorClass: 'text-blue-600'
    },
    {
      title: 'Total Paid to Date',
      value: `Rs. ${(stats.totalPaid || 0).toLocaleString()}`,
      icon: Banknote,
      bgColorClass: 'bg-emerald-50',
      iconColorClass: 'text-emerald-600'
    },
    {
      title: 'Pending Balance',
      value: `Rs. ${(stats.pendingPayment || 0).toLocaleString()}`,
      icon: Clock,
      bgColorClass: 'bg-amber-50',
      iconColorClass: 'text-amber-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-green-600"></div>
      </div>
    );
  }

  if (!supplierId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Profile Not Found</h2>
          <p className="text-gray-600 mt-2">Your user account is not linked to a registered supplier profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Supplier Dashboard</h2>
        <p className="text-gray-600">Monitor your tea leaf supply, payments, and account status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Deliveries */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Deliveries</h3>
            <Leaf className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="space-y-4">
            {recentDeliveries && recentDeliveries.length > 0 ? (
              recentDeliveries.slice(0, 5).map((delivery, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <span className="font-medium text-gray-900 block">{new Date(delivery.date).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-500">Quality: {delivery.qualityGrade || 'Pending'}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{delivery.netWeight} kg</div>
                    <div className="text-xs text-gray-500">Rs. {delivery.netAmount}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                No recent deliveries found.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quick Information</h3>
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Next Payment Cycle</h4>
                <p className="text-sm text-blue-700 mt-1">Your next payment will be calculated at the end of the current month and disbursed in the first week of the following month.</p>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900">Quality Bonus</h4>
                <p className="text-sm text-green-700 mt-1">Maintain an average quality grade of 'A' across the month to qualify for the 5% quality premium bonus on your total payout.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}