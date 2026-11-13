/**
 * Vitest setup file for arbol-gen-pro project.
 * 
 * Provides IndexedDB polyfill via fake-indexeddb for jsdom environment,
 * since the app uses Dexie.js for local persistence with IndexedDB.
 * Also sets up global mocks if needed.
 */

import 'fake-indexeddb/auto';

// Ensure required globals are available
if (typeof window !== 'undefined') {
  // Mock ResizeObserver if needed
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() { }
      unobserve() { }
      disconnect() { }
    };
  }
  
  // Mock MutationObserver if needed
  if (!window.MutationObserver) {
    window.MutationObserver = class MutationObserver {
      observe() { }
      disconnect() { }
      takeRecords() { return []; }
    };
  }
}