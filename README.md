# 🖥️ Innovatech Solutions — Frontend

![React](https://img.shields.io/badge/React-19.2.5-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.0.10-646CFF?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.1.9-6E9F18?logo=vitest&logoColor=white)
![Coverage](https://img.shields.io/badge/coverage-%E2%89%A560%25-brightgreen)
![SonarCloud Quality Gate](https://img.shields.io/badge/SonarCloud-Quality%20Gate%20A-4E9BCD?logo=sonarcloud&logoColor=white)
![License](https://img.shields.io/badge/uso-académico-lightgrey)

> Single Page Application (SPA) que actúa como capa de presentación del ecosistema **Innovatech Solutions**, consumiendo los servicios expuestos por el **BFF (Backend For Frontend)** mediante peticiones HTTP asíncronas.
>
> **Asignatura:** DSY1106 — Desarrollo Fullstack III · Instituto Profesional DuocUC (2026)
> **Autores:** Benjamín Valdés · Ignacio Muñoz

---

## Tabla de Contenidos

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Patrones y Seguridad](#3-patrones-y-seguridad)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Prerrequisitos e Instalación](#5-prerrequisitos-e-instalación)
6. [Testing](#6-testing)

---

## 1. Descripción del Proyecto

El presente repositorio contiene la **capa de presentación (Frontend)** del ecosistema fullstack Innovatech Solutions, una plataforma de gestión integrada de proyectos, recursos humanos, indicadores (KPIs) y notificaciones.

Está construido como una **SPA en React 19**, empaquetada con **Vite**, que no se comunica directamente con los microservicios de dominio, sino que delega toda la orquestación de red al patrón **BFF (Backend For Frontend)**. Esto mantiene al cliente desacoplado de la topología interna del sistema distribuido (Kong API Gateway, cinco microservicios Spring Boot y el broker de eventos Apache Kafka).

### Arquitectura en Contexto

```
 [Navegador / Usuario]
          │  HTTPS
          ▼
 [Frontend React 19 — :5173]  ← este repositorio
          │  Axios (proxy /api en desarrollo)
          ▼
 [BFF Node.js / Express — :3000]
          │  HTTP + JWT
          ▼
 [Kong API Gateway — :8000]
          │
          ▼
 [ms-auth] [ms-proyectos] [ms-recursos] [ms-analitica] [ms-notif]
          │
          ▼
 [Apache Kafka — EDA] · [PostgreSQL por microservicio]
```

### Módulos Funcionales

La aplicación expone un dashboard con navegación condicionada por **rol de usuario** (`ADMIN`, `MANAGER`, `EMPLOYEE`), resuelto en tiempo de renderizado a partir del JWT decodificado en sesión:

| Módulo | Vista | Roles con acceso |
|---|---|---|
| Gestión de Proyectos | `ProjectsView.jsx` | `ADMIN`, `MANAGER`, `EMPLOYEE` |
| Recursos Humanos | `ResourcesView.jsx` | `ADMIN`, `MANAGER` |
| Métricas / KPIs | `KpiView.jsx` | `ADMIN`, `MANAGER` |
| Notificaciones | `NotificationsView.jsx` | `ADMIN`, `MANAGER`, `EMPLOYEE` |

Adicionalmente, el módulo de autenticación (`LoginPage.jsx` / `RegisterPage.jsx`) gestiona el ingreso, registro de usuarios y persistencia de sesión.

---

## 2. Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | `^19.2.5` | Librería de UI basada en componentes funcionales y Hooks |
| **Vite** | `^8.0.10` | Bundler y servidor de desarrollo con HMR |
| **React Router DOM** | `^7.6.0` | Enrutamiento declarativo de la SPA (`Routes`, `Route`, `Navigate`) |
| **Axios** | `^1.15.2` | Cliente HTTP con interceptores para consumo del BFF |
| **Context API + `useReducer`** | nativo | Gestión de estado global de autenticación |
| **Vitest** | `^4.1.9` | Test runner nativo de Vite (reemplaza a Jest) |
| **@vitest/coverage-v8** | `^4.1.9` | Motor de cobertura de código basado en V8 |
| **React Testing Library** | `^16.3.2` | Renderizado y aserciones sobre componentes en memoria |
| **@testing-library/jest-dom** | `^6.9.1` | Matchers adicionales de DOM para Vitest |
| **@testing-library/user-event** | `^14.6.1` | Simulación fidedigna de eventos de usuario |
| **axios-mock-adapter** | `^2.1.0` | Interceptación y mockeo de peticiones HTTP en tests |
| **jsdom** | `^29.1.1` | Entorno DOM simulado para ejecutar tests sin navegador real |
| **ESLint** | `^10.2.1` | Linting con `eslint-plugin-react-hooks` y `react-refresh` |
| **Node.js** | `type: module` | Proyecto 100% ESM (`import`/`export`) |

---

## 3. Patrones y Seguridad

### 3.1. `AuthContext` — Estado Global de Autenticación (Observer + Reducer)

La sesión del usuario se gestiona mediante un **Context** de React combinado con `useReducer`, exponiendo un estado predecible y centralizado que cualquier componente puede "observar" a través del hook `useAuth()`:

```js
const initialState = { user: null, token: null, isAuthenticated: false, isLoading: true }
// Acciones del reducer: LOGIN · RESTORE · LOGOUT · LOADED
```

Al montar la aplicación, `AuthProvider` intenta **restaurar la sesión** leyendo `localStorage` (claves `innovatech_token` e `innovatech_user`) antes de renderizar cualquier ruta protegida, evitando parpadeos de redirección (`isLoading` como guarda de carga).

### 3.2. `PrivateRoute` — Guarda de Rutas

Componente wrapper que protege rutas privadas (`/dashboard`), consultando `isAuthenticated` e `isLoading` desde `AuthContext`. Si no existe sesión activa, redirige de forma declarativa a `/login` mediante `<Navigate replace />`, evitando que el usuario pueda retroceder a una vista protegida con el botón "atrás" del navegador.

### 3.3. Interceptores de Axios para JWT

Toda la comunicación HTTP se centraliza en una única instancia de Axios (`src/services/api.js`), que:

- Inyecta automáticamente el header `Authorization: Bearer <token>` en **cada petición saliente**, leyendo el token desde `localStorage` mediante un interceptor de request.
- Define un **timeout de 10 segundos**, previniendo estados de carga infinitos si el BFF no responde.
- Normaliza cualquier error de red o de respuesta HTTP en un objeto homogéneo `{ message, status }` mediante la función `parseError`, consumida por un wrapper `call()` que envuelve cada llamada de los servicios (`authService`, `projectService`, `resourceService`, `analiticaService`, `notifService`).

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('innovatech_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

### 3.4. Renderizado Condicionado por Rol (RBAC en Cliente)

El *sidebar* del dashboard filtra dinámicamente sus ítems de navegación (`NAV_ITEMS`) según el rol contenido en el JWT del usuario autenticado, ocultando módulos administrativos (Recursos Humanos, KPIs) a usuarios con rol `EMPLOYEE`. Esta capa de control en el cliente es **complementaria** —no sustituta— de la autorización real aplicada en `ms-auth` y en cada microservicio.

> **Nota de arquitectura:** al igual que la mayoría de las SPAs que persisten JWT en `localStorage` para simplicidad de implementación, el token queda expuesto a vectores XSS si se introduce código de terceros no confiable. Como mitigación complementaria, el BFF aplica cabeceras seguras vía `Helmet`, una política CORS de lista blanca y `Rate Limiting`, documentadas en el README del repositorio Backend.

---

## 4. Estructura del Proyecto

```
Repo-Frontend/
├── .github/workflows/
│   └── frontend-ci.yml              # Pipeline CI: Node 20.x + Vitest
├── README.md                        # Este archivo
└── innovatech-frontend-valdes-munoz/
    ├── index.html                   # Entry point HTML (Vite)
    ├── package.json                 # Dependencias y scripts NPM
    ├── vite.config.js               # Config. de Vite + proxy /api → BFF
    ├── vitest.config.js             # Config. de Vitest + umbrales de cobertura
    ├── eslint.config.js             # Reglas de linting
    └── src/
        ├── main.jsx                 # Bootstrap: BrowserRouter › AuthProvider › App
        ├── App.jsx                  # Definición de rutas de la SPA
        ├── index.css                # Reset CSS y variables globales de diseño
        ├── context/
        │   └── AuthContext.jsx      # Estado global de sesión (Context + Reducer)
        ├── components/
        │   └── PrivateRoute.jsx     # Guarda de rutas privadas
        ├── services/
        │   ├── api.js               # Instancia Axios centralizada + interceptor JWT
        │   ├── authService.js       # Endpoints /api/auth
        │   ├── projectService.js    # Endpoints /api/projects
        │   ├── resourceService.js   # Endpoints /api/resources
        │   ├── analiticaService.js  # Endpoints /api/v1/analitica
        │   └── notifService.js      # Endpoints /api/v1/notificaciones
        ├── pages/
        │   ├── LoginPage.jsx        # Inicio de sesión
        │   ├── RegisterPage.jsx     # Registro de usuario
        │   ├── DashboardPage.jsx    # Layout principal + navegación por rol
        │   └── dashboard/
        │       ├── ProjectsView.jsx
        │       ├── ResourcesView.jsx
        │       ├── KpiView.jsx
        │       ├── NotificationsView.jsx
        │       ├── atoms.jsx        # Componentes atómicos reutilizables (Spinner, Badges…)
        │       └── tokens.js        # Design tokens (colores, radios, espaciados)
        └── __tests__/               # Suite de pruebas unitarias e integración (Vitest)
```

---

## 5. Prerrequisitos e Instalación

### Prerrequisitos

| Herramienta | Versión mínima |
|---|---|
| **Node.js** | `18.x` (recomendado `20.x LTS`, versión usada en CI) |
| **npm** | `9.x` o superior (se instala junto a Node.js) |
| **BFF activo** | corriendo en `http://127.0.0.1:3000` (puerto configurable vía `PORT`) |

Verificar instalación local:

```bash
node --version
npm --version
```

### Instalación

```bash
# 1. Ingresar a la carpeta del proyecto
cd innovatech-frontend-valdes-munoz

# 2. Instalar dependencias
npm install

# 3. Levantar el entorno de desarrollo
npm run dev
```

La aplicación queda disponible en **`http://localhost:5173`**.

> ⚠️ El frontend **no requiere archivo `.env`** en desarrollo: `vite.config.js` define un proxy que redirige toda petición `/api/*` hacia el BFF (`http://127.0.0.1:3000`), evitando problemas de CORS en local. Si el BFF no está activo, las vistas mostrarán errores de conexión al consumir cualquier servicio.

### Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo de Vite (con HMR) |
| `npm run build` | Genera el *build* de producción optimizado en `dist/` |
| `npm run preview` | Sirve localmente el build de producción para verificación |
| `npm run lint` | Ejecuta ESLint sobre todo el código fuente |
| `npm run test` | Ejecuta la suite de pruebas con Vitest en modo *watch* |

---

## 6. Testing

### 6.1. Configuración

La suite de pruebas se apoya en **Vitest** (motor nativo de Vite) junto con **React Testing Library** sobre un entorno DOM simulado con **jsdom**, evitando la necesidad de un navegador real:

- `environment: 'jsdom'` — simula `window`, `document` y `localStorage` para renderizar componentes en memoria.
- `setupFiles: ['./src/__tests__/setup.js']` — inicializa `@testing-library/jest-dom` y mockea `localStorage` (`getItem`, `setItem`, `removeItem`, `clear`) para aislar los tests de `AuthContext` y de los servicios.
- **`axios-mock-adapter`** intercepta las llamadas HTTP salientes de la capa `services/`, permitiendo probar el manejo de éxito/error de cada endpoint sin depender del BFF real.
- **`@testing-library/user-event`** simula interacción real de usuario (clicks, tipeo) sobre formularios como `LoginPage` y `RegisterPage`.

### 6.2. Cobertura de Código (`@vitest/coverage-v8`)

El *Quality Gate* local está definido directamente en `vitest.config.js`, bloqueando la ejecución si alguna métrica cae por debajo del umbral exigido:

| Métrica | Umbral mínimo exigido |
|---|---|
| Statements | `60%` |
| Branches | `60%` |
| Functions | `60%` |
| Lines | `60%` |

Se excluyen del cálculo de cobertura los archivos sin lógica de negocio testeable: `src/main.jsx`, `src/App.jsx`, `src/**/__tests__/**`, archivos `*.test.{js,jsx}`, `src/assets/**` y `src/pages/dashboard/tokens.js` (constantes de diseño).

**Comandos:**

```bash
# Ejecutar la suite una sola vez (modo CI)
npm run test -- --run

# Ejecutar con reporte de cobertura
npm run test -- --coverage
```

El reporte HTML se genera en `coverage/index.html` y puede abrirse directamente en el navegador para inspección detallada archivo por archivo.

### 6.3. Resumen de la Suite Actual

La última ejecución registrada confirma **34 pruebas pasando en 9 archivos de test**, cumpliendo el umbral global de cobertura configurado (≥60%):

| Archivo | Tests | Cubre |
|---|---|---|
| `__tests__/AuthContext.test.jsx` | 4 | Reducer de sesión, restauración desde `localStorage`, login/logout |
| `__tests__/PrivateRoute.test.jsx` | 2 | Redirección a `/login` sin sesión, renderizado con sesión activa |
| `__tests__/AuthPages.test.jsx` | 4 | Formularios de `LoginPage` / `RegisterPage`, flujos de error en campos vacíos |
| `__tests__/services.test.js` | 5 | Lógica de `services/api.js`: interceptor JWT, `parseError`, wrapper `call()` |
| `__tests__/allServices.test.js` | 4 | Endpoints de `projectService`, `resourceService`, `analiticaService`, `notifService` |
| `dashboard/tests/ProjectsView.test.jsx` | 4 | Listado y gestión de proyectos |
| `dashboard/tests/ResourcesView.test.jsx` | 4 | Listado y disponibilidad de recursos |
| `dashboard/tests/KpiView.test.jsx` | 3 | Renderizado de métricas e indicadores |
| `dashboard/tests/NotificationsView.test.jsx` | 4 | Listado y marcado de notificaciones como leídas |
| **Total** | **34** | **9 archivos — 100% passing** |

### 6.4. Integración Continua

El workflow `.github/workflows/frontend-ci.yml` se dispara ante cada `push` a `main`/`master`, ejecutando en un runner `ubuntu-latest` con **Node.js 20.x** (caché de `npm` habilitada) el comando `npm install` seguido de `npm run test -- --run`, bloqueando el merge ante cualquier prueba fallida. El análisis estático complementario (SonarCloud) se ejecuta sobre este mismo repositorio, reportando *Quality Gate* **A** en Reliability y Maintainability.
