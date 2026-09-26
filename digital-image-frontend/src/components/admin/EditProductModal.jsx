// src/components/admin/EditProductModal.jsx
import React, { useState, useEffect } from "react";

export default function EditProductModal({
  product,
  isOpen,
  onClose,
  onProductUpdated,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    public_thumb_url: "",
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form when a product is passed in
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price || 0, // stored in cents
        public_thumb_url: product.public_thumb_url || "",
        images: Array.isArray(product.images) ? product.images : [],
      });
      setError("");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gallery URL handlers
  const handleGalleryChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  const addGalleryField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeGalleryField = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Filter out empty URL strings
    const cleanGallery = formData.images.filter((url) => url.trim() !== "");

    try {
      const baseUrl = process.env.REACT_APP_API_URL || "";
      const response = await fetch(
        `${baseUrl}/api/admin/products/${product.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            price: Number(formData.price), // ensure numeric format
            public_thumb_url: formData.public_thumb_url,
            images: cleanGallery,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        onProductUpdated(data.product); // Notify parent component
        onClose(); // Close modal
      } else {
        setError(data.error || "Failed to update product.");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Network error. Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Price (In Cents) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Price (in cents — e.g., 1000 = $10.00)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Thumbnail Image URL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Main Thumbnail Image URL
            </label>
            <input
              type="text"
              name="public_thumb_url"
              value={formData.public_thumb_url}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Gallery Image URLs */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700">
                Gallery Image URLs
              </label>
              <button
                type="button"
                onClick={addGalleryField}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                + Add Image URL
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {formData.images.map((url, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleGalleryChange(idx, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryField(idx)}
                    className="text-red-500 hover:text-red-700 font-bold text-xs px-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
