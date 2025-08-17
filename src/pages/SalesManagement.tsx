import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Calendar, Loader2 } from "lucide-react";
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

const SalesManagement = () => {
  // State for sales data
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingSale, setDeletingSale] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    customer_id: "",
    bill_no: "",
    total_sale_price: "",
    sale_date: new Date().toISOString().split('T')[0],
    delivery_date: "",
    delivery_by: "",
    payment_status: "pending",
    payment_type: "cash",
    payment_details: "",
    items: [{
      product_id: "",
      quantity: "",
      unit: "Pieces",
      rate: ""
    }]
  });

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 5;

  // Dialog states
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saleToDeleteId, setSaleToDeleteId] = useState(null);

  const { toast } = useToast();

  // Fetch data on component mount
  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchProducts();
  }, []);

  // Fetch sales from API
  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/sales/list`);
      const result = await response.json();
      if (result.status === 1) {
        setSales(result.data);
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
        description: "Failed to fetch sales from the API.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/customers/list`);
      const result = await response.json();
      if (result.status === 1) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/products/list`);
      const result = await response.json();
      if (result.status === 1) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handle item input changes
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  // Add new item row
  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        product_id: "",
        quantity: "",
        unit: "Pieces",
        rate: ""
      }]
    }));
  };

  // Remove item row
  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = [...formData.items];
      updatedItems.splice(index, 1);
      setFormData(prev => ({ ...prev, items: updatedItems }));
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    const total = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.rate || 0) * parseInt(item.quantity || 0));
    }, 0);
    setFormData(prev => ({ ...prev, total_sale_price: total.toFixed(2) }));
  };

  // Handle form submission
  const handleSaveSale = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const errors = [];
    if (!formData.customer_id) errors.push("Customer is required");
    if (!formData.bill_no) errors.push("Bill number is required");
    if (!formData.sale_date) errors.push("Sale date is required");
    if (!formData.delivery_date) errors.push("Delivery date is required");
    if (!formData.delivery_by) errors.push("Delivery person is required");
    if (!formData.payment_status) errors.push("Payment status is required");
    if (!formData.payment_type) errors.push("Payment type is required");
    
    formData.items.forEach((item, index) => {
      if (!item.product_id) errors.push(`Product is required for item ${index + 1}`);
      if (!item.quantity || isNaN(parseInt(item.quantity))) errors.push(`Valid quantity is required for item ${index + 1}`);
      if (!item.rate || isNaN(parseFloat(item.rate))) errors.push(`Valid rate is required for item ${index + 1}`);
    });

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
      const saleData = {
        customer_id: parseInt(formData.customer_id),
        bill_no: formData.bill_no,
        total_sale_price: parseFloat(formData.total_sale_price),
        sale_date: formData.sale_date,
        delivery_date: formData.delivery_date,
        delivery_by: formData.delivery_by,
        payment_status: formData.payment_status,
        payment_type: formData.payment_type,
        payment_details: formData.payment_details,
        items: formData.items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          unit: item.unit,
          rate: parseFloat(item.rate)
        }))
      };

      let apiEndpoint = `${BASE_URL}/sales/add`;
      let method = "POST";

      if (isEditing) {
        apiEndpoint = `${BASE_URL}/sales/update/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(apiEndpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(Array.isArray(result.message) ? result.message.join("\n") : result.message);
      }

      if (result.status === 1) {
        fetchSales();
        toast({
          title: "Success",
          description: result.message,
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
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} sale.`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit sale
  const handleEditSale = (sale) => {
    setIsEditing(true);
    setEditingId(sale.sale_id);
    setFormData({
      customer_id: sale.customer_id.toString(),
      bill_no: sale.bill_no,
      total_sale_price: sale.total_sale_price,
      sale_date: sale.sale_date.split('T')[0],
      delivery_date: sale.delivery_date.split('T')[0],
      delivery_by: sale.delivery_by,
      payment_status: sale.payment_status,
      payment_type: sale.payment_type,
      payment_details: sale.payment_details,
      items: sale.items.map(item => ({
        product_id: item.product_id.toString(),
        quantity: item.quantity.toString(),
        unit: item.unit,
        rate: item.rate.toString()
      }))
    });
    setIsFormDialogOpen(true);
  };

  // Handle delete sale
  const handleDeleteSale = async () => {
    if (!saleToDeleteId) return;
    setDeletingSale(true);
    try {
      const response = await fetch(`${BASE_URL}/sales/delete/${saleToDeleteId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.status === 1) {
        fetchSales();
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
        description: "Failed to delete sale.",
      });
    } finally {
      setDeletingSale(false);
      setShowDeleteConfirm(false);
      setSaleToDeleteId(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      customer_id: "",
      bill_no: "",
      total_sale_price: "",
      sale_date: new Date().toISOString().split('T')[0],
      delivery_date: "",
      delivery_by: "",
      payment_status: "pending",
      payment_type: "cash",
      payment_details: "",
      items: [{
        product_id: "",
        quantity: "",
        unit: "Pieces",
        rate: ""
      }]
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Filter sales based on search term
  const filteredSales = sales.filter(sale => {
    const customer = customers.find(c => c.customer_id === sale.customer_id);
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (customer?.company_name?.toLowerCase().includes(searchTermLower)) ||
      sale.bill_no?.toString().includes(searchTermLower) ||
      sale.payment_status?.toLowerCase().includes(searchTermLower)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSales.length / salesPerPage);
  const startIndex = (currentPage - 1) * salesPerPage;
  const endIndex = startIndex + salesPerPage;
  const currentSales = filteredSales.slice(startIndex, endIndex);

  // Helper function to get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.customer_id === customerId);
    return customer ? customer.company_name : "Unknown Customer";
  };

  // Helper function to get product name by ID
  const getProductName = (productId) => {
    const product = products.find(p => p.product_id === productId);
    return product ? product.product_name : "Unknown Product";
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen font-inter">
      <Toaster position="bottom-right" />
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header and Create Sale Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Sales Management</h1>
            <p className="text-slate-600 mt-1">Manage product sales to customers</p>
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
                Create Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-white rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  {isEditing ? "Edit Sale" : "Create Sale"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveSale} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Selection */}
                  <div>
                    <Label htmlFor="customer_id">Customer*</Label>
                    <Select 
                      value={formData.customer_id} 
                      onValueChange={(value) => setFormData({...formData, customer_id: value})}
                      required
                    >
                      <SelectTrigger className="mt-1" style={{color:'black'}}>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent style={{color:'black'}}>
                        {customers.map(customer => (
                          <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                            {customer.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Bill Number */}
                  <div>
                    <Label htmlFor="bill_no">Bill Number*</Label>
                    <Input 
                      id="bill_no"
                      type="text"
                      placeholder="Enter bill number"
                      className="mt-1"
                      value={formData.bill_no}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  {/* Sale Date */}
                  <div>
                    <Label htmlFor="sale_date">Sale Date*</Label>
                    <div className="relative mt-1">
                      <Input 
                        id="sale_date"
                        type="date"
                        className="pr-10"
                        value={formData.sale_date}
                        onChange={handleInputChange}
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Delivery Date */}
                  <div>
                    <Label htmlFor="delivery_date">Delivery Date*</Label>
                    <div className="relative mt-1">
                      <Input 
                        id="delivery_date"
                        type="date"
                        className="pr-10"
                        value={formData.delivery_date}
                        onChange={handleInputChange}
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Delivery By */}
                  <div>
                    <Label htmlFor="delivery_by">Delivery Person*</Label>
                    <Input 
                      id="delivery_by"
                      type="text"
                      placeholder="Enter delivery person name"
                      className="mt-1"
                      value={formData.delivery_by}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  {/* Payment Status */}
                  <div>
                    <Label htmlFor="payment_status">Payment Status*</Label>
                    <Select 
                      value={formData.payment_status} 
                      onValueChange={(value) => setFormData({...formData, payment_status: value})}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Payment Type */}
                  <div>
                    <Label htmlFor="payment_type">Payment Type*</Label>
                    <Select 
                      value={formData.payment_type} 
                      onValueChange={(value) => setFormData({...formData, payment_type: value})}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Payment Details */}
                  <div>
                    <Label htmlFor="payment_details">Payment Details</Label>
                    <Input 
                      id="payment_details"
                      type="text"
                      placeholder="Enter payment details"
                      className="mt-1"
                      value={formData.payment_details}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  {/* Total Sale Price */}
                  <div>
                    <Label htmlFor="total_sale_price">Total Sale Price</Label>
                    <Input 
                      id="total_sale_price"
                      type="number"
                      step="0.01"
                      placeholder="Calculated automatically"
                      className="mt-1"
                      value={formData.total_sale_price}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                </div>
                
                {/* Items Section */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Items</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addItemRow}
                    >
                      Add Item
                    </Button>
                  </div>
                  
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border rounded-lg">
                      {/* Product Selection */}
                      <div>
                        <Label>Product*</Label>
                        <Select 
                          value={item.product_id}
                          onValueChange={(value) => {
                            const updatedItems = [...formData.items];
                            updatedItems[index].product_id = value;
                            setFormData({...formData, items: updatedItems});
                          }}
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
                      
                      {/* Quantity */}
                      <div>
                        <Label>Quantity*</Label>
                        <Input 
                          name="quantity"
                          type="number"
                          placeholder="Quantity"
                          className="mt-1"
                          value={item.quantity}
                          onChange={(e) => {
                            handleItemChange(index, e);
                            calculateTotal();
                          }}
                          required
                        />
                      </div>
                      
                      {/* Unit */}
                      <div>
                        <Label>Unit*</Label>
                        <Select 
                          value={item.unit}
                          onValueChange={(value) => {
                            const updatedItems = [...formData.items];
                            updatedItems[index].unit = value;
                            setFormData({...formData, items: updatedItems});
                          }}
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
                      
                      {/* Rate */}
                      <div>
                        <Label>Rate*</Label>
                        <Input 
                          name="rate"
                          type="number"
                          step="0.01"
                          placeholder="Rate per unit"
                          className="mt-1"
                          value={item.rate}
                          onChange={(e) => {
                            handleItemChange(index, e);
                            calculateTotal();
                          }}
                          required
                        />
                      </div>
                      
                      {/* Remove Item Button */}
                      <div className="flex items-end">
                        {formData.items.length > 1 && (
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => {
                              removeItemRow(index);
                              calculateTotal();
                            }}
                            className="w-full"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      isEditing ? "Updating Sale..." : "Creating Sale..."
                    ) : (
                      isEditing ? "Update Sale" : "Create Sale"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sales Table */}
        <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-2xl font-bold text-slate-800">Sales List</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search sales..."
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
                Loading sales...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Bill No</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Customer</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Total Price</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Sale Date</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Delivery Date</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Payment Status</TableHead>
                        <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Payment Type</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentSales.length > 0 ? (
                        currentSales.map((sale) => (
                          <TableRow key={sale.sale_id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium text-slate-800">
                              {sale.bill_no}
                            </TableCell>
                            <TableCell>
                              {getCustomerName(sale.customer_id)}
                            </TableCell>
                            <TableCell>
                              ₹{sale.total_sale_price}
                            </TableCell>
                            <TableCell>
                              {sale.sale_date.split('T')[0]}
                            </TableCell>
                            <TableCell>
                              {sale.delivery_date.split('T')[0]}
                            </TableCell>
                            <TableCell>
                              {sale.payment_status}
                            </TableCell>
                            <TableCell>
                              {sale.payment_type}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 transition-colors p-2"
                                  onClick={() => handleEditSale(sale)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 transition-colors p-2"
                                  onClick={() => {
                                    setSaleToDeleteId(sale.sale_id);
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
                            No sales found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {filteredSales.length > 0 && (
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
            <p>Are you sure you want to delete this sale? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteSale} 
              disabled={deletingSale}
            >
              {deletingSale && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deletingSale ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesManagement;