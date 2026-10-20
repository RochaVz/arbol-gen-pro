/**
 * Configuración global de los tests.
 *
 * jsdom no implementa IndexedDB, así que se instala `fake-indexeddb` en
 * el entorno global. A partir de aquí, cualquier test puede usar
 * `indexedDB` igual que en el navegador.
 *
 * Referencia: ROADMAP.md Fase 0 (tarea 0.6) y Fase 2 (persistencia local).
 */
import 'fake-indexeddb/auto'
