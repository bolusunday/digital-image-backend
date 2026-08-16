// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  Package,
  Trash2,
  PlusCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  Edit3,
  X,
  DollarSign,
  FileText,
} from "lucide-react";
import { API_URL } from "../config";

const CATEGORY_OPTIONS = [
  { name: "Sport", value: "sport" },
  { name: "Cartoon", value: "cartoon" },
  { name: "Africana", value: "africana" },
  { name: "Medieval", value: "medieval" },
  { name: "EBooks", value: "ebook" },
];

// ==========================================
// 1. EDIT PRODUCT MODAL COMPONENT
// ==========================================
function EditProductModal({
  product,
  isOpen,
  onClose,
  onProductUpdated,
  token,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "sport",
    public_thumb_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price ? (Number(product.price) / 100).toString() : "0",
        category: (product.category || "sport").toLowerCase().trim(),
        public_thumb_url: product.public_thumb_url || "",
      });
      setError("");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const priceInCents = Math.round(parseFloat(formData.price || "0") * 100);
    const cleanCategory = formData.category.toLowerCase().trim();

    // inside your submit/update handler:
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: priceInCents,
          category: cleanCategory,
          public_thumb_url: formData.public_thumb_url,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        onProductUpdated(
          data.product || {
            ...product,
            ...formData,
            price: priceInCents,
            category: cleanCategory,
          },
        );
        onClose();
      } else {
        setError(data.error || "Failed to update product.");
      }
    } catch (err) {
      console.error("Update Error:", err);
      setError("Network error. Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
           {" "}
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-800 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}       {" "}
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
                   {" "}
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                       {" "}
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Edit3 size={18} />           {" "}
            </div>
                        <span>Edit Product Details</span>         {" "}
          </h3>
                   {" "}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer rounded-lg hover:bg-slate-100"
          >
                        <X size={20} />         {" "}
          </button>
                 {" "}
        </div>
               {" "}
        {error && (
          <div className="mb-4 text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 flex items-center gap-2">
                        <AlertCircle size={16} />           {" "}
            <span>{error}</span>         {" "}
          </div>
        )}
               {" "}
        <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}         {" "}
          <div>
                       {" "}
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Title *            {" "}
            </label>
                       {" "}
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
            />
                     {" "}
          </div>
                    {/* Category & Price Grid */}         {" "}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Category Dropdown */}           {" "}
            <div>
                           {" "}
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                Category *              {" "}
              </label>
                           {" "}
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all cursor-pointer capitalize"
              >
                               {" "}
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                                        {cat.name}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                         {" "}
            </div>
                        {/* Price */}           {" "}
            <div>
                           {" "}
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                Price ($ USD) *              {" "}
              </label>
                           {" "}
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
              />
                         {" "}
            </div>
                     {" "}
          </div>
                    {/* Public Thumbnail URL */}         {" "}
          <div>
                       {" "}
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Thumbnail URL            {" "}
            </label>
                       {" "}
            <input
              type="text"
              name="public_thumb_url"
              value={formData.public_thumb_url}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
            />
                     {" "}
          </div>
                    {/* Description */}         {" "}
          <div>
                       {" "}
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Description            {" "}
            </label>
                       {" "}
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
            />
                     {" "}
          </div>
                    {/* Actions */}         {" "}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                       {" "}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
                            Cancel            {" "}
            </button>
                       {" "}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
                           {" "}
              {saving ? (
                <>
                                   {" "}
                  <Loader2 className="animate-spin" size={14} />               
                    <span>Saving...</span>               {" "}
                </>
              ) : (
                <span>Save Changes</span>
              )}
                         {" "}
            </button>
                     {" "}
          </div>
                 {" "}
        </form>
             {" "}
      </div>
         {" "}
    </div>
  );
}

