/**
 * Analytics Placeholder para Arbol Gen Pro
 * 
 * Para configurar analytics real, reemplazar esta sección con tu proveedor preferido:
 * - Google Analytics: reemplazar UA-XXXXX-X con tu ID de propiedad
 * - Plausible: reemplazar data-url-base con tu dominio
 * - Matomo: configurar el endpoint y ID de sitio
 */
export const logVisit = (page: string, extra?: object) => {
  console.log('Visita a página:', page, extra || '');
  // TODO: Integrar con proveedor de analytics preferido
  // Ejemplo Google Analytics:
  // gtag('event', 'page_view', { page_path: page });
  // Ejemplo Plausible:
  // plausible.track(page);
};