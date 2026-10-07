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
  const [activeTab, setActiveTab] = useState<'basic' | 'nutrition' | 'highlights' | 'faqs' | 'story'>('basic');
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
    storySection: {
      headline: 'Pure Grains. Direct From Soil to Soul.',
      subheadline:
        'Farminix bridges generational Andhra paddy farmers and your dining table. Zero middlemen, zero chemical polishing, and zero stale godowns — just honest, farm-fresh rice delivered in minutes.',
      tags: [
        '100% Single-Origin Paddy',
        'Naturally Aged for Fluffy Cook',
        'FSSAI Lic. 20126142000933',
      ],
      founderTitle: "Founder's Reflection",
      founderSubtitle: 'A Note from the Heart of Farminix • With Love to Every Household',
      founderLetter:
        'Dear Farminix Family,\n\nWhen you gather around the dinner table after a long day, a steaming bowl of rice is never just food. It is the comforting center of every family celebration, your grandmother’s timeless recipes, and the very feeling of coming home.\n\nWe started Farminix right here in Gorantla, Guntur with a deeply personal calling. We looked at standard grocery stores and saw rice that had spent 6 to 9 months inside dusty godowns, traded through five layers of commission middlemen, and subjected to harsh chemical polishes just to appear artificially white. Meanwhile, the generational farmers who woke up at dawn to tend the fertile Andhra soils were paid fractions of what families were charged.',
      founderQuote:
        '“Why should Indian families settle for chemically polished, stale grains when our villages harvest the most fragrant, wholesome paddy in the world?”',
      founderSignoff:
        'Farminix is our answer. We partner directly with verified grower families across Andhra Pradesh, mill through cutting-edge optical Sortex technology, and pack our hallmark 26 Kg Family Choice bags right at the source. No middlemen inflating prices. No artificial bleaching. Just pure, whole, naturally aged grains that cook fluffy, fragrant, and healthy.\n\nEvery sack that reaches your doorstep carries the blessing of our soil, the dignity of our farmers, and our sacred promise of purity to your family.\n\nWith endless gratitude & love,\nThe Farminix Team',
      companyAddress:
        'Farminix Private Limited • Flat No 302, Srinivasa Towers, Gorantla, Guntur – 522034, AP',
      processTitle: 'From Soil to Dining Table',
      processSubtitle: 'How Farminix Reinvents What You Eat',
      processSteps: [
        {
          step: '01',
          title: 'Sown in Guntur',
          desc: 'Cultivated by trusted generational farming families in the nutrient-dense Krishna-Godavari river basin.',
        },
        {
          step: '02',
          title: 'Sortex Cleaned',
          desc: 'Optical sensor cameras screen each grain, separating dust, stones, and broken pieces without chemical polish.',
        },
        {
          step: '03',
          title: 'Naturally Aged',
          desc: 'Controlled resting optimizes starch retrogradation for maximum fluffiness and zero stickiness when boiled.',
        },
        {
          step: '04',
          title: 'Delivered Direct',
          desc: 'Sealed in heavy-duty 26 Kg moisture-lock sacks and delivered directly to your doorstep by express logistics.',
        },
      ],
      philosophyTitle: 'Our Operating Philosophy',
      philosophySubtitle: 'Built on Dignity, Health & Transparency',
      philosophyPillars: [
        {
          tag: 'Ethical Sourcing',
          title: 'Direct Farmer Dignity',
          desc: 'By cutting out commission agents, we pay farmers fair, upfront prices for their harvest, strengthening rural livelihoods.',
          guarantee: 'Fair Trade Guarantee',
        },
        {
          tag: 'Pure Health',
          title: 'Zero Synthetic Polish',
          desc: 'We refuse chemical bleaches, powders, and adulterants. You receive the honest, natural nutrient richness of each grain.',
          guarantee: '100% Unadulterated',
        },
        {
          tag: 'Durable Packaging',
          title: '26 Kg Moisture-Lock Bags',
          desc: 'Heavy-duty multi-layer sacks engineered to seal in farm freshness and resist external humidity, pests, and transit damage.',
          guarantee: 'Certified Net Weight',
        },
        {
          tag: 'Transparent Value',
          title: 'Direct-to-Home Pricing',
          desc: 'Premium quality at ₹1399 for 26 Kg (₹53.8/Kg) — passing wholesale supply-chain efficiencies straight to your household.',
          guarantee: 'Honest Value',
        },
      ],
      calloutTitle: 'Taste True Purity in Every Single Grain.',
      calloutDesc:
        'Upgrade your family’s daily meals with the authentic taste and aroma of Farminix Family Choice Rice. Delivered directly to your door.',
      contactPhone: '+91 7989743595',
      contactEmail: 'info@farminix.in',
      contactLocation: 'Gorantla, Guntur – 522034, AP',
    },
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
            <div className="flex gap-2 border-b border-slate-100 py-3 overflow-x-auto">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'nutrition', label: 'Nutritional Info' },
                { id: 'highlights', label: 'Highlights & Benefits' },
                { id: 'story', label: '🌾 Soil to Soul & Story' },
                { id: 'faqs', label: 'FAQs & Storage' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
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

              {activeTab === 'story' && (
                <div className="space-y-6">
                  {/* Headline & Badges */}
                  <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-150">
                    <h3 className="text-xs font-black text-purple-950 uppercase tracking-wider">
                      1. Brand Headline &amp; Tagline
                    </h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                      <input
                        type="text"
                        value={formData.storySection?.headline || 'Pure Grains. Direct From Soil to Soul.'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            storySection: { ...(formData.storySection || {}), headline: e.target.value },
                          })
                        }
                        className="w-full h-9 px-3 text-xs font-bold bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Subheadline / Narrative</label>
                      <textarea
                        rows={2}
                        value={formData.storySection?.subheadline || 'Farminix bridges generational Andhra paddy farmers and your dining table...'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            storySection: { ...(formData.storySection || {}), subheadline: e.target.value },
                          })
                        }
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Highlight Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={(formData.storySection?.tags || ['100% Single-Origin Paddy', 'Naturally Aged for Fluffy Cook', 'FSSAI Lic. 20126142000933']).join(', ')}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            storySection: {
                              ...(formData.storySection || {}),
                              tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                            },
                          })
                        }
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Founder's Reflection */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      2. Founder's Reflection &amp; Letter
                    </h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Note Header / Subtitle</label>
                      <input
                        type="text"
                        value={formData.storySection?.founderSubtitle || 'A Note from the Heart of Farminix • With Love to Every Household'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            storySection: { ...(formData.storySection || {}), founderSubtitle: e.target.value },
                          })
                        }
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Founder's Letter (Body)</label>
                      <textarea
                        rows={4}
                        value={formData.storySection?.founderLetter || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            storySection: { ...(formData.storySection || {}), founderLetter: e.target.value },
                          })
                        }
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Central Calling Quote</label>
                      <textarea
                        rows={2}
                        value={formData.storySection?.founderQuote || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            storySection: { ...(formData.storySection || {}), founderQuote: e.target.value },
                          })
                        }
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-purple-900 italic"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Sign-off &amp; Team Promise</label>
                      <textarea
                        rows={3}
                        value={formData.storySection?.founderSignoff || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            storySection: { ...(formData.storySection || {}), founderSignoff: e.target.value },
                          })
                        }
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Corporate / Registered Address</label>
                      <input
                        type="text"
                        value={formData.storySection?.companyAddress || 'Farminix Private Limited • Flat No 302, Srinivasa Towers, Gorantla, Guntur – 522034, AP'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            storySection: { ...(formData.storySection || {}), companyAddress: e.target.value },
                          })
                        }
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* 4 Process Steps */}
                  <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-150">
                    <h3 className="text-xs font-black text-purple-950 uppercase tracking-wider">
                      3. From Soil to Dining Table (4 Journey Steps)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(formData.storySection?.processSteps || [
                        { step: '01', title: 'Sown in Guntur', desc: 'Cultivated by trusted generational farming families in the Krishna-Godavari basin.' },
                        { step: '02', title: 'Sortex Cleaned', desc: 'Optical sensor cameras screen each grain, separating dust and stones without polish.' },
                        { step: '03', title: 'Naturally Aged', desc: 'Controlled resting optimizes starch retrogradation for maximum fluffiness.' },
                        { step: '04', title: 'Delivered Direct', desc: 'Sealed in heavy-duty 26 Kg moisture-lock sacks and delivered directly by express logistics.' },
                      ]).map((proc, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-purple-200/70 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black flex items-center justify-center">
                              {proc.step}
                            </span>
                            <input
                              type="text"
                              value={proc.title}
                              onChange={(e) => {
                                const steps = [...(formData.storySection?.processSteps || [])];
                                steps[idx] = { ...steps[idx], title: e.target.value };
                                setFormData({
                                  ...formData,
                                  storySection: { ...(formData.storySection || {}), processSteps: steps },
                                });
                              }}
                              className="flex-1 h-7 px-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={proc.desc}
                            onChange={(e) => {
                              const steps = [...(formData.storySection?.processSteps || [])];
                              steps[idx] = { ...steps[idx], desc: e.target.value };
                              setFormData({
                                ...formData,
                                storySection: { ...(formData.storySection || {}), processSteps: steps },
                              });
                            }}
                            className="w-full p-2 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4 Philosophy Pillars */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      4. Our Operating Philosophy (4 Core Pillars)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(formData.storySection?.philosophyPillars || [
                        { tag: 'Ethical Sourcing', title: 'Direct Farmer Dignity', desc: 'Cutting out commission agents to pay farmers fair, upfront prices.', guarantee: 'Fair Trade Guarantee' },
                        { tag: 'Pure Health', title: 'Zero Synthetic Polish', desc: 'Zero chemical bleaches, powders, or adulterants.', guarantee: '100% Unadulterated' },
                        { tag: 'Durable Packaging', title: '26 Kg Moisture-Lock Bags', desc: 'Heavy-duty multi-layer sacks engineered to seal in farm freshness.', guarantee: 'Certified Net Weight' },
                        { tag: 'Transparent Value', title: 'Direct-to-Home Pricing', desc: 'Premium quality at ₹1399 for 26 Kg — passing wholesale savings to families.', guarantee: 'Honest Value' },
                      ]).map((pil, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={pil.title}
                              onChange={(e) => {
                                const pillars = [...(formData.storySection?.philosophyPillars || [])];
                                pillars[idx] = { ...pillars[idx], title: e.target.value };
                                setFormData({
                                  ...formData,
                                  storySection: { ...(formData.storySection || {}), philosophyPillars: pillars },
                                });
                              }}
                              className="w-1/2 h-7 px-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg"
                            />
                            <input
                              type="text"
                              value={pil.guarantee}
                              onChange={(e) => {
                                const pillars = [...(formData.storySection?.philosophyPillars || [])];
                                pillars[idx] = { ...pillars[idx], guarantee: e.target.value };
                                setFormData({
                                  ...formData,
                                  storySection: { ...(formData.storySection || {}), philosophyPillars: pillars },
                                });
                              }}
                              className="w-1/2 h-7 px-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg text-right"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={pil.desc}
                            onChange={(e) => {
                              const pillars = [...(formData.storySection?.philosophyPillars || [])];
                              pillars[idx] = { ...pillars[idx], desc: e.target.value };
                              setFormData({
                                ...formData,
                                storySection: { ...(formData.storySection || {}), philosophyPillars: pillars },
                              });
                            }}
                            className="w-full p-2 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Contact */}
                  <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-150">
                    <h3 className="text-xs font-black text-purple-950 uppercase tracking-wider">
                      5. Direct Customer Support &amp; Origin
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Phone</label>
                        <input
                          type="text"
                          value={formData.storySection?.contactPhone || '+91 7989743595'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              storySection: { ...(formData.storySection || {}), contactPhone: e.target.value },
                            })
                          }
                          className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Email</label>
                        <input
                          type="text"
                          value={formData.storySection?.contactEmail || 'info@farminix.in'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              storySection: { ...(formData.storySection || {}), contactEmail: e.target.value },
                            })
                          }
                          className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Location</label>
                        <input
                          type="text"
                          value={formData.storySection?.contactLocation || 'Gorantla, Guntur – 522034, AP'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              storySection: { ...(formData.storySection || {}), contactLocation: e.target.value },
                            })
                          }
                          className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>
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