// ==========================================
// 2. MAIN ADMIN DASHBOARD COMPONENT
// ==========================================
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("listings"); // 'listings' | 'upload'
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true); // Edit Modal State

  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Upload Form State

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("sport");
  const [thumbnail, setThumbnail] = useState(null);
  const [originalFile, setOriginalFile] = useState(null); // Status State

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const token = localStorage.getItem("token"); // Fetch product list

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      if (res.ok) setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // Handle Edit Click

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  }; // Update State when product editing succeeds

  const handleProductUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    );
    setFeedback({
      type: "success",
      message: `Product "${updatedProduct.title}" updated successfully!`,
    });
  }; // Handle Product Upload

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setFeedback({ type: "", message: "" });

    if (!thumbnail || !originalFile) {
      setFeedback({
        type: "error",
        message: "Please select both a thumbnail image and an original file.",
      });
      setUploading(false);
      return;
    }

    const cleanCategory = category.toLowerCase().trim();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", cleanCategory);
    formData.append("thumbnail", thumbnail);
    formData.append("original_file", originalFile);

    try {
      const res = await fetch(`${API_URL}/api/products/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload product.");

      setFeedback({
        type: "success",
        message: `Product "${data.product?.title || title}" created successfully!`,
      }); // Reset form

      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("sport");
      setThumbnail(null);
      setOriginalFile(null);

      fetchProducts();
      setActiveTab("listings");
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setUploading(false);
    }
  }; // Handle Product Delete

  const handleDelete = async (id, productTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete product.");

      setProducts(products.filter((p) => p.id !== id));
      setFeedback({
        type: "success",
        message: `Product "${productTitle}" deleted successfully!`,
      });
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 p-4 sm:p-6 md:p-10">
           {" "}
      <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}       {" "}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
                   {" "}
          <div>
                       {" "}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Admin Dashboard            {" "}
            </h1>
                       {" "}
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                            Manage your store's digital inventory, categorize,
              and upload new               assets.            {" "}
            </p>
                     {" "}
          </div>
                    {/* Navigation Tabs */}         {" "}
          <div className="flex gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl shrink-0 border border-slate-200">
                       {" "}
            <button
              onClick={() => setActiveTab("listings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "listings"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
                            <Package size={16} />             {" "}
              <span>Catalog ({products.length})</span>           {" "}
            </button>
                       {" "}
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "upload"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
                            <PlusCircle size={16} />             {" "}
              <span>Add New Asset</span>           {" "}
            </button>
                     {" "}
          </div>
                 {" "}
        </div>
                {/* Global Feedback Banner */}       {" "}
        {feedback.message && (
          <div
            className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-bold ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
                       {" "}
            <div className="flex items-center gap-2">
                           {" "}
              {feedback.type === "success" ? (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle size={18} className="shrink-0 text-rose-600" />
              )}
                            <span>{feedback.message}</span>           {" "}
            </div>
                       {" "}
            <button
              onClick={() => setFeedback({ type: "", message: "" })}
              className="text-xs font-extrabold opacity-70 hover:opacity-100 cursor-pointer"
            >
                            Dismiss            {" "}
            </button>
                     {" "}
          </div>
        )}
                {/* TAB 1: PRODUCT LISTINGS */}       {" "}
        {activeTab === "listings" && (
          <div>
                       {" "}
            {loadingProducts ? (
              <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-xs font-medium">
                               {" "}
                <Loader2 className="animate-spin text-indigo-600" size={20} /> 
                              <span>Loading digital catalog...</span>           
                 {" "}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-white">
                               {" "}
                <Package className="mx-auto text-slate-300 mb-3" size={48} />   
                           {" "}
                <p className="text-slate-500 font-medium text-xs">
                                    No products found in database.              
                   {" "}
                </p>
                               {" "}
                <button
                  onClick={() => setActiveTab("upload")}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                                    Create First Product                {" "}
                </button>
                             {" "}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {" "}
                {products.map((product) => {
                  const rawPrice = Number(product.price || 0);
                  const priceInDollars =
                    rawPrice > 500 ? rawPrice / 100 : rawPrice;

                  return (
                    <div
                      key={product.id}
                      className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all duration-200"
                    >
                                           {" "}
                      <div>
                                               {" "}
                        {/* Thumbnail Preview with object-contain */}           
                                   {" "}
                        <div className="h-44 bg-slate-100/80 overflow-hidden relative border-b border-slate-100 flex items-center justify-center p-3">
                                                   {" "}
                          {product.public_thumb_url || product.imageUrl ? (
                            <img
                              src={product.public_thumb_url || product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                           {" "}
                              <ImageIcon size={32} />                         
                               {" "}
                            </div>
                          )}
                                                    {/* Category Badge */}     
                                             {" "}
                          {product.category && (
                            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-indigo-700 border border-slate-200/80 uppercase tracking-wider shadow-xs">
                                                            {product.category} 
                                                       {" "}
                            </span>
                          )}
                                                   {" "}
                          <span className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-extrabold text-white shadow-xs">
                                                        $
                            {priceInDollars.toFixed(2)}                       
                             {" "}
                          </span>
                                                 {" "}
                        </div>
                                                {/* Content */}                 
                             {" "}
                        <div className="p-5 space-y-1.5">
                                                   {" "}
                          <h3 className="font-bold text-slate-900 text-sm truncate">
                                                        {product.title}         
                                           {" "}
                          </h3>
                                                   {" "}
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                       {" "}
                            {product.description || "No description provided."} 
                                                   {" "}
                          </p>
                                                 {" "}
                        </div>
                                             {" "}
                      </div>
                                            {/* Footer Actions */}             
                             {" "}
                      <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100">
                                               {" "}
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                                    ID: #{product.id}           
                                     {" "}
                        </span>
                                               {" "}
                        <div className="flex gap-2">
                                                    {/* EDIT BUTTON */}         
                                         {" "}
                          <button
                            onClick={() => handleEditClick(product)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                                                        <Edit3 size={14} />     
                                                  <span>Edit</span>             
                                       {" "}
                          </button>
                                                    {/* DELETE BUTTON */}       
                                           {" "}
                          <button
                            onClick={() =>
                              handleDelete(product.id, product.title)
                            }
                            disabled={deletingId === product.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                          >
                                                       {" "}
                            {deletingId === product.id ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                                                        <span>Delete</span>     
                                               {" "}
                          </button>
                                                 {" "}
                        </div>
                                             {" "}
                      </div>
                                         {" "}
                    </div>
                  );
                })}
                             {" "}
              </div>
            )}
                     {" "}
          </div>
        )}
                {/* TAB 2: UPLOAD FORM */}       {" "}
        {activeTab === "upload" && (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
                       {" "}
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                           {" "}
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <UploadCloud size={20} />             {" "}
              </div>
                            <span>Upload Digital Product</span>           {" "}
            </h2>
                       {" "}
            <form onSubmit={handleUpload} className="space-y-4">
                            {/* Product Title */}             {" "}
              <div>
                               {" "}
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Product Title *                {" "}
                </label>
                               {" "}
                <div className="relative flex items-center">
                                   {" "}
                  <FileText
                    className="absolute left-3 text-slate-400"
                    size={16}
                  />
                                   {" "}
                  <input
                    type="text"
                    placeholder="e.g. Cyberpunk City 3D Asset Pack"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                  />
                                 {" "}
                </div>
                             {" "}
              </div>
                            {/* CATEGORY & PRICE GRID */}             {" "}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Category Selection Dropdown */}             
                 {" "}
                <div>
                                   {" "}
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                                       {" "}
                    <Tag size={13} className="text-indigo-600" />               
                        <span>Category *</span>                 {" "}
                  </label>
                                   {" "}
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all cursor-pointer capitalize"
                  >
                                       {" "}
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                                                {cat.name}                   
                         {" "}
                      </option>
                    ))}
                                     {" "}
                  </select>
                                 {" "}
                </div>
                                {/* Price */}               {" "}
                <div>
                                   {" "}
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                                       {" "}
                    <DollarSign size={13} className="text-indigo-600" />       
                                <span>Price ($ USD) *</span>               
                     {" "}
                  </label>
                                   {" "}
                  <input
                    type="number"
                    step="0.01"
                    placeholder="19.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                  />
                                 {" "}
                </div>
                             {" "}
              </div>
                            {/* Description */}             {" "}
              <div>
                               {" "}
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Description                {" "}
                </label>
                               {" "}
                <textarea
                  rows={3}
                  placeholder="Details about what buyers get in this digital download..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                />
                             {" "}
              </div>
                            {/* Public Thumbnail File Input */}             {" "}
              <div>
                               {" "}
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Public Preview Thumbnail Image (S3
                  /thumbnails) *                {" "}
                </label>
                               {" "}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                  required
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
                             {" "}
              </div>
                            {/* Private Digital Asset File Input */}           
               {" "}
              <div>
                               {" "}
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Private Digital Asset File (S3 /originals) *
                                 {" "}
                </label>
                               {" "}
                <input
                  type="file"
                  onChange={(e) => setOriginalFile(e.target.files[0])}
                  required
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
                             {" "}
              </div>
                           {" "}
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                               {" "}
                {uploading ? (
                  <>
                                       {" "}
                    <Loader2 className="animate-spin" size={18} />             
                          <span>Uploading files to S3...</span>               
                     {" "}
                  </>
                ) : (
                  <>
                                        <UploadCloud size={18} />               
                        <span>Upload Product to Catalog</span>               
                     {" "}
                  </>
                )}
                             {" "}
              </button>
                         {" "}
            </form>
                     {" "}
          </div>
        )}
             {" "}
      </div>
            {/* EDIT PRODUCT MODAL */}     {" "}
      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProductUpdated={handleProductUpdated}
        token={token}
      />
         {" "}
    </div>
  );
}
