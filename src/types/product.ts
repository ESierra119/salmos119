export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost_price: number;
  shipping_cost: number;
  category_id: string | null;
  image_url: string | null;
  stock: number;
  is_preorder: boolean;
  internal_code: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
};

export type PaymentType = 'contado' | 'credito';

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Sale = {
  id: string;
  sale_date: string;
  customer_name: string;
  customer_phone: string | null;
  customer_id: string | null;
  product_id: string | null;
  product_name_snapshot: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  payment_type: PaymentType;
  credit_surcharge_rate: number;
  installments_count: number;
  paid_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SalePayment = {
  id: string;
  sale_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  qty: number;
};
