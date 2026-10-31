import { supabase } from '../supabase';
import { pullChanges } from './pullClient';

let channel: any = null;
let started = false;

export function startRealtimeSync(onChange?: () => void): void {
  if (started || !supabase) return;
  started = true;
  channel = supabase
    .channel('arbol-gen-pro-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'persons' }, () => { void pullChanges().then(() => onChange?.()); })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'relationships' }, () => { void pullChanges().then(() => onChange?.()); })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => { void pullChanges().then(() => onChange?.()); })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => { void pullChanges().then(() => onChange?.()); })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trees' }, () => { void pullChanges().then(() => onChange?.()); })
    .subscribe();
}

export function stopRealtimeSync(): void {
  if (!started || !supabase) return;
  started = false;
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }
}
