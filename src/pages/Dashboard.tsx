
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { title: "Total Products", value: "1,234", icon: Package, color: "bg-blue-500", change: "+12%" },
    { title: "Total Customers", value: "567", icon: Users, color: "bg-green-500", change: "+8%" },
    { title: "Total Orders", value: "890", icon: ShoppingCart, color: "bg-purple-500", change: "+15%" },
    { title: "Revenue", value: "$45,678", icon: DollarSign, color: "bg-orange-500", change: "+22%" },
    { title: "Low Stock", value: "23", icon: AlertTriangle, color: "bg-red-500", change: "-5%" },
    { title: "Growth", value: "18.5%", icon: TrendingUp, color: "bg-cyan-500", change: "+3%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome to your inventory management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-slate-800">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New product added", item: "iPhone 15 Pro", time: "2 mins ago" },
                { action: "Customer registered", item: "John Doe", time: "15 mins ago" },
                { action: "Order completed", item: "Order #1234", time: "1 hour ago" },
                { action: "Stock updated", item: "Samsung Galaxy", time: "2 hours ago" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.item}</p>
                  </div>
                  <span className="text-xs text-slate-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-slate-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Add Product", icon: Package, color: "bg-blue-500" },
                { title: "New Customer", icon: Users, color: "bg-green-500" },
                { title: "Create Order", icon: ShoppingCart, color: "bg-purple-500" },
                { title: "View Reports", icon: TrendingUp, color: "bg-orange-500" },
              ].map((action, index) => (
                <button
                  key={index}
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all duration-200 group"
                >
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">{action.title}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
