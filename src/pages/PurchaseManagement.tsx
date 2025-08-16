import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Upload, Calendar, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
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

const PurchaseManagement = () => {
  // State for purchases data
  const [purchases, setPurchases] = useState([]);
  
  // State for products dropdown
  const [products, setProducts] = useState([]);
  
  // State for vendors dropdown
  const [vendors, setVendors] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [deletingPurchase, setDeletingPurchase] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    unit: "Kg",
    vendor_id: "",
    purchase_date: "",
    unit_price: "",
    invoice_number: "",
    invoice_upload: null
  });
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const purchasesPerPage = 5;
  
  // Dialog states
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [purchaseToDeleteId, setPurchaseToDeleteId] = useState(null);
  
  // Toast notification hook
  const { toast } = useToast();

  // Fetch data on component mount
  useEffect(() => {
    fetchPurchases();
    fetchProducts();
    fetchVendors();
  }, []);

  // Fetch purchases from API
  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/purchases`);
      const result = await response.json();
      if (result.status === 1) {
        setPurchases(result.data);
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
        description: "Failed to fetch purchases from the API.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/products`);
      const result = await response.json();
      if (result.status === 1) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  // Fetch vendors for dropdown
  const fetchVendors = async () => {
    try {
      const response = await fetch(`${BASE_URL}/vendors`);
      const result = await response.json();
      if (result.status === 1) {
        setVendors(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle file upload changes
  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      invoice_upload: e.target.files[0]
    }));
  };

  // Handle form submission
  const handleSavePurchase = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    const errors = [];
    if (!formData.product_id) errors.push("Product is required");
    if (!formData.quantity || isNaN(parseFloat(formData.quantity))) errors.push("Valid quantity is required");
    if (!formData.unit) errors.push("Unit is required");
    if (!formData.unit_price || isNaN(parseFloat(formData.unit_price))) errors.push("Valid unit price is required");
    if (!formData.purchase_date) errors.push("Purchase date is required");
    if (!formData.vendor_id) errors.push("Vendor is required");
    if (!formData.invoice_number) errors.push("Invoice number is required");

    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errors.join("\n"),
      });
      return;
    }

    setLoading(true);
    try {
      // Create purchase data object matching Postman format
      const purchaseData = {
        product_id: parseInt(formData.product_id),
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        vendor_id: parseInt(formData.vendor_id),
        purchase_date: formData.purchase_date,
        unit_price: parseFloat(formData.unit_price),
        invoice_number: formData.invoice_number,
        // invoice_upload: "mmmmm" // Uncomment if you want to hardcode like Postman example
      };

      let apiEndpoint = `${BASE_URL}/purchases`;
      let method = "POST";

      if (isEditing) {
        apiEndpoint = `${BASE_URL}/purchases/${editingId}`;
        method = "PUT";
      }

      // Send request with JSON content type
      const response = await fetch(apiEndpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(Array.isArray(result.message) ? result.message.join("\n") : result.message);
      }
// toast({
//         title: "Success",
//         description: "Product category deleted successfully!",
//         className: "bg-green-500 text-white border-green-700"
//       });
      if (result.status === 1) {
        fetchPurchases();
        toast({
          title: "Success",
          description: result.message,
                  className: "bg-green-500 text-white border-green-700"

        });
        setIsFormDialogOpen(false);
        resetForm();
      } else {
        throw new Error(result.message || "Failed to process request");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.message || `Failed to ${isEditing ? 'update' : 'add'} purchase.`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit purchase
  const handleEditPurchase = (purchase) => {
    setIsEditing(true);
    setEditingId(purchase.purchase_id);
    setFormData({
      product_id: purchase.product_id.toString(),
      quantity: purchase.quantity.toString(),
      unit: purchase.unit,
      vendor_id: purchase.vendor_id.toString(),
      purchase_date: purchase.purchase_date.split('T')[0],
      unit_price: purchase.unit_price.toString(),
      invoice_number: purchase.invoice_number,
      invoice_upload: null
    });
    setIsFormDialogOpen(true);
  };

  // Handle delete purchase
  const handleDeletePurchase = async () => {
    if (!purchaseToDeleteId) return;
    setDeletingPurchase(true);
    try {
      const response = await fetch(`${BASE_URL}/purchases/${purchaseToDeleteId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.status === 1) {
        fetchPurchases();
        toast({
          title: "Success",
          description: result.message,
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
        description: "Failed to delete purchase.",
      });
    } finally {
      setDeletingPurchase(false);
      setShowDeleteConfirm(false);
      setPurchaseToDeleteId(null);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      product_id: "",
      quantity: "",
      unit: "Kg",
      vendor_id: "",
      purchase_date: "",
      unit_price: "",
      invoice_number: "",
      invoice_upload: null
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Filter purchases based on search term
  const filteredPurchases = purchases.filter(purchase => {
    const product = products.find(p => p.product_id === purchase.product_id);
    const vendor = vendors.find(v => v.vendor_id === purchase.vendor_id);
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (product?.product_name?.toLowerCase().includes(searchTermLower)) ||
      (vendor?.vendor_name?.toLowerCase().includes(searchTermLower)) ||
      purchase.invoice_number?.toLowerCase().includes(searchTermLower)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPurchases.length / purchasesPerPage);
  const startIndex = (currentPage - 1) * purchasesPerPage;
  const endIndex = startIndex + purchasesPerPage;
  const currentPurchases = filteredPurchases.slice(startIndex, endIndex);

  // Helper function to get product name by ID
  const getProductName = (productId) => {
    const product = products.find(p => p.product_id === productId);
    return product ? product.product_name : "Unknown Product";
  };

  // Helper function to get vendor name by ID
  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.vendor_id === vendorId);
    return vendor ? vendor.vendor_name : "Unknown Vendor";
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen font-inter">
      <Toaster position="bottom-right" />
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header and Add Purchase Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Purchase Management</h1>
            <p className="text-slate-600 mt-1">Manage product purchases from vendors</p>
          </div>
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { 
                  setIsEditing(false); 
                  resetForm(); 
                  setIsFormDialogOpen(true); 
                }} 
                className="bg-blue-600 hover:bg-blue-700 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  {isEditing ? "Edit Purchase" : "Add Purchase"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSavePurchase} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Selection */}
                  <div>
                    <Label htmlFor="product_id">Product*</Label>
                    <Select 
                      value={formData.product_id} 
                      onValueChange={(value) => setFormData({...formData, product_id: value})}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.product_id} value={product.product_id.toString()}>
                            {product.product_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Vendor Selection */}
                  <div>
                    <Label htmlFor="vendor_id">Vendor*</Label>
                    <Select 
                      value={formData.vendor_id} 
                      onValueChange={(value) => setFormData({...formData, vendor_id: value})}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map(vendor => (
                          <SelectItem key={vendor.vendor_id} value={vendor.vendor_id.toString()}>
                            {vendor.vendor_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Quantity Input */}
                  <div>
                    <Label htmlFor="quantity">Quantity*</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      step="0.01"
                      placeholder="Enter quantity" 
                      className="mt-1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  {/* Unit Selection */}
                  <div>
                    <Label htmlFor="unit">Unit*</Label>
                    <Select 
                      value={formData.unit} 
                      onValueChange={(value) => setFormData({...formData, unit: value})}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kg">Kg</SelectItem>
                        <SelectItem value="Litre">Litre</SelectItem>
                        <SelectItem value="Pack">Pack</SelectItem>
                        <SelectItem value="Pieces">Pieces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Unit Price Input */}
                  <div>
                    <Label htmlFor="unit_price">Unit Price*</Label>
                    <Input 
                      id="unit_price" 
                      type="number"
                      step="0.01"
                      placeholder="Enter unit price" 
                      className="mt-1"
                      value={formData.unit_price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  {/* Purchase Date Input */}
                  <div>
                    <Label htmlFor="purchase_date">Purchase Date*</Label>
                    <div className="relative mt-1">
                      <Input 
                        id="purchase_date" 
                        type="date" 
                        className="pr-10"
                        value={formData.purchase_date}
                        onChange={handleInputChange}
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Invoice Number Input */}
                  <div>
                    <Label htmlFor="invoice_number">Invoice Number*</Label>
                    <Input 
                      id="invoice_number" 
                      placeholder="Enter invoice number" 
                      className="mt-1"
                      value={formData.invoice_number}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  {/* Invoice Upload (Optional) */}
                  <div>
                    <Label htmlFor="invoice_upload">Invoice Upload</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Input 
                        id="invoice_upload" 
                        type="file" 
                        accept=".pdf,.jpg,.png" 
                        className="flex-1"
                        onChange={handleFileChange}
                      />
                      <Button variant="outline" size="icon" type="button">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">PDF or image format</p>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      isEditing ? "Updating Purchase..." : "Adding Purchase..."
                    ) : (
                      isEditing ? "Update Purchase" : "Add Purchase"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Purchases Table */}
        <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-2xl font-bold text-slate-800">Purchase List</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search purchases..."
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
                Loading purchases...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Product</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Vendor</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Quantity</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Unit</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Unit Price</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Purchase Date</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Invoice Number</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Invoice Upload</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPurchases.length > 0 ? (
                        currentPurchases.map((purchase) => (
                          <TableRow key={purchase.purchase_id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium text-slate-800">
                              {getProductName(purchase.product_id)}
                            </TableCell>
                            <TableCell>
                              {getVendorName(purchase.vendor_id)}
                            </TableCell>
                            <TableCell>
                              {purchase.quantity}
                            </TableCell>
                            <TableCell>
                              {purchase.unit}
                            </TableCell>
                            <TableCell>
                              ₹{purchase.unit_price}
                            </TableCell>
                            <TableCell>
                              {purchase.purchase_date}
                            </TableCell>
                            <TableCell>
                              {purchase.invoice_number}
                            </TableCell>
                            <TableCell className="text-blue-600 hover:underline cursor-pointer">
                              {purchase.invoice_upload ? (
                                <a 
                                  href={`${BASE_URL}/uploads/${purchase.invoice_upload}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  View Invoice
                                </a>
                              ) : "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 transition-colors p-2"
                                  onClick={() => handleEditPurchase(purchase)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 transition-colors p-2"
                                  onClick={() => {
                                    setPurchaseToDeleteId(purchase.purchase_id);
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
                          <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                            No purchases found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {filteredPurchases.length > 0 && (
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
            <p>Are you sure you want to delete this purchase? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeletePurchase} 
              disabled={deletingPurchase}
            >
              {deletingPurchase && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deletingPurchase ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseManagement;