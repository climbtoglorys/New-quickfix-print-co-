export type ProductCategory =
  | 'printing-machines'
  | 'toners-cartridges'
  | 'consumables'
  | 'spare-parts-accessories';
export type Availability =
  | 'to-be-confirmed'
  | 'in-stock'
  | 'out-of-stock'
  | 'available-on-request';
export type PriceMode = 'contact-for-price' | 'show-price';
export type EnquiryStatus = 'new' | 'read' | 'handled';
export type ShowcaseKind = 'work' | 'client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  model_code: string | null;
  short_description: string | null;
  full_description: string | null;
  image_url: string | null;
  price_amount: number | null;
  currency: string;
  price_display_mode: PriceMode;
  availability: Availability;
  featured: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export interface ShowcaseItem {
  id: string;
  kind: ShowcaseKind;
  title: string;
  description: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface ShowcaseInput {
  kind: ShowcaseKind;
  title: string;
  description: string | null;
  image_url: string | null;
  is_published: boolean;
}

export interface Enquiry {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  enquiry_category: string | null;
  product_reference: string | null;
  message: string;
  status: EnquiryStatus;
  created_at: string;
}

export interface EnquiryInput {
  full_name: string;
  phone: string;
  email: string | null;
  enquiry_category: string | null;
  product_reference: string | null;
  message: string;
}

export const BUSINESS = {
  name: 'Quickfix Print & Co',
  registration: 'RC 8706060',
  address: 'Area 10, Garki, Abuja, Nigeria',
  phones: [
    { display: '0818 543 8551', tel: '+2348185438551', wa: '2348185438551' },
    { display: '0701 783 2640', tel: '+2347017832640', wa: '2347017832640' },
  ],
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Area+10+Garki+Abuja',
};

export const GENERAL_MESSAGE =
  'Hello Quickfix Print & Co, I would like to enquire about your printing products and supplies.';

export function whatsappLink(message: string): string {
  return `https://wa.me/${BUSINESS.phones[0].wa}?text=${encodeURIComponent(message)}`;
}

export function productMessage(name: string, code?: string | null): string {
  const ref = code ? ` ${code}` : '';
  return `Hello Quickfix Print & Co, I am interested in ${name}${ref}. Please confirm the current price, availability, and compatibility.`;
}

export const CATEGORIES: {
  value: ProductCategory;
  label: string;
  blurb: string;
}[] = [
  {
    value: 'printing-machines',
    label: 'Printing Machines',
    blurb: 'Multifunction photocopiers and printing machines.',
  },
  {
    value: 'toners-cartridges',
    label: 'Toners & Cartridges',
    blurb: 'Toner cartridges for printers and copiers.',
  },
  {
    value: 'consumables',
    label: 'Consumables',
    blurb: 'Printing consumables and related supplies.',
  },
  {
    value: 'spare-parts-accessories',
    label: 'Spare Parts & Accessories',
    blurb: 'Printer spare parts, accessories and components.',
  },
];

export function categoryLabel(value: ProductCategory): string {
  return CATEGORIES.find(c => c.value === value)?.label ?? value;
}

export function isCategory(value: string | null): value is ProductCategory {
  return CATEGORIES.some(c => c.value === value);
}

export const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: 'to-be-confirmed', label: 'To be confirmed' },
  { value: 'in-stock', label: 'In stock' },
  { value: 'out-of-stock', label: 'Out of stock' },
  { value: 'available-on-request', label: 'Available on request' },
];

export function availabilityLabel(value: Availability): string {
  return AVAILABILITY_OPTIONS.find(a => a.value === value)?.label ?? value;
}

export function priceLabel(p: Product): string {
  if (
    p.price_display_mode === 'show-price' &&
    p.price_amount !== null &&
    p.price_amount !== undefined
  ) {
    let text: string;
    try {
      text = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: p.currency || 'NGN',
        maximumFractionDigits: 2,
      }).format(Number(p.price_amount));
    } catch {
      text = `${p.currency} ${Number(p.price_amount).toLocaleString()}`;
    }
    return p.is_demo ? `${text} (sample value)` : text;
  }
  return 'Contact for price';
}

export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/, '');
  return s || 'product';
}

export function errMsg(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return 'Something went wrong. Please try again.';
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}
