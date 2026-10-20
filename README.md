# ARBOL-GEN-PRO

Una aplicación de árbol genealógico familiar colaborativo que permite registrar varias generaciones, incorporar fotografías, compartir árboles con familiares y trabajar sin conexión a internet.

## Características

- **Tree Management**: Crear y gestionar árboles genealógicos familiares
- **Offline-First**: Trabajar completamente sin conexión con sincronización automática cuando se recupere la conexión
- **PWA Installable**: Instalar como aplicación nativa en dispositivos móviles y escritorio
- **Photo Integration**: Incorporar, comprimir y optimizar fotografías familiares
- **Collaborative**: Compartir árboles con permisos granulares para familiares
- **Secure**: Privacidad por diseño con Row Level Security y permisos validados en servidor

## Tecnologías

- **Frontend**: React, TypeScript, Vite, PWA
- **Almacenamiento Local**: IndexedDB con Dexie.js
- **Backend**: Supabase (Auth, PostgreSQL, Row Level Security)
- **Gestión de Imágenes**: Compresión en navegador, versiones optimizadas, Cloudflare R2 para almacenamiento
- **Sincronización**: Cola persistente de cambios, reintentos, resolución de conflictos

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd arbol-gen-pro
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Copie `.env.example` a `.env` y configure:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   ```

6. **Previsualizar build**
   ```bash
   npm run preview
   ```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta el linter (Oxlint)
- `npm run test` - Ejecuta las pruebas (Vitest)

## Arquitectura

Consulte los siguientes documentos para detalles de arquitectura:

- [ARCHITECTURE.md](ARCHITECTURE.md) - Visión general de la arquitectura
- [DATA-MODEL.md](DATA-MODEL.md) - Modelo de datos y entidades
- [SYNC-ARCHITECTURE.md](SYNC-ARCHITECTURE.md) - Sistema de sincronización offline-first
- [ROADMAP.md](ROADMAP.md) - Plan de implementación por fases
- `STORAGE-STRATEGY.md` - Estrategia de almacenamiento de imágenes *(pendiente de escribir)*
- `SECURITY.md` - Medidas de seguridad y privacidad *(pendiente de escribir)*

## Licencia

MIT
