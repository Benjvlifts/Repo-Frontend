# ️ Innovatech Solutions - Frontend
> **Cliente Web Moderno de Gestión Integrada**
> Plataforma desarrollada en React y empaquetada con Vite.
---
## 📑 Tabla de Contenidos
1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Requisitos Previos](#requisitos-previos)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Instalación y Despliegue
Local](#instalación-y-despliegue-local)
5. [GUÍA DE EJECUCIÓN DE PRUEBAS Y
REPORTES](#guía-de-ejecución-de-pruebas-y-reportes)
---
## 📌 Descripción del Proyecto
Cliente web moderno, responsivo y de alto rendimiento desarrollado
en **React** y empaquetado utilizando **Vite**. La aplicación
implementa las vistas y herramientas necesarias para la
plataforma, conectándose a los microservicios del ecosistema a
través del Backend For Frontend (BFF).
---
## ✅ Requisitos Previos

Versiones recomendadas para la ejecución:
* **Node.js**: Versión `18.x` o superior (Recomendado `20.x` LTS).
* **NPM**: Versión `9.x` o superior (se instala junto a Node.js).
---
## 📁 Estructura del Proyecto
* `src/components/`: Componentes reutilizables de UI y lógicos.
* `src/context/`: Contextos globales de React (ej. manejo de
estado de sesión).
* `public/`: Archivos estáticos que no pasan por el pipeline de
compilación de Vite.
---
## 🚀 Instalación y Despliegue Local
Siga exactamente estos pasos para levantar el entorno de
desarrollo:
1. Ingresar a la carpeta del frontend:
```bash
cd innovatech-frontend-valdes-munoz
```
2. Instalar las dependencias del proyecto:
```bash
npm install
```
3. Levantar la aplicación:
```bash
npm run dev
```

---
## 🧪 GUÍA DE EJECUCIÓN DE PRUEBAS Y REPORTES (Sección Crítica)
El proyecto utiliza herramientas estándar para la cobertura de
código. Siga estos pasos rigurosamente:
### 1. Ejecutar Pruebas y Generar Reporte
Ejecute el siguiente comando detallado y exacto para correr las
pruebas y generar el reporte de cobertura en un solo paso:

```bash
npm run test -- --coverage
```
### 2. Acceso al Reporte HTML
Una vez finalizado, el reporte generado localmente se almacenará
en la siguiente ruta exacta:
* `/coverage/index.html`
**Cómo abrirlo:** Diríjase a la carpeta del proyecto en su
explorador de archivos y abra el archivo `index.html` en su
navegador de preferencia para su revisión.
### 3. Explicación de Métricas Clave
El reporte mostrará distintas métricas que deben validarse para
cumplir con el **mínimo del 60%** requerido:
* **Statements (Declaraciones):** Porcentaje de las sentencias
ejecutadas durante las pruebas.
* **Branches (Ramas):** Porcentaje de rutas lógicas (ej. if/else)
transitadas.
* **Functions (Funciones):** Porcentaje de funciones invocadas por
los tests.
* **Lines (Líneas):** Porcentaje total de líneas ejecutadas.
Asegúrese de que ninguna métrica caiga por debajo del 60% para que
el código sea considerado válido.