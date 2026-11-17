import { toApiError } from '@/modules/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const PRODUCT_STATUSES = ['active', 'inactive', 'draft'] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type ProductSummary = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  availableOnline: boolean;
  featured: boolean;
  allowsPreOrder: boolean;
};

export type ProductPage = {
  items: ProductSummary[];
  page: number;
  perPage: number;
  total: number;
};

export type SaveProductPayload = Omit<ProductSummary, 'id'>;

async function request(token: string, path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  return response;
}

export async function listProducts(token: string, page: number, perPage: number): Promise<ProductPage> {
  const response = await request(token, `/products?page=${page}&perPage=${perPage}`);

  return (await response.json()) as ProductPage;
}

export async function getProduct(token: string, id: string): Promise<ProductSummary> {
  const response = await request(token, `/products/${encodeURIComponent(id)}`);

  return (await response.json()) as ProductSummary;
}

export async function createProduct(token: string, payload: SaveProductPayload): Promise<void> {
  await request(token, '/products', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateProduct(token: string, id: string, payload: SaveProductPayload): Promise<void> {
  await request(token, `/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(token: string, id: string): Promise<void> {
  await request(token, `/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
