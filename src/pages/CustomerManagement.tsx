import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Search, Loader2 ,Plus} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "https://inventory-management-cb.vercel.app/api/v1";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    address: "",
    email_id: "",
    gst_number: "",
    primary_contact: "",
    contact_number: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/customers`);
      const result = await response.json();
      if (result.status === 1) {
        setCustomers(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error!",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to fetch customers from the API.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.primary_contact || !formData.contact_number || !formData.email_id) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill out all mandatory fields marked with *.",
      });
      return;
    }

    setLoading(true);
    try {
      let apiEndpoint = `${BASE_URL}/customers`;
      let method = "POST";

      if (isEditing) {
        apiEndpoint = `${BASE_URL}/customers/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(apiEndpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.status === 1) {
        fetchCustomers();
        toast({
          title: "Success",
          description: result.message,
          className: "bg-green-500 text-white border-green-500",

        });
        setIsFormDialogOpen(false);
        resetForm();
      } else {
        toast({
          variant: "destructive",
          title: "Error!",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: `Failed to ${isEditing ? 'update' : 'add'} customer.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = (customer) => {
    setIsEditing(true);
    setEditingId(customer.customer_id);
    setFormData({
      customer_name: customer.customer_name || "",
      address: customer.address || "",
      email_id: customer.email_id || "",
      gst_number: customer.gst_number || "",
      primary_contact: customer.primary_contact || "",
      contact_number: customer.contact_number || "",
    });
    setIsFormDialogOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDeleteId) return;
    setDeletingCustomer(true);
    try {
      const response = await fetch(`${BASE_URL}/customers/${customerToDeleteId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.status === 1) {
        fetchCustomers();
        toast({
          title: "Success",
          description: result.message,
          className: "bg-green-500 text-white border-green-500",

        });
      } else {
        toast({
          variant: "destructive",
          title: "Error!",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to delete customer.",
      });
    } finally {
      setDeletingCustomer(false);
      setShowDeleteConfirm(false);
      setCustomerToDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: "",
      address: "",
      email_id: "",
      gst_number: "",
      primary_contact: "",
      contact_number: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // FIX: Added a check for `customer.customer_name` to prevent the "Cannot read properties of undefined" error.
  const filteredCustomers = customers.filter((customer) =>
    (customer.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
  const startIndex = (currentPage - 1) * customersPerPage;
  const endIndex = startIndex + customersPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  return (
    <div className="p-6 bg-slate-100 min-h-screen font-inter">
      <Toaster position="bottom-right" />
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Customer Management</h1>
            <p className="text-slate-600 mt-1">Manage your customer information efficiently</p>
          </div>
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setIsEditing(false); resetForm(); setIsFormDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  {isEditing ? "Edit Customer" : "Add Customer"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveCustomer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Customer Name*</Label>
                    <Input id="customer_name" placeholder="Full legal customer name" className="mt-1"
                      value={formData.customer_name} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="gst_number">GST Number</Label>
                    <Input id="gst_number" placeholder="GSTIN..." className="mt-1"
                      value={formData.gst_number} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="primary_contact">Primary Contact*</Label>
                    <Input id="primary_contact" placeholder="Name of primary contact" className="mt-1"
                      value={formData.primary_contact} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="contact_number">Contact Number*</Label>
                    <Input id="contact_number" placeholder="Primary contact number" className="mt-1"
                      value={formData.contact_number} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="email_id">Email ID*</Label>
                    <Input id="email_id" type="email" placeholder="Primary contact email" className="mt-1"
                      value={formData.email_id} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" placeholder="Customer address" className="mt-1"
                      value={formData.address} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full" disabled={loading}>
                    {loading ? (isEditing ? "Updating Customer..." : "Adding Customer...") : (isEditing ? "Update Customer" : "Add Customer")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-2xl font-bold text-slate-800">Customers List</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search customers..."
                  className="pl-10 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-48 text-slate-500">
                Loading customers...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Customer Name</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">GST Number</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Primary Contact</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Contact Number</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Email ID</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Address</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCustomers.length > 0 ? (
                        currentCustomers.map((customer) => (
                          <TableRow key={customer.customer_id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium text-slate-800">{customer.customer_name}</TableCell>
                            <TableCell>{customer.gst_number}</TableCell>
                            <TableCell>{customer.primary_contact}</TableCell>
                            <TableCell>{customer.contact_number}</TableCell>
                            <TableCell>{customer.email_id}</TableCell>
                            <TableCell className="text-slate-600">{customer.address}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 transition-colors p-2"
                                  onClick={() => handleEditCustomer(customer)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 transition-colors p-2"
                                  onClick={() => {
                                    setCustomerToDeleteId(customer.customer_id);
                                    setShowDeleteConfirm(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                            No customers found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {filteredCustomers.length > 0 && (
                  <div className="flex justify-end mt-4">
                    <Pagination className="flex justify-end items-center gap-2 p-4">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            isActive={currentPage > 1}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={page === currentPage}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            isActive={currentPage < totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCustomer} disabled={deletingCustomer}>
              {deletingCustomer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deletingCustomer ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
