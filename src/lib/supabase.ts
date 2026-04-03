import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbListing {
  id: string;
  created_at: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string | null;
  engine_size: string | null;
  horsepower: number | null;
  doors: number;
  title: string;
  description: string | null;
  city: string;
  features: string[];
  images: string[];
  seller_name: string;
  seller_phone: string;
  seller_email: string | null;
  status: string;
}
