// Cliente Supabase para el navegador (solo claves públicas).
// Offline-first: si las variables no están definidas, el cliente es null
// y la sincronización remota se deshabilita sin romper la app.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { assertUuid, isUuid, uuidv7 } from '../../shared/utils/uuid';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const LOCAL_IDENTITY_KEY = 'arbol-gen-pro:local-owner-id';

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;


export function isSupabaseConfigured(): boolean {
  return !!supabase;
}

export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function getCurrentUserId(): Promise<string> {
  if (supabase) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session?.user.id) {
      assertUuid(data.session.user.id, 'userId');
      return data.session.user.id;
    }
  }

  if (typeof localStorage === 'undefined') return uuidv7();
  const existing = localStorage.getItem(LOCAL_IDENTITY_KEY);
  if (isUuid(existing)) return existing;

  const id = uuidv7();
  localStorage.setItem(LOCAL_IDENTITY_KEY, id);
  return id;
}

