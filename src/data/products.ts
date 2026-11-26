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
  reviewsList: [
    { id: 'rice-review-srinivas', userName: 'Srinivas R.', rating: 5, date: '', verified: false, comment: 'The rice cooks beautifully and the grains stay separate. Great taste and quality for everyday meals.', helpfulCount: 0, source: 'admin', enabled: true },
    { id: 'rice-review-lakshmi', userName: 'Lakshmi Devi', rating: 5, date: '', verified: false, comment: 'Very good quality rice. It has a nice aroma, cooks evenly, and my whole family loved it.', helpfulCount: 0, source: 'admin', enabled: true },
    { id: 'rice-review-ramesh', userName: 'Ramesh Kumar', rating: 5, date: '', verified: false, comment: 'Fresh, clean and excellent in quality. The rice is perfect for both regular meals and special dishes.', helpfulCount: 0, source: 'admin', enabled: true },
    { id: 'rice-review-priya', userName: 'Priya Sharma', rating: 5, date: '', verified: false, comment: 'I really liked the texture and taste. The grains are long and fluffy after cooking. Definitely worth buying again.', helpfulCount: 0, source: 'admin', enabled: true },
    { id: 'rice-review-venkatesh', userName: 'Venkatesh Rao', rating: 5, date: '', verified: false, comment: 'Excellent rice with consistent quality. It cooks well and tastes great with curries. Highly recommended.', helpfulCount: 0, source: 'admin', enabled: true },
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

const catalogVisuals: Record<string, string> = {
  powders: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=85',
  spices: 'https://ahbfoods.com/cdn/shop/collections/ChatGPT_Image_Mar_20_2026_03_36_43_PM.png?v=1774083584',
  'dry-fruits': 'https://bynature.co.za/cdn/shop/files/BNBin-MixedNuts-HRS.jpg?v=1687965457',
  grocery: 'https://organicmandya.com/cdn/shop/collections/Pulses.png?v=1779777460&width=1200',
  oils: 'https://cdn.shopify.com/s/files/1/2598/1404/files/Two_Brothers_Blog_Cover_55_600x600.webp?v=1709711755',
};

const catalogDescriptions: Record<string, string> = {
  'Chilly Powder': 'A bold, vibrant kitchen staple that brings warmth, colour, and a lively chilli finish to everyday curries, marinades, and snacks.',
  'Turmeric Powder': 'A golden everyday spice with an earthy aroma, made for dals, curries, rice dishes, and comforting home cooking.',
  'Coriander Powder': 'A fragrant, mellow spice with gentle citrus notes, ideal for building flavour in curries, gravies, and vegetable dishes.',
  'Red Chilly': 'Whole red chillies add an aromatic, slow-building heat to tadka, pickles, chutneys, and freshly ground masalas.',
  Cloves: 'Warm, aromatic whole cloves bring a deep, gently sweet spice to biryani, chai, marinades, and festive recipes.',
  Cumin: 'Earthy, toasted cumin seeds add a familiar savoury aroma to tadka, dals, rice, and freshly blended spice mixes.',
  'Cardamom pod': 'Fragrant green cardamom pods bring a bright, sweet aroma to chai, desserts, biryani, and special occasion cooking.',
  'Cashew Nuts': 'Naturally rich, creamy cashews are a versatile pantry favourite for snacking, festive sweets, gravies, and desserts.',
  Almonds: 'Crunchy almonds bring a delicate nutty flavour to breakfast bowls, sweets, baking, and everyday snacking.',
  Kishmish: 'Sweet, chewy raisins add natural fruity notes to pulao, desserts, breakfast bowls, and baked favourites.',
  Pistachios: 'Distinctive pistachios bring a mellow, buttery crunch to desserts, sweets, garnishes, and mindful snacking.',
  Peanuts: 'A familiar, satisfying pantry staple for chutneys, snacks, curries, and adding a roasted crunch to meals.',
  Dal: 'A wholesome everyday pulse for comforting dals, hearty soups, and nourishing family meals. Choose your preferred variety in the product details.',
  Sugar: 'A dependable everyday sweetener for tea, coffee, home baking, and favourite Indian desserts.',
  'Groundnut Oil': 'A versatile cooking oil with a warm, nutty character, suited to everyday sautéing, frying, and traditional recipes.',
};

const catalogUses: Record<string, string> = {
  'Chilly Powder': 'Stir into curries, marinades, chutneys, and snack seasonings. Add gradually to suit your preferred heat.',
  'Turmeric Powder': 'Use in dals, vegetable curries, rice dishes, and marinades. Add a small amount while cooking so it blends evenly.',
  'Coriander Powder': 'Add to curries, gravies, vegetable dishes, and spice blends for a rounded coriander flavour.',
  'Red Chilly': 'Use whole in tempering, pickle masala, and slow-cooked curries, or crush to add heat to a dish.',
  Cloves: 'Add whole cloves to biryani, chai, stocks, and slow-cooked dishes; remove whole spices before serving where preferred.',
  Cumin: 'Toast or temper the seeds for dals, rice, vegetables, and savoury spice blends.',
  'Cardamom pod': 'Crush lightly for chai and desserts, or add whole to biryani and other fragrant rice dishes.',
  'Cashew Nuts': 'Enjoy as a snack or use in sweets, desserts, breakfast bowls, and creamy gravies.',
  Almonds: 'Enjoy as a snack, or chop into breakfast bowls, sweets, and baked recipes.',
  Kishmish: 'Add to pulao, desserts, breakfast bowls, and baked recipes for a naturally sweet note.',
  Pistachios: 'Chop for sweets, desserts, breakfast bowls, and garnishes, or enjoy as a snack.',
  Peanuts: 'Use in chutneys, snacks, curries, and savoury dishes; roast or cook according to your recipe.',
  Dal: 'Use in dals, soups, and hearty family meals. Follow the preparation and cooking method for the selected dal variety.',
  Sugar: 'Use to sweeten tea and coffee, or as an ingredient in baking and desserts.',
  'Groundnut Oil': 'Use for everyday sautéing, frying, and traditional recipes. Follow the heating guidance on the pack.',
};

export const requestedCatalogProducts: Product[] = requestedCatalogItems.map((item) => ({
  ...item,
  price: 0,
  oldPrice: 0,
  discountPercentage: 0,
  weight: '',
  weightOptions: [],
  image: catalogVisuals[item.category.toLowerCase().replace(/\s+/g, '-')] || '/cat_household.jpg',
  deliveryTime: '',
  inStock: false,
  stockCount: 0,
  brand: '',
  description: catalogDescriptions[item.name] || `${item.name} is a versatile pantry essential for everyday home cooking. See product details for pack and availability information.`,
  ingredients: [item.name],
  highlights: [
    { icon: '🌿', title: 'Made for everyday cooking', desc: catalogDescriptions[item.name] || `${item.name} is a versatile pantry essential for everyday home cooking.` },
    { icon: '🍽️', title: 'Kitchen inspiration', desc: catalogUses[item.name] || `Use ${item.name.toLowerCase()} in recipes that call for it, adjusting to taste.` },
    { icon: '✨', title: 'A versatile pantry choice', desc: `Keep ${item.name.toLowerCase()} on hand for familiar recipes and everyday meals.` },
  ],
  benefits: [
    catalogUses[item.name] || `Use ${item.name.toLowerCase()} in recipes that call for it, adjusting to taste.`,
    `Pairs naturally with the ingredients and flavours used in ${item.category.toLowerCase()} recipes.`,
    'Store in a cool, dry place and keep sealed between uses.',
  ],
  howToUse: [`Add ${item.name.toLowerCase()} to your recipe as needed, adjusting to your preferred taste and cooking method.`, 'Follow the preparation method for your chosen recipe.'],
  storageInstructions: 'Keep in a clean, cool, dry place away from direct sunlight and moisture. Once opened, transfer to an airtight container.',
  faqs: [
    { question: `How can I use ${item.name}?`, answer: catalogDescriptions[item.name] || `${item.name} is suited to a range of familiar everyday recipes.` },
    { question: 'When will pack and price details be available?', answer: 'Farminix is preparing verified pack, price, and availability information for this listing.' },
  ],
  enabled: true,
  catalogOnly: true,
}));

// Keep the existing verified rice product and add the requested name-only catalog entries.
export const allProducts: Product[] = [farminixRiceProduct, ...requestedCatalogProducts];

// Popular Today is curated; administrators can choose and reorder products in the dashboard.
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
  Powders: ['Chilly Powder', 'Turmeric Powder', 'Coriander Powder'],
  Spices: ['Red Chilly', 'Cloves', 'Cumin', 'Cardamom pod'],
  'Dry Fruits': ['Cashew Nuts', 'Almonds', 'Kishmish', 'Pistachios', 'Peanuts'],
  Grocery: ['Dal', 'Sugar'],
  Oils: ['Groundnut Oil'],
  'Rice & Grains': ['Family Choice Rice', '26 Kg Bags'],
};

export const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  'Chilly Powder': ['chilly powder'], 'Turmeric Powder': ['turmeric'], 'Coriander Powder': ['coriander'],
  'Red Chilly': ['red chilly', 'chilli'], Cloves: ['cloves'], Cumin: ['cumin'], 'Cardamom pod': ['cardamom'],
  'Cashew Nuts': ['cashew'], Almonds: ['almond'], Kishmish: ['kishmish', 'raisin'], Pistachios: ['pistachio'], Peanuts: ['peanut'],
  Dal: ['dal'], Sugar: ['sugar'], 'Groundnut Oil': ['groundnut oil'],
  'Family Choice Rice': ['family choice', 'rice', 'farminix', '26kg', '26 kg'],
  '26 Kg Bags': ['26kg', '26 kg', 'bag', 'bags'],
};
