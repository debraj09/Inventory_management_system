import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search } from "lucide-react";
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
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "https://inventory-management-cb.vercel.app/api/v1";

const MOCK_CATEGORIES = [
  { category_id: 1, category_name: "Electronics" },
  { category_id: 2, category_name: "Clothing" },
  { category_id: 3, category_name: "Books" },
];

const ProductManagement = () => {
  const { toast } = useToast();
  const [allProducts, setAllProducts] = useState([]);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [productCategories, setProductCategories] = useState(MOCK_CATEGORIES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    category_id: "",
    sku_number: "",
    product_description: "",
    product_specification: "",
    product_weight: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // New state for delete button loading

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const productsResponse = await axios.get(`${BASE_URL}/products`);
      if (productsResponse.data.status === 1) {
        setAllProducts(productsResponse.data.data);
      } else {
        toast({
          title: "Error",
          description: `Failed to fetch products: ${productsResponse.data.error}`,
          variant: "destructive",
        });
      }

      const categoriesResponse = await axios.get(`${BASE_URL}/product-categories`);
      if (categoriesResponse.data.status === 1) {
        setProductCategories(categoriesResponse.data.data);
      } else {
        toast({
          title: "Error",
          description: `Failed to fetch categories: ${categoriesResponse.data.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("API call failed:", error);
      toast({
        title: "Network Error",
        description: "Failed to connect to the API. Please check your network.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const filteredProducts = allProducts.filter(product =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category_name && product.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (currentPage !== 1 && searchTerm !== "") {
        setCurrentPage(1);
    }
    
    setIsPageLoading(true);
    setTimeout(() => {
      const indexOfLastProduct = currentPage * productsPerPage;
      const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
      setCurrentProducts(filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct));
      setIsPageLoading(false);
    }, 300);

  }, [allProducts, currentPage, productsPerPage, searchTerm]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "product_weight") {
      setNewProduct(prevState => ({
        ...prevState,
        [id]: parseFloat(value) || ""
      }));
    } else {
      setNewProduct(prevState => ({ ...prevState, [id]: value }));
    }
  };

  const handleSelectChange = (value) => {
    setNewProduct(prevState => ({ ...prevState, category_id: parseInt(value) }));
  };

  const resetForm = () => {
    setNewProduct({
      product_name: "",
      category_id: "",
      sku_number: "",
      product_description: "",
      product_specification: "",
      product_weight: "",
    });
    setIsEditing(false);
    setIsDialogOpen(false);
  }

  const handleSaveProduct = async () => {
    setIsSaving(true);
    try {
      if (!newProduct.product_name || !newProduct.category_id) {
        toast({
          title: "Validation Error",
          description: "Product name and category are required.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      let response;
      if (isEditing) {
        const payload = {
          product_name: newProduct.product_name,
          category_id: newProduct.category_id,
          sku_number: newProduct.sku_number,
          product_description: newProduct.product_description,
          product_specification: newProduct.product_specification,
          product_weight: newProduct.product_weight ? parseFloat(newProduct.product_weight) : undefined
        };
        const { product_id } = newProduct;
        response = await axios.put(`${BASE_URL}/products/${product_id}`, payload);
      } else {
        response = await axios.post(`${BASE_URL}/products`, newProduct);
      }

      if (response.data.status === 1) {
        toast({
          title: "Success",
          description: response.data.message,
          className: "bg-green-500 text-white border-green-500",
        });
        await fetchAllProducts(); 
        setCurrentPage(1);
        resetForm();
      } else {
        toast({
          title: "API Error",
          description: response.data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to the API to save the product.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (productId) => {
    setProductToDeleteId(productId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDeleteId) return;

    setIsDeleting(true); // Set deleting state to true
    try {
      const response = await axios.delete(`${BASE_URL}/products/${productToDeleteId}`);
      if (response.data.status === 1) {
        toast({
          title: "Success",
          description: response.data.message,
          className: "bg-green-500 text-white border-green-500",
        });
        fetchAllProducts();
        setProductToDeleteId(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast({
          title: "API Error",
          description: response.data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to the API to delete the product.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false); // Set deleting state to false
    }
  };

  const handleEditClick = (product) => {
    setNewProduct(product);
    setIsEditing(true);
    setIsDialogOpen(true);
  };
  
  const filteredProductsCount = allProducts.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category_name && product.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  ).length;

  const totalPages = Math.ceil(filteredProductsCount / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6 p-4 md:p-8 bg-slate-100 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Product Management</h1>
          <p className="text-slate-600 mt-1">Manage your product inventory</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg" onClick={() => {resetForm(); setIsDialogOpen(true);}}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_name">Product Name*</Label>
                <Input
                  id="product_name"
                  placeholder="e.g., Lays"
                  className="mt-1"
                  value={newProduct.product_name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="category_id">Product Category*</Label>
                <Select onValueChange={handleSelectChange} value={newProduct.category_id ? newProduct.category_id.toString() : ""}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map(category => (
                      <SelectItem key={category.category_id} value={category.category_id.toString()}>
                        {category.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="product_description">Product Description*</Label>
                <Textarea
                  id="product_description"
                  placeholder="e.g., Crunchy potato chips"
                  className="mt-1"
                  value={newProduct.product_description}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="product_specification">Product Specification*</Label>
                <Textarea
                  id="product_specification"
                  placeholder="e.g., 50g bag, Salted flavor"
                  className="mt-1"
                  value={newProduct.product_specification}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="sku_number">SKU Number*</Label>
                <Input
                  id="sku_number"
                  placeholder="e.g., SMART-LAYS-2024-001"
                  className="mt-1"
                  value={newProduct.sku_number}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="product_weight">Product Weight*</Label>
                <Input
                  id="product_weight"
                  type="number"
                  placeholder="e.g., 900"
                  className="mt-1"
                  value={newProduct.product_weight}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 mt-4 shadow-md"
              onClick={handleSaveProduct}
              disabled={isSaving}
            >
              {isSaving ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Product" : "Save Product")}
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px] rounded-lg">
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    Are you sure you want to delete this product? This action cannot be undone.
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={confirmDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white shadow-lg border-0 rounded-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-slate-800">Products List</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                className="pl-10 w-64 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-slate-500 py-8">Loading products...</p>
          ) : isPageLoading ? (
            <p className="text-center text-slate-500 py-8">Loading page {currentPage}...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">Product Name</TableHead>
                    <TableHead className="font-semibold text-slate-700">Product Category</TableHead>
                    <TableHead className="font-semibold text-slate-700">SKU Number</TableHead>
                    <TableHead className="font-semibold text-slate-700">Product Weight</TableHead>
                    <TableHead className="font-semibold text-slate-700">Created At</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.length > 0 ? (
                    currentProducts.map((product) => (
                      <TableRow key={product.product_id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{product.product_name}</TableCell>
                        <TableCell>{product.category_name}</TableCell>
                        <TableCell className="text-slate-500">{product.sku_number}</TableCell>
                        <TableCell className="text-slate-500">{product.product_weight}</TableCell>
                        <TableCell className="text-slate-500">
                          {new Date(product.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button onClick={() => handleEditClick(product)} variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 rounded-full">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handleDeleteClick(product.product_id)} variant="outline" size="sm" className="text-red-600 hover:text-red-700 rounded-full">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-slate-500">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <div className="flex justify-end items-center gap-2 p-4">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1 || isPageLoading}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || isPageLoading}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </Card>
      <Toaster />
    </div>
  );
};

const App = () => (
  <>
    <ProductManagement />
  </>
);

export default App;
