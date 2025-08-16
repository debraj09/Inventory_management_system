
import { 
  Package, 
  Tags, 
  Users, 
  UserCheck, 
  ShoppingCart, 
  TrendingUp,
  Shield,
  LayoutDashboard
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Product Categories", url: "/product-categories", icon: Tags },
  { title: "Product Management", url: "/product-management", icon: Package },
  { title: "Vendor Management", url: "/vendor-management", icon: Users },
  { title: "Customer Management", url: "/customer-management", icon: UserCheck },
  { title: "Purchase Management", url: "/purchase-management", icon: ShoppingCart },
  { title: "Sales Management", url: "/sales-management", icon: TrendingUp },
  { title: "Login & Password Reset", url: "/login-reset", icon: Shield },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClass = (isActiveRoute: boolean) =>
    isActiveRoute 
      ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600" 
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Admin Portal</h2>
              <p className="text-xs text-slate-500">Inventory Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 font-medium px-4">
            {!isCollapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-none transition-all duration-200 ${getNavClass(isActive(item.url))}`}
                    >
                      <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
