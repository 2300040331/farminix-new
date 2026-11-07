import type { FooterLink } from '../admin/types';

export interface PolicyPageContent {
  id: 'refund' | 'privacy' | 'terms';
  title: string;
  path: string;
  aliases: string[];
  description: string;
  sections: { title: string; text: string }[];
}

// Business policy wording supplied by Farminix. Keep these clauses unchanged.
export const policyPages: PolicyPageContent[] = [
  {
    id: 'refund', title: 'Refund and Cancellation Policy', path: '/refund-policy',
    aliases: ['/refund-and-cancellation-policy', '/refund-cancellation-policy', '/cancellation-policy'],
    description: 'Returns, replacements, refund processing and order cancellation.',
    sections: [
      { title: 'Return Eligibility', text: 'Customers can request a return or replacement within the specified return period if the product is damaged, defective, incorrect, or different from the description.' },
      { title: 'Refund Processing', text: "Once the returned product is received and inspected, eligible refunds will be initiated to the customer's original payment method or another approved payment method." },
      { title: 'Refund Timeline', text: 'Refunds will generally be processed within 5–10 business days after approval. Actual credit time may depend on the bank or payment provider.' },
      { title: 'Non-Returnable Products', text: 'Certain products, including personal care, hygiene, perishable, and customized items, may not be eligible for return unless damaged, defective, or incorrectly delivered.' },
      { title: 'Cancellation Policy', text: 'Customers can cancel an order before it is shipped. Once shipped, cancellation may not be possible, and the applicable return process will apply.' },
    ],
  },
  {
    id: 'privacy', title: 'Privacy Policy', path: '/privacy-policy', aliases: [],
    description: 'How customer information is collected, used, protected and shared.',
    sections: [
      { title: 'Personal Information', text: 'We collect customer information such as name, mobile number, email address, delivery address, and other details required to provide our services.' },
      { title: 'Payment Information', text: "Payments are processed through secure third-party payment gateways. We do not store customers' complete card details, UPI PINs, or banking passwords." },
      { title: 'Information Usage', text: 'Customer information is used for order processing, delivery, customer support, communication, and improving our services.' },
      { title: 'Data Protection', text: 'We implement reasonable security measures to protect customer information against unauthorized access, misuse, alteration, or disclosure.' },
      { title: 'Third-Party Sharing', text: 'Customer information may be shared with delivery partners, payment providers, and service providers only when necessary to complete transactions or provide services, subject to applicable laws.' },
    ],
  },
  {
    id: 'terms', title: 'Terms and Conditions', path: '/terms-and-conditions', aliases: ['/terms', '/terms-conditions'],
    description: 'Account registration, product information, orders, payments and delivery.',
    sections: [
      { title: 'Account Registration', text: 'Customers must provide accurate and complete information while creating an account and are responsible for maintaining the confidentiality of their login credentials.' },
      { title: 'Product Information', text: 'Product images, descriptions, prices, availability, and specifications are provided for customer reference. Minor variations may occur.' },
      { title: 'Orders & Payments', text: 'All orders are subject to acceptance and product availability. The company reserves the right to cancel orders in cases of pricing errors, stock issues, or suspected fraudulent transactions, subject to applicable laws.' },
      { title: 'Delivery & Shipping', text: 'Delivery timelines are estimates and may vary depending on location, courier availability, weather conditions, and other operational circumstances.' },
      { title: 'Policy Changes', text: 'The company reserves the right to update these Terms & Conditions from time to time. Updated policies will be published on the website or application.' },
    ],
  },
];

export const policyForPath = (path: string) => policyPages.find(page => page.path === path.replace(/\/+$/, '') || page.aliases.includes(path.replace(/\/+$/, '')));
export const defaultPolicyLinks: FooterLink[] = policyPages.map(page => ({ id: `policy-${page.id}`, label: page.title, url: page.path, actionType: 'url', enabled: true }));

export function footerPolicyLinks(saved?: FooterLink[]): FooterLink[] {
  const extra = (Array.isArray(saved) ? saved : []).filter(link => {
    if (!link || typeof link.label !== 'string' || !link.label.trim() || typeof link.url !== 'string' || !link.url || link.url === '#' || /privacy|refund|cancell|terms/i.test(link.label) || policyForPath(link.url)) return false;
    if (link.url.startsWith('/') && !link.url.startsWith('//')) return true;
    try { return ['http:', 'https:'].includes(new URL(link.url).protocol); } catch { return false; }
  });
  const seen = new Set(defaultPolicyLinks.map(link => link.url));
  return [...defaultPolicyLinks.map(link => ({ ...link })), ...extra.filter(link => { if (seen.has(link.url)) return false; seen.add(link.url); return true; })];
}
