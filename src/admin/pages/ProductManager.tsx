import { AdminSymbol } from '../components/AdminSymbol';
import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { ProductContentEditor } from '../components/ProductContentEditor';
import type { Product } from '../../types';

export const ProductManager: React.FC<{ initialProductId?: string; startAdding?: boolean }> = ({ initialProductId, startAdding = false }) => {
  const { config, addProduct, editProduct, deleteProduct, publishConfig, isSaving, saveError } = useAdminConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(startAdding || Boolean(initialProductId && config.products.some(p => p.id === initialProductId)));
  const [editingProductId, setEditingProductId] = useState<string | null>(initialProductId || null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const initialProductState: Product = {
    id: `prod-${Date.now()}`,
    name: '',
    category: config.categories[0]?.name || 'Rice & Grains',
    price: 0, oldPrice: 0, discountPercentage: 0, weight: '', weightOptions: [], image: '',
    deliveryTime: '', inStock: false, stockCount: 0, brand: '', description: '',
    ingredients: [], nutritionalInfo: { energy: '', protein: '', carbs: '', fat: '' },
    badges: [], highlights: [], benefits: [], specifications: [], howToUse: [], storageInstructions: '', faqs: [],
  };

  const [formData, setFormData] = useState<Product>(() => JSON.parse(JSON.stringify(config.products.find(p => p.id === initialProductId) || initialProductState)));

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
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    const copy = JSON.parse(JSON.stringify(product));
    if (copy.discountPercentage === undefined) {
      if (copy.oldPrice && copy.price && copy.oldPrice > copy.price) {
        copy.discountPercentage = Math.round(((copy.oldPrice - copy.price) / copy.oldPrice) * 100);
      } else {
        copy.discountPercentage = 0;
      }
    }
    setFormData(copy);
    setEditingProductId(product.id);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    const cleanData: Product = {
      ...formData,
      stockCount: Math.max(0, Math.floor(Number(formData.stockCount) || 0)),
      inStock: Number(formData.stockCount) > 0,
      price: Number(formData.price) || 0,
      oldPrice: Number(formData.oldPrice) || 0,
      discountPercentage: formData.discountPercentage !== undefined ? Number(formData.discountPercentage) : 0,
    };

    if (editingProductId) {
      editProduct(cleanData);
    } else {
      addProduct(cleanData);
      setEditingProductId(cleanData.id);
    }

    const published = await publishConfig();
    setSavedSuccess(published);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (isModalOpen) return <ProductContentEditor product={formData} onChange={product => {setFormData(product); if (editingProductId) editProduct(product);}} onBack={() => setIsModalOpen(false)} onSave={handleSave} saving={isSaving} error={saveError}/>;

  return (
    <div className="space-y-6 text-left">
      <div className={isModalOpen ? "hidden" : "space-y-6"}>
      {/* Header */}
      <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
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
            <span><AdminSymbol name="ruler"/> Recommended Product Image Dimensions:</span>
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
          <span>Product draft updated. Click Save Changes above to publish to all devices.</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="admin-panel bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
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
      <div className="admin-panel bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
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
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-black text-purple-700 text-sm">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-[11px] text-slate-400 line-through">MRP ₹{product.oldPrice.toLocaleString('en-IN')}</span>
                      )}
                      {(() => {
                        const offer = product.discountPercentage !== undefined && product.discountPercentage > 0
                          ? product.discountPercentage
                          : product.oldPrice && product.oldPrice > product.price
                            ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                            : 0;
                        return offer > 0 ? (
                          <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-md">
                            {product.oldPrice > product.price ? `₹${(product.oldPrice - product.price).toLocaleString('en-IN')} OFF | ` : ''}{offer}% OFF
                          </span>
                        ) : null;
                      })()}
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

      </div>
    </div>
  );
};
