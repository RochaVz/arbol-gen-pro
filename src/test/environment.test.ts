import { describe, it, expect, afterEach } from 'vitest'

/**
 * Prueba de disponibilidad del entorno de persistencia local.
 *
 * No prueba funcionalidad del dominio: prueba que la base sobre la que
 * se construirá la Fase 2 (persistencia local con Dexie) está disponible
 * y es utilizable desde los tests.
 *
 * Referencia: ROADMAP.md Fase 0, criterio de aceptación.
 */

const TEST_DB = 'arbol-gen-pro-test'

function abrirBase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(TEST_DB, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore('items')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function escribir(db: IDBDatabase, clave: string, valor: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('items', 'readwrite')
    tx.objectStore('items').put(valor, clave)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

function leer(db: IDBDatabase, clave: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('items', 'readonly')
    const request = tx.objectStore('items').get(clave)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

describe('entorno de persistencia local', () => {
  let db: IDBDatabase | undefined

  afterEach(async () => {
    db?.close()
    db = undefined
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(TEST_DB)
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
      request.onblocked = () => resolve()
    })
  })

  it('expone IndexedDB en el entorno de test', () => {
    expect(typeof indexedDB).toBe('object')
    expect(indexedDB).toBeDefined()
  })

  it('permite escribir y leer un registro', async () => {
    db = await abrirBase()

    await escribir(db, 'a', { id: 'a', valor: 1 })

    const registro = await leer(db, 'a')
    expect(registro).toEqual({ id: 'a', valor: 1 })
  })

  it('conserva los datos tras cerrar y reabrir la base', async () => {
    db = await abrirBase()
    await escribir(db, 'b', { id: 'b', valor: 2 })
    db.close()
    db = undefined

    db = await abrirBase()
    const registro = await leer(db, 'b')
    expect(registro).toEqual({ id: 'b', valor: 2 })
  })
})
