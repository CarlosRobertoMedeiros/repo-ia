import { toApiError } from './api-error.util';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type UserSummary = {
  id: string;
  name: string;
  email: string;
};

export type UserPage = {
  items: UserSummary[];
  page: number;
  perPage: number;
  total: number;
};

export type SaveUserPayload = {
  name: string;
  email: string;
  password?: string;
};

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

export async function listUsers(token: string, page: number, perPage: number): Promise<UserPage> {
  const response = await request(token, `/users?page=${page}&perPage=${perPage}`);

  return (await response.json()) as UserPage;
}

export async function getUser(token: string, id: string): Promise<UserSummary> {
  const response = await request(token, `/users/${encodeURIComponent(id)}`);

  return (await response.json()) as UserSummary;
}

export async function createUser(token: string, payload: SaveUserPayload): Promise<void> {
  await request(token, '/users', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateUser(token: string, id: string, payload: SaveUserPayload): Promise<void> {
  await request(token, `/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(token: string, id: string): Promise<void> {
  await request(token, `/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
