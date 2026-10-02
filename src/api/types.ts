/** Response shapes for the parts of the Toolshop REST API this suite uses. */

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sub_categories?: Category[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  is_location_offer: boolean;
  is_rental: boolean;
  in_stock: boolean;
  co2_rating?: string;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  brand: Pick<Brand, 'id' | 'name'>;
}

export interface Paginated<T> {
  current_page: number;
  data: T[];
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  cart_id: string;
  product_id: string;
  product: Product;
}

export interface Cart {
  id: string;
  cart_items: CartItem[];
}

export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export type ProductSort = 'name,asc' | 'name,desc' | 'price,asc' | 'price,desc';

export interface ProductQuery {
  page?: number;
  sort?: ProductSort;
  by_category?: string;
  by_brand?: string;
}
