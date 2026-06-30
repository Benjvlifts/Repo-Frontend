# Innovatech Solutions - Frontend Client (SPA)

Este repositorio contiene la capa de presentación de **Innovatech Solutions**, una aplicación de página única (SPA) de alto rendimiento diseñada para la gestión inteligente de proyectos tecnológicos, visualización de KPIs y asignación de recursos. 

La arquitectura se fundamenta en un cliente desacoplado que interactúa de manera puramente asíncrona mediante el patrón BFF (Backend For Frontend) utilizando transporte seguro sobre HTTP/REST.

## 1. Arquitectura y Tecnologías Core

* **Librería Principal:** [React 19](https://react.dev/) (^19.2.5) - Aprovechando el nuevo motor de renderizado concurrente y gestión nativa de recursos.
* **Herramienta de Empaquetado y Bundling:** [Vite 8](https://vite.dev/) (^8.0.10) - Compilación ultra-rápida basada en ESM nativo y transformaciones de código optimizadas.
* **Enrutamiento:** React Router Dom (^7.6.0) - Declarativo y protegido por Guards de autenticación.
* **Cliente HTTP:** Axios (^1.15.2) - Implementación de interceptores para la inyección automatizada de tokens JWT y manejo global de excepciones de red.
* **Testing Engine:** [Vitest](https://vitest.dev/) (^4.1.9) + React Testing Library (^16.3.2) - Suite moderna de ejecución de pruebas en paralelo integrada nativamente en el pipeline de Vite.

---

## 2. Requisitos Previos

Antes de proceder con la instalación, asegúrese de contar con las herramientas correctas en su estación de trabajo:

* **Node.js:** Versión `v20.x.x` (LTS recomendado) o superior. No se garantiza compatibilidad con versiones inferiores a v18.
* **NPM:** Versión `10.x.x` o superior (incluido por defecto con Node.js).

Para verificar su entorno local, ejecute en su terminal:
```bash
node -v
npm -v
3. Instalación y Despliegue LocalSiga este orden cronológico para inicializar el servidor de desarrollo local:Clonar el repositorio y posicionarse en la carpeta raíz del frontend:Bashcd innovatech-frontend
Instalar el árbol completo de dependencias (incluyendo las herramientas de desarrollo y pruebas):Bashnpm install
Lanzar el servidor de desarrollo con recarga en caliente (Hot Module Replacement - HMR):Bashnpm run dev
El cliente estará disponible de forma predeterminada en el puerto local: http://localhost:5173/.4. Estructura del ProyectoEl código fuente se encuentra modularizado bajo principios de cohesión interna y bajo acoplamiento:Plaintext├── public/                 # Recursos estáticos globales (íconos, imágenes base)
├── src/
│   ├── assets/             # Estilos CSS globales y recursos visuales compilables
│   ├── components/         # Componentes atómicos e interfaces UI reutilizables
│   ├── context/            # Estado global de la aplicación (Ej. AuthContext para RBAC)
│   ├── reducers/           # Reducers puros para mutación de estados lógicos (Ej. authReducer)
│   ├── views/              # Vistas completas de la SPA (KpiView, ProjectsView, etc.)
│   ├── App.jsx             # Componente raíz y enrutador principal
│   └── main.jsx            # Punto de entrada de la aplicación para el DOM de React
├── package.json            # Manifiesto de dependencias y scripts de orquestación
├── vite.config.js          # Configuración del compilador Vite
└── vitest.config.js        # Configuración del motor de pruebas y cobertura
5. Guía de Ejecución de Pruebas y Reportes de CalidadEl proyecto implementa una estricta política de aseguramiento de calidad (QA). Todos los componentes visuales críticos, contextos y funciones utilitarias deben estar cubiertos por pruebas unitarias automatizadas.5.1. Matriz de Comandos de TestingObjetivo TécnicoComando de EjecuciónDescripción OperacionalModo Interactivo (TDD)npm run test o npx vitestInicia la suite en modo observador (watch mode). Escanea cambios en tiempo real.Ejecución Única (CI)npm run test -- --runEjecuta las pruebas una sola vez y finaliza el proceso (ideal para pipelines de CI/CD).Generación de Coberturanpm run test:coverageCompila las pruebas, evalúa los caminos lógicos y genera el reporte HTML de JaCoCo/V8.5.2. Generación y Visualización del Reporte de Cobertura LocalPara auditar el estado actual del código en su estación local y comprobar los criterios de aceptación, ejecute:Bashnpm run test:coverage
Este comando invoca el motor @vitest/coverage-v8, el cual intercepta las llamadas del árbol de renderizado virtual (JSDOM) y calcula las métricas exactas de inspección.Ruta del Reporte HTML:Una vez finalizada la ejecución, los artefactos visuales se compilarán en la siguiente ruta relativa:Plaintext/coverage/index.html
Cómo visualizarlo:Abra el explorador de archivos de su sistema operativo.Navegue hasta la carpeta raíz del proyecto y acceda al directorio /coverage.Haga doble clic sobre el archivo index.html para abrir el panel gráfico interactivo en su navegador web predeterminado (Chrome, Firefox, Edge).5.3. Análisis de Métricas de Cobertura (Mínimo Rúbrica: 60%)El reporte gráfico de Vitest expone cuatro dimensiones fundamentales que deben ser analizadas críticamente:% Statements (Declaraciones): Mide el porcentaje de expresiones ejecutables que han sido procesadas por los tests (asignaciones, llamadas a funciones, etc.).% Branches (Ramas / Condicionales): Evalúa si los flujos de control binarios o múltiples (if, else, switch, operadores ternarios) fueron cruzados en ambos sentidos (verdadero y falso). Es la métrica más crítica para mitigar bugs en producción.% Functions (Funciones): Indica la cantidad de métodos y funciones declaradas que fueron invocadas al menos una vez durante las pruebas.% Lines (Líneas): Porcentaje de líneas físicas de código fuente visitadas por el motor de ejecución.⚠️ CONTROL DE CALIDAD (QUALITY GATE): De acuerdo con la rúbrica institucional y las políticas DevSecOps de Innovatech Solutions, ninguna métrica analizada debe estar por debajo del 60.0%. Si el reporte local marca un número inferior, la compilación se considerará fallida y el cambio no podrá ser integrado a la rama principal.