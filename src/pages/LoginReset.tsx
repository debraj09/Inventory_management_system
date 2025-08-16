
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Key, Mail, User } from "lucide-react";

const LoginReset = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Login & Password Reset</h1>
        <p className="text-slate-600 mt-1">Manage user authentication and password recovery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Shield className="w-5 h-5 text-blue-600" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input id="username" placeholder="Enter username" className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input id="email" type="email" placeholder="Enter email address" className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="role">User Role</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Account Status</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Active / Suspended / Pending" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Create User</Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Key className="w-5 h-5 text-green-600" />
              Password Reset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resetEmail">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input id="resetEmail" type="email" placeholder="Enter email for password reset" className="pl-10" />
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">Send Reset Link</Button>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-slate-800 mb-3">Password Reset History</h4>
              <div className="space-y-2">
                {[
                  { email: "admin@example.com", date: "2024-01-15", status: "Completed" },
                  { email: "user@example.com", date: "2024-01-14", status: "Pending" },
                  { email: "manager@example.com", date: "2024-01-13", status: "Expired" },
                ].map((reset, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{reset.email}</p>
                      <p className="text-xs text-slate-500">{reset.date}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reset.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      reset.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {reset.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginReset;
