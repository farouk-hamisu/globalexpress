import {createClient} from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kwvtwzwbzpycnushljlb.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3dnR3endienB5Y251c2hsamxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NTAyNzcsImV4cCI6MjA5NjIyNjI3N30.6HI0QO0DYj9dydjHKAgNBJ4CsUQoUxPAOX73J4jyysc";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
