# 🖥️ innovatech-frontend-valdes-munoz

> **Frontend** de la plataforma Innovatech Solutions — Evaluación Parcial 2  
> Asignatura: DSY1106 – Desarrollo Fullstack III | Instituto DuocUC | 2026  
> Estudiantes: **Benjamín Valdés** · **Ignacio Muñoz**

---

## 📑 Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Requisitos Previos](#requisitos-previos)
5. [Instalación Paso a Paso](#instalación-paso-a-paso)
6. [Ejecución en Desarrollo](#ejecución-en-desarrollo)
7. [Variables de Entorno](#variables-de-entorno)
8. [Funcionalidades Implementadas](#funcionalidades-implementadas)
9. [Rutas de la Aplicación](#rutas-de-la-aplicación)
10. [Componentes Principales](#componentes-principales)
11. [Conexión con el Backend (BFF)](#conexión-con-el-backend-bff)
12. [Construcción para Producción](#construcción-para-producción)
13. [Resolución de Problemas Comunes](#resolución-de-problemas-comunes)

---

## 📌 Descripción del Proyecto

Este repositorio contiene el componente **frontend** de la plataforma Innovatech Solutions, desarrollado con **React 18** y **Vite**. Implementa las vistas de autenticación (registro e inicio de sesión) y el dashboard principal del sistema, consumiendo los servicios expuestos por el BFF (Backend For Frontend).

### Arquitectura en Contexto

```
[Browser / Usuario]
        ↓
[Frontend React - :5173]
        ↓  (fetch HTTP)
[BFF Node.js - :3001]
        ↓  (HTTP / JWT)
[Kong API Gateway - :8000]
        ↓
[Microservicios: ms-auth (:8081) | ms-proyectos (:8082)]
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.x | Librería de UI basada en componentes |
| Vite | 5.x | Bundler y servidor de desarrollo |
| React Router DOM | 6.x | Enrutamiento SPA |
| Context API | (nativo) | Gestión de estado de autenticación |
| CSS Modules | (nativo) | Estilos encapsulados por componente |
| Node.js | ≥ 18 | Entorno de ejecución |
| NPM | ≥ 9 | Gestor de paquetes |

---

## 📁 Estructura del Proyecto

```
innovatech-frontend-valdes-munoz/
├── public/
│   ├── favicon.svg          # Ícono de la aplicación
│   └── icons.svg            # Íconos del sistema
├── src/
│   ├── assets/
│   │   ├── hero.png         # Imagen principal del hero
│   │   ├── react.svg        # Logo de React
│   │   └── vite.svg         # Logo de Vite
│   ├── components/
│   │   └── PrivateRoute.jsx # HOC protector de rutas autenticadas
│   ├── context/
│   │   └── AuthContext.jsx  # Contexto global de autenticación
│   ├── pages/
│   │   ├── LoginPage.jsx    # Página de inicio de sesión
│   │   ├── RegisterPage.jsx # Página de registro de usuario
│   │   └── DashboardPage.jsx# Dashboard principal (ruta protegida)
│   ├── services/
│   │   ├── authService.js   # Llamadas HTTP a endpoints de auth (/api/auth)
│   │   └── projectService.js# Llamadas HTTP a endpoints de proyectos (/api/projects)
│   ├── App.jsx              # Componente raíz con definición de rutas
│   ├── App.css              # Estilos globales
│   ├── index.css            # Reset CSS y variables globales
│   └── main.jsx             # Punto de entrada de React
├── index.html               # HTML raíz (Vite)
├── vite.config.js           # Configuración de Vite (proxy al BFF)
├── package.json             # Dependencias y scripts NPM
├── eslint.config.js         # Reglas de linting
└── README.md                # Este archivo
```

---

## ✅ Requisitos Previos

Antes de instalar el frontend, asegúrate de tener instalado:

1. **Node.js ≥ 18** — [Descargar en nodejs.org](https://nodejs.org)
2. **NPM ≥ 9** — Se instala automáticamente con Node.js
3. **BFF corriendo** — El BFF debe estar activo en `http://localhost:3001`
4. **Microservicios corriendo** — ms-auth y ms-proyectos deben estar activos

Verificar instalaciones:
```bash
node --version    # Debe mostrar v18.x o superior
npm --version     # Debe mostrar 9.x o superior
```

---

## 📥 Instalación Paso a Paso

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/innovatech-frontend-valdes-munoz.git
cd innovatech-frontend-valdes-munoz
```

### Paso 2: Instalar dependencias

```bash
npm install
```

Este comando descarga todas las dependencias listadas en `package.json` al directorio `node_modules/`. Puede tomar 1-3 minutos dependiendo de la conexión a internet.

**Salida esperada:**
```
added 312 packages, and audited 313 packages in 45s
```

---

## ▶️ Ejecución en Desarrollo

```bash
npm run dev
```

**Salida esperada en consola:**
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h + enter to show help
```

Abrir en el navegador: **http://localhost:5173**

> ⚠️ **Importante:** El frontend requiere que el BFF esté corriendo en `http://localhost:3001`. Si el BFF no está activo, las llamadas a `/api/*` retornarán errores de conexión.

---

## 🔧 Variables de Entorno

El frontend **no requiere archivo `.env`** para funcionar en desarrollo. La URL del BFF está configurada en `vite.config.js` mediante un proxy:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
```

Esto redirige automáticamente todas las peticiones a `/api/*` hacia `http://localhost:3001/api/*`, eliminando problemas de CORS en desarrollo.

---

## 🚀 Funcionalidades Implementadas

### Autenticación
- ✅ **Registro de usuario** — Formulario con validación (username, email, password, rol)
- ✅ **Inicio de sesión** — Formulario con manejo de errores (credenciales inválidas)
- ✅ **Gestión de token JWT** — Almacenamiento en `localStorage`, incluido en headers HTTP
- ✅ **Logout** — Limpieza del token y redirección al login
- ✅ **Rutas protegidas** — Redirección automática al login si no hay sesión activa

### Dashboard
- ✅ **Vista de proyectos** — Listado de proyectos del usuario autenticado
- ✅ **Perfil de usuario** — Visualización del nombre y rol del usuario logueado
- ✅ **Indicador de estado del sistema** — Muestra si el backend está disponible

---

## 🗺️ Rutas de la Aplicación

| Ruta | Componente | Acceso | Descripción |
|------|-----------|--------|-------------|
| `/` | Redirect | Público | Redirige a `/login` o `/dashboard` según autenticación |
| `/login` | LoginPage | Público | Formulario de inicio de sesión |
| `/register` | RegisterPage | Público | Formulario de registro de nuevo usuario |
| `/dashboard` | DashboardPage | Privado | Vista principal del sistema (requiere JWT) |

Las rutas privadas están protegidas por el componente `PrivateRoute`, que verifica la existencia del token JWT en el contexto de autenticación. Si no hay token, redirige automáticamente a `/login`.

---

## 🧩 Componentes Principales

### AuthContext (`src/context/AuthContext.jsx`)

Contexto React que gestiona el estado global de autenticación:

```jsx
// Estado disponible en toda la aplicación
const { user, token, login, logout, isAuthenticated } = useAuth();
```

- `user` — Objeto con datos del usuario (username, email, rol)
- `token` — JWT almacenado en localStorage
- `login(credentials)` — Llama a authService y actualiza el estado
- `logout()` — Limpia el token y redirige al login
- `isAuthenticated` — Boolean que indica si hay sesión activa

### PrivateRoute (`src/components/PrivateRoute.jsx`)

Higher-Order Component que protege rutas autenticadas:

```jsx
<Route path="/dashboard" element={
  <PrivateRoute>
    <DashboardPage />
  </PrivateRoute>
} />
```

### authService (`src/services/authService.js`)

Capa de servicio para llamadas HTTP a endpoints de autenticación:

| Función | Endpoint BFF | Método | Descripción |
|---------|-------------|--------|-------------|
| `register(data)` | `/api/auth/register` | POST | Registra nuevo usuario |
| `login(credentials)` | `/api/auth/login` | POST | Autentica usuario y retorna JWT |
| `getProfile()` | `/api/auth/profile` | GET | Obtiene datos del usuario autenticado |

---

## 🔌 Conexión con el Backend (BFF)

El frontend se comunica **exclusivamente con el BFF** (nunca directamente con los microservicios). El BFF actúa como intermediario, valida el JWT y enruta las peticiones.

**Flujo de autenticación:**

```
1. Usuario llena formulario de login
2. LoginPage → authService.login(credentials)
3. authService → POST /api/auth/login (al BFF via proxy Vite)
4. BFF → POST http://ms-auth:8081/auth/login
5. ms-auth valida credenciales → retorna JWT
6. BFF → retorna JWT al frontend
7. AuthContext almacena JWT en localStorage
8. React Router redirige a /dashboard
```

**Headers enviados en peticiones autenticadas:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 🏗️ Construcción para Producción

```bash
npm run build
```

Genera el directorio `dist/` con los archivos estáticos optimizados:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js   (bundle JS)
│   └── index-[hash].css  (bundle CSS)
└── ...
```

Para previsualizar la build antes de desplegar:
```bash
npm run preview
# Disponible en http://localhost:4173
```

---

## 🩺 Resolución de Problemas Comunes

### ❌ Error: "Cannot connect to localhost:3001"

**Causa:** El BFF no está corriendo.  
**Solución:** Iniciar el BFF con `npm run dev` en el directorio `innovatech-bff-valdes-munoz/`.

### ❌ Error: "401 Unauthorized" al acceder al dashboard

**Causa:** El token JWT expiró o es inválido.  
**Solución:** Hacer logout y volver a iniciar sesión.

### ❌ Error: "node_modules not found" al ejecutar `npm run dev`

**Causa:** Las dependencias no están instaladas.  
**Solución:** Ejecutar `npm install` en el directorio raíz del proyecto.

### ❌ La página muestra pantalla en blanco

**Causa:** Error de JavaScript en consola del navegador.  
**Solución:** Abrir DevTools (F12) → pestaña Console → revisar el error específico.

### ❌ Error de CORS en peticiones al BFF

**Causa:** No se está usando el proxy de Vite (se está accediendo directamente al BFF desde otra URL).  
**Solución:** Acceder siempre a través de `http://localhost:5173`, no directamente a `http://localhost:3001`.

---

## 👥 Contribuidores

| Estudiante | GitHub | Rol Principal |
|-----------|--------|---------------|
| Benjamín Valdés | @benjaminvaldes | BFF + ms-auth |
| Ignacio Muñoz | @ignacionunoz | Frontend + ms-proyectos |

---

**Instituto DuocUC 2026 — DSY1106 Desarrollo Fullstack III —*
