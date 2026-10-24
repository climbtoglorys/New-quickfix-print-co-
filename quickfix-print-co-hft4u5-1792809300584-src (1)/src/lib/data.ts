import { createClient } from '@supabase/supabase-js';
import type {
  Enquiry,
  EnquiryInput,
  EnquiryStatus,
  Product,
  ProductCategory,
  ProductInput,
  ShowcaseInput,
  ShowcaseItem,
  ShowcaseKind,
} from './core';

const SUPABASE_URL = 'https://dgswfscdhkoybptfdwjg.supabase.co';
// Public (anon) key. It is safe in the browser because every table is protected by row-level security.
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc3dmc2NkaGtveWJwdGZkd2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NDIwNTIsImV4cCI6MjEwODAxODA1Mn0.HCwfpUtgrC0PH4gyT7yDAOjF5gA2bGiBskQqOQbkbgY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const BUCKETS = {
  products: 'product-images',
  showcase: 'showcase-images',
} as const;

interface DbError {
  message: string;
  code?: string;
}

function friendly(error: DbError): Error {
  if (
    error.code === '42501' ||
    /row-level security|permission denied/i.test(error.message)
  ) {
    return new Error(
      'You do not have permission to do that. Please sign in again.'
    );
  }
  return new Error(error.message);
}

function toProduct(row: Record<string, unknown>): Product {
  const raw = row.price_amount;
  return {
    ...(row as unknown as Product),
    price_amount: raw === null || raw === undefined ? null : Number(raw),
  };
}

/* ---------- Products ---------- */

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw friendly(error);
  return (data ?? []).map(r => toProduct(r as Record<string, unknown>));
}

export async function fetchProductBySlug(
  slug: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw friendly(error);
  return data ? toProduct(data as Record<string, unknown>) : null;
}

export async function fetchRelated(
  category: ProductCategory,
  excludeId: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('id', excludeId)
    .order('created_at', { ascending: false })
    .limit(3);
  if (error) throw friendly(error);
  return (data ?? []).map(r => toProduct(r as Record<string, unknown>));
}

export async function saveProduct(
  id: string | null,
  input: ProductInput
): Promise<void> {
  if (id) {
    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .select('id');
    if (error) throw friendly(error);
    if (!data || data.length === 0) {
      throw new Error(
        'The change was not saved. Your session may have expired. Please sign in again.'
      );
    }
    return;
  }
  let slug = input.slug;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { error } = await supabase
      .from('products')
      .insert({ ...input, slug });
    if (!error) return;
    if (error.code === '23505') {
      slug = `${input.slug}-${Math.random().toString(36).slice(2, 6)}`;
      continue;
    }
    throw friendly(error);
  }
  throw new Error(
    'Could not create a unique web address for this product. Try a slightly different name.'
  );
}

export async function deleteProduct(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .select('id');
  if (error) throw friendly(error);
  if (!data || data.length === 0) {
    throw new Error(
      'Nothing was deleted. Your session may have expired. Please sign in again.'
    );
  }
}

/* ---------- Works and clients ---------- */

export async function fetchShowcase(
  kind: ShowcaseKind,
  publishedOnly: boolean
): Promise<ShowcaseItem[]> {
  let query = supabase.from('showcase_items').select('*').eq('kind', kind);
  if (publishedOnly) query = query.eq('is_published', true);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw friendly(error);
  return (data ?? []) as ShowcaseItem[];
}

export async function saveShowcase(
  id: string | null,
  input: ShowcaseInput
): Promise<void> {
  if (id) {
    const { kind: _kind, ...changes } = input;
    void _kind;
    const { data, error } = await supabase
      .from('showcase_items')
      .update(changes)
      .eq('id', id)
      .select('id');
    if (error) throw friendly(error);
    if (!data || data.length === 0) {
      throw new Error(
        'The change was not saved. Your session may have expired. Please sign in again.'
      );
    }
    return;
  }
  const { error } = await supabase.from('showcase_items').insert(input);
  if (error) throw friendly(error);
}

export async function deleteShowcase(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('showcase_items')
    .delete()
    .eq('id', id)
    .select('id');
  if (error) throw friendly(error);
  if (!data || data.length === 0) {
    throw new Error(
      'Nothing was deleted. Your session may have expired. Please sign in again.'
    );
  }
}

/* ---------- Enquiries ---------- */

export async function submitEnquiry(input: EnquiryInput): Promise<void> {
  const { error } = await supabase
    .from('enquiries')
    .insert({ ...input, status: 'new' });
  if (error) throw new Error('save_failed');
}

export async function fetchEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw friendly(error);
  return (data ?? []) as Enquiry[];
}

export async function setEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<void> {
  const { data, error } = await supabase
    .from('enquiries')
    .update({ status })
    .eq('id', id)
    .select('id');
  if (error) throw friendly(error);
  if (!data || data.length === 0)
    throw new Error('The status was not changed. Please sign in again.');
}

export async function deleteEnquiry(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('enquiries')
    .delete()
    .eq('id', id)
    .select('id');
  if (error) throw friendly(error);
  if (!data || data.length === 0)
    throw new Error('Nothing was deleted. Please sign in again.');
}

/* ---------- Image storage ---------- */

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadImage(bucket: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type))
    throw new Error('Please choose a JPG, PNG or WebP image.');
  if (file.size > MAX_BYTES)
    throw new Error('That image is too large. The maximum size is 5 MB.');
  const ext =
    file.type === 'image/png'
      ? 'png'
      : file.type === 'image/webp'
        ? 'webp'
        : 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw friendly(error);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function removeStoredImage(
  bucket: string,
  url: string | null
): Promise<void> {
  if (!url) return;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index < 0) return;
  const path = decodeURIComponent(
    url.slice(index + marker.length).split('?')[0]
  );
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    // Best effort only: a leftover file does not affect the site.
  }
}
