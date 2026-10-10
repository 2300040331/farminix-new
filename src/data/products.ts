import type { Product, Category, DealCard } from '../types';
import { BrandLogos } from '../assets/graphics';

export const categories: Category[] = [
  { id: 'rice', name: 'Rice & Grains', image: '/farminix_rice_front.png', itemCount: 1 },
];

export const farminixRiceProduct: Product = {
  id: 'r1',
  name: 'Farminix Family Choice Rice',
  category: 'Rice & Grains',
  price: 1399,
  oldPrice: 1699,
  weight: '26 Kg',
  weightOptions: ['26 Kg'],
  image: '/farminix_rice_front.png',
  galleryImages: ['/farminix_rice_back.png'],
  deliveryTime: 'Express Delivery (10-30 Mins)',
  rating: 4.9,
  reviewsCount: 2840,
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
    '1. Open Pan: Bring a large pan of water to a rolling boil. Add measured rice, return to a medium boil and cook uncovered for 10 min. Drain and rinse with fresh boiling water.',
    '2. Covered Pan: Put measured rice and cold water into a heavy-based pan. Bring to boil, stir, cover and turn down to a gentle simmer for 10 min. Turn off heat and leave covered for 5 min.',
    '3. Microwave: Put measured amount of rice and cold water into a deep microwaveable bowl. Cover with cling film pierced 3 times. Cook on high for 8 min. Uncover, stir, and cook for another 8 min.',
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
  reviewsList: [
    {
      id: 'rev-1',
      userName: 'Priya S.',
      rating: 5,
      date: 'Yesterday',
      verified: true,
      comment:
        'Farminix Family Choice Rice has truly surpassed our expectations. Grains are spotless, aroma is delightful, and it cooks fluffy without getting mushy. The 26 Kg bag arrived in pristine condition!',
      helpfulCount: 54,
    },
    {
      id: 'rev-2',
      userName: 'Venkatesh Rao',
      rating: 5,
      date: '3 days ago',
      verified: true,
      comment:
        'Best everyday rice in Guntur. Having the genuine Farminix 26kg bag delivered straight home saves a lot of supermarket hassle. Taste and texture are 10/10.',
      helpfulCount: 38,
    },
    {
      id: 'rev-3',
      userName: 'Lakshmi Narayana',
      rating: 5,
      date: '1 week ago',
      verified: true,
      comment:
        'Clean, long grains with great cooking consistency. Perfectly packed bag. Very happy with the quality from Farminix.',
      helpfulCount: 22,
    },
  ],
};

// Catalog contains exclusively the Farminix Family Choice Rice
export const allProducts: Product[] = [
  farminixRiceProduct,
];

// Popular Today contains only Farminix Family Choice Rice
export const popularProducts: Product[] = [
  farminixRiceProduct,
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
