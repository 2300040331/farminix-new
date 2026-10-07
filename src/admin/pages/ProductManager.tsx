import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { Product } from '../../types';

export const ProductManager: React.FC = () => {
  const { config, addProduct, editProduct, deleteProduct } = useAdminConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'nutrition' | 'highlights' | 'faqs'>('basic');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const initialProductState: Product = {
    id: `prod-${Date.now()}`,
    name: '',
    category: config.categories[0]?.name || 'Rice & Grains',
    price: 99,
    oldPrice: 120,
    weight: '1 kg',
    weightOptions: ['500 g', '1 kg', '2 kg'],
    image: '/prod_daawat_rice.jpg',
    deliveryTime: '10 Mins',
    rating: 4.8,
    reviewsCount: 100,
    inStock: true,
    stockCount: 50,
    brand: 'Farminix Fresh',
    description: '',
    ingredients: ['100% Pure Natural'],
    nutritionalInfo: {
      energy: '350 kcal',
      protein: '8 g',
      carbs: '70 g',
      fat: '1 g',
    },
    badges: ['Bestseller', 'Fresh'],
    highlights: [
      { icon: '🌾', title: '100% Natural', desc: 'Sourced directly from verified farms.' },
      { icon: '⚡', title: '10 Min Express', desc: 'Packed fresh and delivered under 10 minutes.' },
    ],
    benefits: ['Rich in essential natural nutrients', 'Zero artificial chemicals or polish'],
    specifications: [
      { label: 'Dietary Preference', value: 'Vegetarian 🟢' },
      { label: 'Country of Origin', value: 'India' },
    ],
    howToUse: ['Use as desired in traditional Indian cooking.'],
    storageInstructions: 'Store in a cool dry place in an airtight container.',
    faqs: [
      { question: 'Is this product 100% authentic?', answer: 'Yes, all Farminix staples are 100% genuine and verified.' },
    ],
  };

  const [formData, setFormData] = useState<Product>(initialProductState);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return config.products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [config.products, searchQuery, selectedCategoryFilter]);

  const handleOpenAddModal = () => {
    setFormData({ ...initialProductState, id: `prod-${Date.now()}` });
    setEditingProductId(null);
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setFormData(JSON.parse(JSON.stringify(product)));
    setEditingProductId(product.id);
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProductId) {
      editProduct(formData);
    } else {
      addProduct(formData);
    }

    setIsModalOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Store Inventory Database</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Full lifecycle CRUD for grocery items, stock counts, weight variants, nutritional facts, and specifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Recommended Product Dimensions Notice Box */}
      <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="font-black text-purple-900 flex items-center gap-1.5 flex-wrap">
            <span>📐 Recommended Product Image Dimensions:</span>
            <span className="bg-purple-200 text-purple-950 px-2.5 py-0.5 rounded-md font-black">
              800 × 800 px
            </span>
            <span className="text-purple-700 font-bold">(1:1 Square Ratio)</span>
          </div>
          <p className="text-purple-700 font-medium">
            Use a square 1:1 ratio image (800 × 800 px or minimum 500 × 500 px) with a clean white or transparent background for high clarity product cards.
          </p>
        </div>
        <div className="shrink-0 bg-white border border-purple-200 px-3 py-1.5 rounded-xl font-bold text-slate-700 shadow-2xs">
          JPG / PNG / WebP (Max 2MB)
        </div>
      </div>

      {/* Live Saved Notification Banner */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>✓ Product Catalog Changes Saved &amp; Live on the Main Storefront!</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, brand, or category..."
            className="w-full h-10 pl-10 pr-4 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="h-10 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Categories ({config.products.length})</option>
            {config.categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200/80">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {product.brand} • <span className="font-semibold">{product.weight}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-700">{product.category}</td>

                  <td className="py-3 px-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-black text-purple-700">₹{product.price}</span>
                      {product.oldPrice && (
                        <span className="text-[10px] text-slate-400 line-through">₹{product.oldPrice}</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800">{product.stockCount ?? 50} units</span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        product.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          const isVisible = product.enabled !== false;
                          editProduct({ ...product, enabled: !isVisible });
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          product.enabled !== false 
                            ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50' 
                            : 'text-slate-400 hover:text-slate-650 hover:bg-slate-100'
                        }`}
                        title={product.enabled !== false ? 'Visible (Click to Hide)' : 'Hidden (Click to Show)'}
                      >
                        {product.enabled !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete product "${product.name}"?`)) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Tab Product Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingProductId ? 'Edit Product Details' : 'Add New Grocery Product'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {editingProductId ? `Product ID: ${formData.id}` : 'Fill in the information below'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-slate-100 py-3">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'nutrition', label: 'Nutritional Info' },
                { id: 'highlights', label: 'Highlights & Benefits' },
                { id: 'faqs', label: 'FAQs & Storage' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="E.g., Daawat Super Basmati Rice"
                        className="w-full h-10 px-3 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full h-10 px-3 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full h-10 px-3 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        {config.categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Default Weight / Size</label>
                      <input
                        type="text"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="1 kg, 500 g, 5 kg..."
                        className="w-full h-10 px-3 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                      <input
                        type="text"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                        className="w-full h-10 px-3 text-xs font-extrabold text-purple-700 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (₹)</label>
                      <input
                        type="text"
                        value={formData.oldPrice || 0}
                        onChange={(e) => setFormData({ ...formData, oldPrice: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                        className="w-full h-10 px-3 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Stock Count</label>
                      <input
                        type="text"
                        value={formData.stockCount || 50}
                        onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                        className="w-full h-10 px-3 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Product Rating (0 - 5)</label>
                      <input
                        type="text"
                        value={formData.rating || 4.8}
                        onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                        className="w-full h-10 px-3 text-xs font-semibold text-slate-850 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Total Ratings Count</label>
                      <input
                        type="text"
                        value={formData.reviewsCount || 100}
                        onChange={(e) => setFormData({ ...formData, reviewsCount: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                        className="w-full h-10 px-3 text-xs font-semibold text-slate-850 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="col-span-2">
                      <AdminImageUpload
                        value={formData.image}
                        onChange={(val) => setFormData({ ...formData, image: val })}
                        label="Product Thumbnail Image"
                        aspectRatio="square"
                        recommendedDimensions="800 × 800 px (1:1 ratio)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Product details and quality guarantees..."
                      className="w-full p-3 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Energy / Calories</label>
                    <input
                      type="text"
                      value={formData.nutritionalInfo?.energy || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nutritionalInfo: { ...formData.nutritionalInfo!, energy: e.target.value },
                        })
                      }
                      placeholder="350 kcal"
                      className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Protein</label>
                    <input
                      type="text"
                      value={formData.nutritionalInfo?.protein || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nutritionalInfo: { ...formData.nutritionalInfo!, protein: e.target.value },
                        })
                      }
                      placeholder="8.5 g"
                      className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Carbohydrates</label>
                    <input
                      type="text"
                      value={formData.nutritionalInfo?.carbs || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nutritionalInfo: { ...formData.nutritionalInfo!, carbs: e.target.value },
                        })
                      }
                      placeholder="78 g"
                      className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fats</label>
                    <input
                      type="text"
                      value={formData.nutritionalInfo?.fat || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nutritionalInfo: { ...formData.nutritionalInfo!, fat: e.target.value },
                        })
                      }
                      placeholder="0.6 g"
                      className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'highlights' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Benefit #1</label>
                    <input
                      type="text"
                      value={formData.benefits?.[0] || ''}
                      onChange={(e) => {
                        const b = [...(formData.benefits || [])];
                        b[0] = e.target.value;
                        setFormData({ ...formData, benefits: b });
                      }}
                      className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Benefit #2</label>
                    <input
                      type="text"
                      value={formData.benefits?.[1] || ''}
                      onChange={(e) => {
                        const b = [...(formData.benefits || [])];
                        b[1] = e.target.value;
                        setFormData({ ...formData, benefits: b });
                      }}
                      className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'faqs' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Storage Advice</label>
                    <input
                      type="text"
                      value={formData.storageInstructions || ''}
                      onChange={(e) => setFormData({ ...formData, storageInstructions: e.target.value })}
                      placeholder="Store in cool, dry hygienic container..."
                      className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Frequently Asked Question</label>
                    <input
                      type="text"
                      value={formData.faqs?.[0]?.question || ''}
                      onChange={(e) => {
                        const f = [...(formData.faqs || [{ question: '', answer: '' }])];
                        f[0] = { ...f[0], question: e.target.value };
                        setFormData({ ...formData, faqs: f });
                      }}
                      placeholder="Question..."
                      className="w-full h-9 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl mb-2"
                    />
                    <textarea
                      rows={2}
                      value={formData.faqs?.[0]?.answer || ''}
                      onChange={(e) => {
                        const f = [...(formData.faqs || [{ question: '', answer: '' }])];
                        f[0] = { ...f[0], answer: e.target.value };
                        setFormData({ ...formData, faqs: f });
                      }}
                      placeholder="Answer..."
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
