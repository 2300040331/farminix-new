export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  verified: boolean;
  comment: string;
  helpfulCount: number;
}

export interface ProductHighlight {
  icon: string;
  title: string;
  desc: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface FarmToTableStep {
  step: string;
  title: string;
  desc: string;
}

export interface PhilosophyPillar {
  tag: string;
  title: string;
  desc: string;
  guarantee: string;
}

export interface ProductStorySection {
  headline?: string;
  subheadline?: string;
  tags?: string[];
  founderTitle?: string;
  founderSubtitle?: string;
  founderLetter?: string;
  founderQuote?: string;
  founderSignoff?: string;
  companyAddress?: string;
  processTitle?: string;
  processSubtitle?: string;
  processSteps?: FarmToTableStep[];
  philosophyTitle?: string;
  philosophySubtitle?: string;
  philosophyPillars?: PhilosophyPillar[];
  calloutTitle?: string;
  calloutDesc?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactLocation?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  weight: string;
  weightOptions?: string[];
  image: string;
  galleryImages?: string[];
  deliveryTime: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount: number;
  brand: string;
  description: string;
  enabled?: boolean; // Add support for Hide/Show
  ingredients?: string[];
  nutritionalInfo?: {
    energy: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber?: string;
    sugar?: string;
    sodium?: string;
  };
  badges?: string[];
  highlights?: ProductHighlight[];
  benefits?: string[];
  specifications?: ProductSpecification[];
  howToUse?: string[];
  storageInstructions?: string;
  origin?: string;
  shelfLife?: string;
  dietaryType?: 'veg' | 'non-veg' | 'vegan';
  faqs?: ProductFAQ[];
  reviewsList?: Review[];
  frequentlyBoughtTogetherIds?: string[];
  storySection?: ProductStorySection;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  itemCount: number;
  enabled?: boolean; // Add support for Hide/Show
}

export interface DealCard {
  id: string;
  categoryName: string;
  discountBadge: string;
  image: string;
  brands: { name: string; logo: string }[];
  enabled?: boolean;
}

export interface UserAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  addresses: UserAddress[];
  rewardPoints: number;
  walletBalance: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  deliveryFee: number;
  finalAmount: number;
  status: 'Order Received' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  estimatedTime: string;
  deliveryAddress: UserAddress;
  paymentMethod: string;
}
