import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Search, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingVendor, setDeletingVendor] = useState(false); 
  const [formData, setFormData] = useState({
    vendor_name: "",
    gst_number: "",
    license_number: "",
    address: "",
    primary_contact: "",
    contact_number: "",
    email_id: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const vendorsPerPage = 5;

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vendorToDeleteId, setVendorToDeleteId] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/vendors`);
      const result = await response.json();
      if (result.status === 1) {
        setVendors(result.data);
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
        description: "Failed to fetch vendors from the API.",
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

  const handleSaveVendor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let apiEndpoint = `${BASE_URL}/vendors`;
      let method = "POST";

      if (isEditing) {
        apiEndpoint = `${BASE_URL}/vendors/${editingId}`;
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
        fetchVendors();

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
        description: `Failed to ${isEditing ? 'update' : 'add'} vendor.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditVendor = (vendor) => {
    setIsEditing(true);
    setEditingId(vendor.vendor_id);
    setFormData({
      vendor_name: vendor.vendor_name || "",
      gst_number: vendor.gst_number || "",
      license_number: vendor.license_number || "",
      address: vendor.address || "",
      primary_contact: vendor.primary_contact || "",
      contact_number: vendor.contact_number || "",
      email_id: vendor.email_id || "",
    });
    setIsFormDialogOpen(true);
  };

  const handleDeleteVendor = async () => {
    if (!vendorToDeleteId) return;
    setDeletingVendor(true); 
    try {
      const response = await fetch(`${BASE_URL}/vendors/${vendorToDeleteId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.status === 1) {
        fetchVendors();
        // Show a green success toast
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
        description: "Failed to delete vendor.",
      });
    } finally {
      setDeletingVendor(false); 
      setShowDeleteConfirm(false);
      setVendorToDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      vendor_name: "",
      gst_number: "",
      license_number: "",
      address: "",
      primary_contact: "",
      contact_number: "",
      email_id: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const filteredVendors = vendors.filter((vendor) =>
    vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);
  const startIndex = (currentPage - 1) * vendorsPerPage;
  const endIndex = startIndex + vendorsPerPage;
  const currentVendors = filteredVendors.slice(startIndex, endIndex);

  return (
    <div className="p-6 bg-slate-100 min-h-screen font-inter">
      <Toaster />
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Vendor Management</h1>
            <p className="text-slate-600 mt-1">Manage your vendor information efficiently</p>
          </div>
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setIsEditing(false); resetForm(); setIsFormDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-lg transition-transform transform hover:scale-105">
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  {isEditing ? "Edit Vendor" : "Add Vendor"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveVendor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vendor_name">Vendor Name*</Label>
                    <Input id="vendor_name" placeholder="Full legal name" className="mt-1"
                      value={formData.vendor_name} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="gst_number">GST Number*</Label>
                    <Input id="gst_number" placeholder="GSTIN..." className="mt-1"
                      value={formData.gst_number} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="license_number">License Number*</Label>
                    <Input id="license_number" className="mt-1"
                      value={formData.license_number} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="address">Address*</Label>
                    <Textarea id="address" placeholder="Vendor address" className="mt-1"
                      value={formData.address} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="primary_contact">Primary Contact Name*</Label>
                    <Input id="primary_contact" placeholder="Name of primary contact" className="mt-1"
                      value={formData.primary_contact} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="contact_number">Contact Number*</Label>
                    <Input id="contact_number" placeholder="Phone/mobile" className="mt-1"
                      value={formData.contact_number} onChange={handleInputChange} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email_id">Email ID*</Label>
                    <Input id="email_id" type="email" placeholder="Contact email" className="mt-1"
                      value={formData.email_id} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full shadow-lg transition-transform transform hover:scale-105" disabled={loading}>
                    {loading ? (isEditing ? "Updating Vendor..." : "Adding Vendor...") : (isEditing ? "Update Vendor" : "Add Vendor")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-2xl font-bold text-slate-800">Vendors List</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search vendors..."
                  className="pl-10 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-48 text-slate-500 ">
                Loading vendors...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Vendor Name</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">GST Number</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">License Number</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Address</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Primary Contact</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Contact Number</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Email ID</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentVendors.length > 0 ? (
                        currentVendors.map((vendor) => (
                          <TableRow key={vendor.vendor_id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium text-slate-800">{vendor.vendor_name}</TableCell>
                            <TableCell>{vendor.gst_number}</TableCell>
                            <TableCell>{vendor.license_number}</TableCell>
                            <TableCell className="text-slate-600">{vendor.address}</TableCell>
                            <TableCell>{vendor.primary_contact}</TableCell>
                            <TableCell>{vendor.contact_number}</TableCell>
                            <TableCell>{vendor.email_id}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 transition-colors p-2"
                                  onClick={() => handleEditVendor(vendor)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 transition-colors p-2"
                                  onClick={() => {
                                    setVendorToDeleteId(vendor.vendor_id);
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
                          <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                            No vendors found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end mt-4">
                  <Pagination className="flex justify-end items-center gap-2 p-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          isActive={currentPage > 1}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink
                            href="#"
                            isActive={index + 1 === currentPage}
                            onClick={() => setCurrentPage(index + 1)}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          isActive={currentPage < totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this vendor? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteVendor} disabled={deletingVendor}>
              {deletingVendor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deletingVendor ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;
