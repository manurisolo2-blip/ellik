# ellik. — Auditor Visual de Conversión & UI/UX para E-Commerce

Auditor de Optimización de Tasa de Conversión (CRO), psicología de ventas y diseño de experiencia de usuario para tiendas online (Shopify, Tiendanube, WooCommerce y MercadoLibre) impulsado por Gemini 2.5 Flash Vision.

## Capacidades

- **Inspección Multimodal de Píxeles**: Detección de coordenadas espaciales `(x_percent, y_percent)` en capturas de pantalla de páginas de producto para anclar pines exactos sobre botones CTA, anclaje de precios y garantías.
- **Veredicto CRO y Telemetría**: Dial de conversión de 240°, estimación cuantitativa de fuga de ventas, proyección de impacto y radar pentagonal de 5 pilares (Visual, CTA, Copy, Precio/UX, Trust).
- **Misiones Accionables en 5 Minutos**: Misiones gratuitas inmediatas y roadmap avanzado Pro con soluciones paso a paso.
- **Pack de Copywriting Persuasivo**: Reescritura orientada a conversión de títulos, viñetas de beneficio y microcopy de garantías.
- **Captura Automática por URL**: Extracción de OpenGraph, metadatos y capturas visuales directas a partir de cualquier enlace de tienda.

## Pila Tecnológica

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons
- **Tipografía**: Space Grotesk (titulares y números tabulares) + Plus Jakarta Sans (cuerpo)
- **Backend**: Express con `@google/genai` (SDK oficial de Gemini, modelo `gemini-2.5-flash`)
- **Testing**: Node Test Runner nativo con suites unitarias para el motor analítico

## Ejecución Local

1. Clona el repositorio e instala dependencias:
   ```bash
   npm install
   ```

2. Configura tu API Key de Google Gemini en un archivo `.env`:
   ```env
   GEMINI_API_KEY="tu_clave_de_gemini_api"
   PORT=3000
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. Ejecutar pruebas unitarias:
   ```bash
   npm test
   ```
