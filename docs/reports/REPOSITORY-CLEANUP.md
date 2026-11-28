# Reporte de limpieza del repositorio

**Fecha:** 2026-11-27  
**Fase:** 1  
**Compatibilidad funcional:** sin cambios al código de aplicación.

## Resultado

Se organizó la documentación histórica bajo categorías estables:

- `docs/architecture/`: contratos y documentación de arquitectura.
- `docs/audits/`: auditorías técnicas.
- `docs/checkpoints/`: cierres y puntos de control.
- `docs/phases/`: seguimiento y entregables por fase.
- `docs/reports/`: resúmenes, sesiones e informes.
- `docs/decisions/`: roadmaps y decisiones históricas.

Se consolidaron todos los archivos de configuración de herramientas en `config/`, con referencias explícitas desde los scripts de `package.json`.

Se mantuvieron en la raíz únicamente documentos estándar del proyecto, los manifiestos y el archivo de entrada HTML.

## Artefactos retirados

Se eliminaron salidas capturadas y scripts de reparación de un solo uso, incluidos:

- archivos `build*.txt`, `log*.txt` y `*output.txt`;
- `errors.txt`, `output.txt`, `temp.txt` y `test.txt`;
- `add-react-import.cjs`, `fix-props.cjs`, `fix.py`, `fix_opacity.ps1` y `run_fixes.py`;
- logs de desarrollo no rastreados `build.log`, `dev.log` y `new_dev.log`.

Estos artefactos no formaban parte del runtime ni contenían código fuente activo.

## Ignore actualizado

Se reforzó `.gitignore` para evitar que vuelvan a versionarse:

- salidas de build, compilador y tests;
- logs y archivos temporales conocidos;
- scripts ad-hoc de reparación.

## Referencias

Se actualizaron las referencias activas desde:

- `README.md`;
- `ARCHITECTURE.md`;
- `docs/DOCUMENTATION-INDEX.md`.

Los documentos históricos pueden conservar descripciones de rutas propias del momento en que fueron creados; no se reescribió su contenido porque actuarían como registros históricos.

## Trabajo preservado

`REPORT-Tecnico-2026-11-26.md` estaba sin rastrear antes de esta fase. Se conservó íntegro y se movió a `docs/reports/`, porque su contenido es un informe técnico histórico y el propio alcance de la fase exige organizar documentación existente.

## Verificación

- movimientos realizados con Git para preservar historial;
- ningún archivo de `src/` o `supabase/` modificado;
- se ejecutarán nuevamente lint, pruebas y build antes del commit de la fase.

## Criterio pendiente

La raíz queda con 14 elementos visibles fuera de metadatos y artefactos generados, por debajo del objetivo de 15. La configuración está centralizada y los archivos restantes son áreas de producto, entrada, manifiestos o documentación estándar del proyecto.
