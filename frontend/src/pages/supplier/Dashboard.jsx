import { 
  Leaf, Users, Package, DollarSign, TrendingUp, TrendingDown,
  CheckCircle, Clock, AlertTriangle, ShoppingCart, BarChart3
} from 'lucide-react';

const StatCard = ({ title, value, change, trend }) => {
  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${
          title === 'Daily Production' ? 'bg-green-100' :
          title === 'Active Workers' ? 'bg-blue-100' :
          title === 'Inventory Stock' ? 'bg-orange-100' :
          'bg-purple-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            title === 'Daily Production' ? 'text-green-600' :
            title === 'Active Workers' ? 'text-blue-600' :
            title === 'Inventory Stock' ? 'text-orange-600' :
            'text-purple-600'
          }`} />
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${
          isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <TrendIcon className="w-3 h-3" />
          <span>{change}</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-gray-600 text-sm">{title}</p>
      </div>
    </div>
  );
};

const ProductionProgress = ({ name, current, target, color }) => {
  const percentage = (current / target) * 100;
  
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="font-medium text-gray-900">{name}</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium text-gray-600 w-16 text-right">
          {current}/{target} kg
        </span>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'completed': return CheckCircle;
      case 'inspection': return Clock;
      case 'alert': return AlertTriangle;
      case 'shipment': return ShoppingCart;
      default: return CheckCircle;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'inspection': return 'text-blue-600 bg-blue-100';
      case 'alert': return 'text-yellow-600 bg-yellow-100';
      case 'shipment': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.type);
        const colorClass = getActivityColor(activity.type);
        
        return (
          <div key={index} className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function SupplierDashboard() {
  const stats = [
    {
      title: 'Daily Production',
      value: '2,450 kg',
      change: '+12.5%',
      icon: Leaf,
      trend: 'up'
    },
    {
      title: 'Active Workers',
      value: '156',
      change: '+3.2%',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Inventory Stock',
      value: '18,750 kg',
      change: '-5.1%',
      icon: Package,
      trend: 'down'
    },
    {
      title: 'Monthly Revenue',
      value: '$45,230',
      change: '+18.7%',
      icon: DollarSign,
      trend: 'up'
    }
  ];

  const productionData = [
    { name: 'Green Tea', current: 850, target: 1000, color: 'bg-green-500' },
    { name: 'Black Tea', current: 720, target: 800, color: 'bg-gray-800' },
    { name: 'Oolong Tea', current: 450, target: 500, color: 'bg-orange-500' },
    { name: 'White Tea', current: 280, target: 300, color: 'bg-gray-300' }
  ];

  const recentActivities = [
    {
      title: 'Tea processing batch #234 completed',
      time: '5 minutes ago',
      type: 'completed'
    },
    {
      title: 'Quality inspection for Green Tea batch',
      time: '15 minutes ago',
      type: 'inspection'
    },
    {
      title: 'Low inventory alert: Black tea leaves',
      time: '1 hour ago',
      type: 'alert'
    },
    {
      title: 'Shipment #ST-2024-001 dispatched',
      time: '2 hours ago',
      type: 'shipment'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tea Factory Overview</h2>
        <p className="text-gray-600">Monitor your tea production and factory operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Production</h3>
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="space-y-4">
            {productionData.map((item, index) => (
              <ProductionProgress key={index} {...item} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          
          <RecentActivity activities={recentActivities} />
        </div>
      </div>
    </div>
  );
}