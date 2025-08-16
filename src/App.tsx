
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import ProductCategories from "./pages/ProductCategories";
import ProductManagement from "./pages/ProductManagement";
import VendorManagement from "./pages/VendorManagement";
import CustomerManagement from "./pages/CustomerManagement";
import PurchaseManagement from "./pages/PurchaseManagement";
import SalesManagement from "./pages/SalesManagement";
import LoginReset from "./pages/LoginReset";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <SidebarProvider>
              <AdminLayout />
            </SidebarProvider>
          }>
            <Route index element={<Dashboard />} />
            <Route path="product-categories" element={<ProductCategories />} />
            <Route path="product-management" element={<ProductManagement />} />
            <Route path="vendor-management" element={<VendorManagement />} />
            <Route path="customer-management" element={<CustomerManagement />} />
            <Route path="purchase-management" element={<PurchaseManagement />} />
            <Route path="sales-management" element={<SalesManagement />} />
            <Route path="login-reset" element={<LoginReset />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
