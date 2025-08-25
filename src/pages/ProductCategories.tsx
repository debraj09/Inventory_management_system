import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Search, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 5;
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const { toast } = useToast();

  const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "https://inventory-management-cb.vercel.app/api/v1";

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/product-categories/list`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      if (result.data) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Could not fetch product categories. Please try again later.");
      toast({
        title: "Error",
        description: "Could not fetch product categories.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddClick = () => {
    setIsEditing(false);
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryImage("");
    setIsDialogOpen(true);
  };

  const handleEditClick = (category) => {
    setIsEditing(true);
    setEditingCategoryId(category.category_id);
    setCategoryName(category.category_name);
    setCategoryDescription(category.description);
    setCategoryImage(category.category_image);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeletingCategory(true);
    const url = `${BASE_URL}/product-categories/delete/${categoryToDelete.category_id}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete category.`);
      }

      toast({
        title: "Success",
        description: "Product category deleted successfully!",
        className: "bg-green-500 text-white border-green-700"
      });

      setIsConfirmDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      toast({
        title: "Error",
        description: err.message || "Could not delete product category.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName || !categoryImage) {
      toast({
        title: "Validation Error",
        description: "Category Name and Image URL are required.",
        variant: "destructive"
      });
      return;
    }

    // Add length validation
    if (categoryName.length > 15) {
      toast({
        title: "Validation Error",
        description: "Category Name cannot exceed 15 characters.",
        variant: "destructive"
      });
      return;
    }

    if (categoryImage.length > 255) {
      toast({
        title: "Validation Error",
        description: "Image URL cannot exceed 255 characters.",
        variant: "destructive"
      });
      return;
    }

    if (categoryDescription.length > 60) {
      toast({
        title: "Validation Error",
        description: "Description cannot exceed 60 characters.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingCategory(true);
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${BASE_URL}/product-categories/update/${editingCategoryId}`
      : `${BASE_URL}/product-categories/add`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_name: categoryName,
          category_image: categoryImage,
          description: categoryDescription
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? "update" : "add"} category.`);
      }

      toast({
        title: "Success",
        description: `Product category ${isEditing ? "updated" : "added"} successfully!`,
        className: "bg-green-500 text-white border-green-700"
      });

      setCategoryName("");
      setCategoryDescription("");
      setCategoryImage("");
      setIsDialogOpen(false);
      setIsEditing(false);
      setEditingCategoryId(null);
      fetchCategories();
    } catch (err) {
      console.error(`Error ${isEditing ? "updating" : "adding"} category:`, err);
      toast({
        title: "Error",
        description: err.message || `Could not ${isEditing ? "update" : "add"} product category.`,
        variant: "destructive"
      });
    } finally {
      setIsSavingCategory(false);
    }
  };

  const sortedCategories = () => {
    let sorted = [...categories];
    if (sortConfig.key !== null) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sorted;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredCategories = sortedCategories().filter(category =>
    category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Product Category Management</h1>
          <p className="text-slate-600 mt-1">Manage your product categories</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {/* The single child element is correct here. Do not add anything else inside. */}
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg" onClick={handleAddClick}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Product Category" : "Add Product Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name*</Label>
                <Input
                  id="categoryName"
                  placeholder="Enter category name"
                  className="mt-1"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  maxLength={15}

                />
              </div>
              <div>
                <Label htmlFor="categoryImage">Category Image URL*</Label>
                <Input
                  id="categoryImage"
                  placeholder="Enter image URL"
                  className="mt-1"
                  value={categoryImage}
                  onChange={(e) => setCategoryImage(e.target.value)}
                  required
                  maxLength={255}

                />
              </div>
              <div>
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  placeholder="Optional category description"
                  className="mt-1"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  maxLength={60}

                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSavingCategory}>
                {isSavingCategory ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEditing ? "Update Category" : "Add Category"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-slate-800">Categories List</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search categories..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center text-slate-500">Loading categories...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && filteredCategories.length === 0 ? (
            <p className="text-center text-slate-500">No categories found.</p>
          ) : (
            !loading && !error && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead
                        className="font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('category_name')}
                      >
                        <div className="flex items-center gap-1">
                          Category Name
                          {sortConfig.key === 'category_name' && (
                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Category Image</TableHead>
                      <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Description</TableHead>
                      <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Created At</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCategories.map((category) => (
                      <TableRow key={category.category_id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{category.category_name}</TableCell>
                        <TableCell>
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
                            <a href={category.category_image} target="_blank" rel="noopener noreferrer">
                              <img
                                src={category.category_image}
                                alt={`${category.category_name} image`}
                                className="w-200 h-200 object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://placehold.co/48x48/F1F5F9/94A3B8?text=IMG`;
                                }}
                              />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{category.description}</TableCell>
                        <TableCell className="text-slate-500">{new Date(category.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => handleEditClick(category)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteClick(category)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div>
                  <Pagination className="flex justify-end items-center gap-2 p-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" onClick={handlePreviousPage} disabled={currentPage === 1} />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            onClick={() => paginate(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext href="#" onClick={handleNextPage} disabled={currentPage === totalPages} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to permanently delete the category:
              <span className="font-semibold text-gray-800 ml-1">{categoryToDelete?.category_name}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            {/* The single child element is correct here. */}
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingCategory}
            >
              {isDeletingCategory ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCategories;