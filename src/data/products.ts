import type { Product, Category, DealCard } from '../types';
import { BrandLogos } from '../assets/graphics';

export const categories: Category[] = [
  { id: 'powders', name: 'Powders', image: '', itemCount: 0, items: ['Chilly Powder', 'Turmeric Powder', 'Coriander Powder'] },
  { id: 'spices', name: 'Spices', image: '', itemCount: 0, items: ['Red Chilly', 'Cloves', 'Cumin', 'Cardamom pod'] },
  { id: 'dry-fruits', name: 'Dry Fruits', image: '', itemCount: 0, items: ['Cashew Nuts', 'Almonds', 'Kishmish', 'Pistachios', 'Peanuts'] },
  { id: 'grocery', name: 'Grocery', image: '', itemCount: 0, items: ['Dal', 'Sugar'] },
  { id: 'oils', name: 'Oils', image: '', itemCount: 0, items: ['Groundnut Oil'] },
];

export const farminixRiceProduct: Product = {
  id: 'r1',
  name: 'Farminix Family Choice Rice',
  category: 'Rice & Grains',
  price: 2100,
  oldPrice: 3000,
  discountPercentage: 30,
  weight: '26 Kg',
  weightOptions: ['26 Kg'],
  image: '/farminix_rice_front.png',
  galleryImages: ['/farminix_rice_back.png'],
  deliveryTime: 'Express Delivery (10-30 Mins)',
  inStock: true,
  stockCount: 150,
  brand: 'Farminix',
  description:
    "Farminix Signature Family Choice Rice (ఫ్యామిలీ ఛాయిస్ రైస్ | फैमिली चॉइस राइस | குடும்பத் தேர்வு அரிసి) is safely selected from quality harvests across India's fertile rice-growing regions. Every grain is chosen for its consistency, purity, and taste, tested in professional facilities, processed, and hygienically packed to deliver fresh, wholesome rice for your family's everyday meals.",
  ingredients: ['100% Quality Harvest Milled Rice (Premium Select Grains)'],
  nutritionalInfo: {
    energy: '160 kcal (Per 45g / 1/4 cup serving)',
    protein: '3 g',
    carbs: '37 g (13% DV)',
    fat: '0 g (0% DV)',
    fiber: '1 g',
    sugar: '0 g',
    sodium: '0 mg (0% DV)',
  },
  badges: ['Farminix Official', '100% Genuine', 'Direct from Mill', '26 Kg Family Bag'],
  highlights: [
    {
      icon: '🌾',
      title: 'Premium Quality Harvest',
      desc: "Safely selected from India's most fertile rice-growing regions for supreme aroma, texture, and grain integrity.",
    },
    {
      icon: '✨',
      title: 'Everyday Family Choice',
      desc: 'Tested in professional facilities and hygienically packed to deliver wholesome meals for your family every day.',
    },
    {
      icon: '📦',
      title: 'Heavy-Duty 26 Kg Packaging',
      desc: 'Durable, heat-sealed, reinforced bulk bag designed to preserve aroma and prevent moisture.',
    },
    {
      icon: '⚡',
      title: 'Express Doorstep Delivery',
      desc: 'Delivered directly from Farminix local processing units in Guntur straight to your home.',
    },
  ],
  benefits: [
    'Every single grain is selected for uniform length, smooth texture, and non-sticky cooking.',
    'Rich in clean complex carbohydrates for sustained all-day energy with 0g Fat and 0mg Sodium.',
    'Hygienically machine-cleaned, de-stoned, and packed under strict FSSAI food safety regulations.',
    'Economical 26 Kg family bag size providing 260+ hearty servings for joint families and gatherings.',
  ],
  specifications: [
    { label: 'Brand', value: 'Farminix' },
    { label: 'Product Name', value: 'Farminix Family Choice Rice' },
    { label: 'Net Quantity', value: '26 Kg' },
    { label: 'Dietary Preference', value: '100% Vegetarian 🟢' },
    { label: 'FSSAI License No.', value: '20126142000933' },
    { label: 'Manufactured & Marketed By', value: 'Farminix Private Limited' },
    { label: 'Registered Address', value: 'Flat No 302, Srinivasa Towers, Gorantla, Guntur - 522034, Andhra Pradesh' },
    { label: 'Customer Contact', value: '+91 7989743595' },
    { label: 'Customer Support Email', value: 'info@farminix.in' },
    { label: 'Official Website', value: 'www.farminix.in' },
    { label: 'Shelf Life', value: '24 Months from Packaging Date' },
    { label: 'Barcode', value: '8908032796002' },
    { label: 'Country of Origin', value: 'India' },
  ],
  howToUse: [
    'Open Pan: Bring a large pan of water to a rolling boil. Add measured rice, return to a medium boil and cook uncovered for 10 min. Drain and rinse with fresh boiling water.',
    'Covered Pan: Put measured rice and cold water into a heavy-based pan. Bring to boil, stir, cover and turn down to a gentle simmer for 10 min. Turn off heat and leave covered for 5 min.',
    'Microwave: Put measured amount of rice and cold water into a deep microwaveable bowl. Cover with cling film pierced 3 times. Cook on high for 8 min. Uncover, stir, and cook for another 8 min.',
  ],
  storageInstructions:
    'Always store bags off the ground in a hygienic, cool, dry place, away from sunlight and moisture. Once opened, store in an airtight container.',
  faqs: [
    {
      question: 'What is the exact net weight of this Farminix rice bag?',
      answer: 'This bag contains exactly 26 Kg of Farminix Family Choice Rice, designed as an economical monthly pack for families.',
    },
    {
      question: 'Where is Farminix Family Choice Rice packed and distributed from?',
      answer: 'It is manufactured and marketed by Farminix Private Limited at Srinivasa Towers, Gorantla, Guntur, Andhra Pradesh (FSSAI Lic No: 20126142000933).',
    },
    {
      question: 'Does this rice bag come with front and back quality guarantee?',
      answer: 'Yes, both front and back bag specifications are authentic Farminix standards with full barcode and FSSAI traceability.',
    },
    {
      question: 'How many servings are in a 26 Kg bag?',
      answer: 'Based on the standard 45g (1/4 cup) serving size, each 26 Kg pack provides over 260+ wholesome servings.',
    },
  ],
};

const requestedCatalogItems: Array<{ id: string; name: string; category: string }> = [
  { id: 'prod-chilly-powder', name: 'Chilly Powder', category: 'Powders' },
  { id: 'prod-turmeric-powder', name: 'Turmeric Powder', category: 'Powders' },
  { id: 'prod-coriander-powder', name: 'Coriander Powder', category: 'Powders' },
  { id: 'prod-red-chilly', name: 'Red Chilly', category: 'Spices' },
  { id: 'prod-cloves', name: 'Cloves', category: 'Spices' },
  { id: 'prod-cumin', name: 'Cumin', category: 'Spices' },
  { id: 'prod-cardamom-pod', name: 'Cardamom pod', category: 'Spices' },
  { id: 'prod-cashew-nuts', name: 'Cashew Nuts', category: 'Dry Fruits' },
  { id: 'prod-almonds', name: 'Almonds', category: 'Dry Fruits' },
  { id: 'prod-kishmish', name: 'Kishmish', category: 'Dry Fruits' },
  { id: 'prod-pistachios', name: 'Pistachios', category: 'Dry Fruits' },
  { id: 'prod-peanuts', name: 'Peanuts', category: 'Dry Fruits' },
  { id: 'prod-dal', name: 'Dal', category: 'Grocery' },
  { id: 'prod-sugar', name: 'Sugar', category: 'Grocery' },
  { id: 'prod-groundnut-oil', name: 'Groundnut Oil', category: 'Oils' },
];

export const requestedCatalogProducts: Product[] = requestedCatalogItems.map((item) => ({
  ...item,
  price: 0,
  oldPrice: 0,
  discountPercentage: 0,
  weight: '',
  weightOptions: [],
  image: '',
  deliveryTime: '',
  inStock: false,
  stockCount: 0,
  brand: '',
  description: '',
  enabled: true,
  catalogOnly: true,
}));

// Keep the existing verified rice product and add the requested name-only catalog entries.
export const allProducts: Product[] = [farminixRiceProduct, ...requestedCatalogProducts];

// Popular Today starts with the full current catalog; admins can choose featured products.
export const popularProducts: Product[] = [
  ...allProducts,
];

export const epicDeals: DealCard[] = [
  { id: 'd1', categoryName: 'Rice & Grains', discountBadge: 'SPECIAL PRICE', image: '/farminix_rice_front.png', brands: [{ name: 'Farminix', logo: BrandLogos.daawat }] },
];

export const brandLogosList = [
  { name: 'Farminix', logo: '/farminix_logo.png' },
];

export const SUB_CATEGORIES: Record<string, string[]> = {
  'Rice & Grains': ['Family Choice Rice', '26 Kg Bags'],
};

export const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  'Family Choice Rice': ['family choice', 'rice', 'farminix', '26kg', '26 kg'],
  '26 Kg Bags': ['26kg', '26 kg', 'bag', 'bags'],
};
