import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  normalizeAuditReport,
  PRESET_STORE_CASES,
  StoreAuditReport,
  parseStoreHtmlMetadata,
  ScrapedStoreMetadata,
} from './src/utils/auditEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `Actúa como el motor de inteligencia artificial visual de "StoreLevelUp", un auditor experto en Optimización de Tasa de Conversión (CRO), diseño UI/UX para e-commerce (Shopify, Tiendanube, WooCommerce, MercadoLibre) y psicología de ventas con enfoque gamificado.

Tu tarea es inspeccionar píxel por píxel la captura de pantalla subida (y opcionalmente los datos extraídos de la URL o texto proporcionado) para detectar exactamente por qué esa página está perdiendo ventas y cómo solucionarlo rápido.

REGLAS OBLIGATORIAS DE ANÁLISIS VISUAL ESTRICTO:
1. Regla A (Filtro de validez): Si la imagen subida NO es una página de producto, tienda online o landing page comercial (por ejemplo, es una foto casual, un escritorio, un meme o algo sin relación con un e-commerce), debes indicarlo claramente en "summary_verdict" con el formato exacto: "La imagen subida no parece ser una página de producto de e-commerce. Vemos: [descripción real de la imagen]" y dar puntuación 0 en "overall_score" y 0 en todos los "sub_scores".
2. Regla B (Evidencia literal obligatoria): En cada "problem_detected" y "quick_fix_5min", TIENES PROHIBIDO dar consejos genéricos o inventar elementos que no estén en la imagen. Debes citar entre comillas el texto exacto que lees en la captura (ej. el texto real del botón, el título real, el precio exacto, los colores reales que ves en la foto y qué elementos están arriba o abajo).
3. Regla C (Coordenadas reales y evidencia visual): Para "x_percent" e "y_percent" (enteros entre 8 y 92), debes localizar la posición real en la imagen subida donde se ve ese elemento específico (0 = borde izquierdo/superior, 50 = centro, 100 = borde derecho/inferior). En "visual_evidence_detected" debes escribir en 1 línea qué elemento visual exacto estás mirando en esas coordenadas de la captura (ej: "Botón azul con texto 'Comprar ahora' debajo del precio $25.000").
4. EXTRACCIÓN REAL DEL PRODUCTO:
   - "detected_product_name": El nombre real exacto del producto que lees en la captura o URL (o "No es una página de producto" si aplica la Regla A).
   - "detected_product_price": El precio real exacto que lees en la captura o URL (ej. "$45.000", "$89.90 USD", o "No visible" si no aparece ningún precio).
5. Usa un tono directo y motivador estilo videojuego de estrategia/productividad ("Subir de nivel", "Misión", "Fuga de ventas").
6. CANTIDAD EXACTA DE ELEMENTOS EN EL JSON:
   - "free_critical_missions" debe contener exactamente 3 elementos (IDs 1, 2 y 3).
   - "pro_locked_missions" debe contener exactamente 5 elementos (IDs 4, 5, 6, 7 y 8).
   - "pro_ai_copywriting_pack.optimized_bullet_benefits" debe contener exactamente 3 beneficios persuasivos basados en el producto real detectado.`;

const missionSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER, description: 'ID numérico secuencial de la misión' },
    title: {
      type: Type.STRING,
      description: 'Nombre corto y atractivo de la misión basado en el elemento real visto',
    },
    visual_evidence_detected: {
      type: Type.STRING,
      description:
        "Descripción en 1 línea de qué elemento visual exacto estás mirando en esas coordenadas de la captura (ej: \"Botón azul con texto 'Comprar ahora' debajo del precio $25.000\").",
    },
    problem_detected: {
      type: Type.STRING,
      description:
        'Explicación exacta de qué está mal citando entre comillas los textos, colores y ubicaciones reales leídos en la captura.',
    },
    sales_impact: {
      type: Type.STRING,
      description: 'Impacto en ventas: Alto, Medio/Alto o Medio',
    },
    xp_reward: {
      type: Type.INTEGER,
      description: 'Puntos de experiencia otorgados al completar la misión (ej. 150, 200)',
    },
    quick_fix_5min: {
      type: Type.STRING,
      description:
        'Instrucción paso a paso para arreglarlo en 5 minutos haciendo referencia a los textos y colores reales de la captura.',
    },
    x_percent: {
      type: Type.INTEGER,
      description:
        'Coordenada horizontal real (entero entre 8 y 92, en porcentaje del ancho de la imagen) donde se ubica ese elemento específico en la captura.',
    },
    y_percent: {
      type: Type.INTEGER,
      description:
        'Coordenada vertical real (entero entre 8 y 92, en porcentaje del alto de la imagen) donde se ubica ese elemento específico en la captura.',
    },
  },
  required: [
    'id',
    'title',
    'visual_evidence_detected',
    'problem_detected',
    'sales_impact',
    'xp_reward',
    'quick_fix_5min',
    'x_percent',
    'y_percent',
  ],
};

const auditResponseSchema = {
  type: Type.OBJECT,
  properties: {
    overall_score: {
      type: Type.INTEGER,
      description: 'Puntaje global de 0 a 100',
    },
    rank_title: {
      type: Type.STRING,
      description: 'Rango gamificado actual (ej. Mercader Aprendiz, Artesano de Conversión)',
    },
    estimated_lost_sales_percentage: {
      type: Type.STRING,
      description: 'Porcentaje estimado de ventas perdidas con símbolo %, ej. "28%"',
    },
    summary_verdict: {
      type: Type.STRING,
      description: 'Resumen directo de 2 líneas sobre el estado actual de la página.',
    },
    detected_product_name: {
      type: Type.STRING,
      description: 'El nombre real del producto que se ve en la captura o URL.',
    },
    detected_product_price: {
      type: Type.STRING,
      description: 'El precio real que se ve en la captura o URL (ej. "$45.000" o "No visible").',
    },
    sub_scores: {
      type: Type.OBJECT,
      properties: {
        visual_clarity: { type: Type.INTEGER },
        cta_power: { type: Type.INTEGER },
        trust_and_security: { type: Type.INTEGER },
        copywriting_persuasion: { type: Type.INTEGER },
      },
      required: ['visual_clarity', 'cta_power', 'trust_and_security', 'copywriting_persuasion'],
    },
    free_critical_missions: {
      type: Type.ARRAY,
      items: missionSchema,
      description: 'Exactamente 3 misiones críticas gratuitas (IDs 1, 2, 3)',
    },
    pro_locked_missions: {
      type: Type.ARRAY,
      items: missionSchema,
      description: 'Exactamente 5 misiones avanzadas bloqueadas Pro (IDs 4, 5, 6, 7, 8)',
    },
    pro_ai_copywriting_pack: {
      type: Type.OBJECT,
      properties: {
        optimized_product_title: {
          type: Type.STRING,
          description: 'Título de producto reescrito y altamente persuasivo listo para copiar y pegar',
        },
        optimized_bullet_benefits: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Exactamente 3 beneficios enfocados en transformación, objeción y calidad/rapidez',
        },
        optimized_cta_button_text: {
          type: Type.STRING,
          description: 'Texto ideal para el botón de compra',
        },
        trust_guarantee_microcopy: {
          type: Type.STRING,
          description: 'Texto corto de garantía/envío seguro para poner debajo del botón de compra',
        },
      },
      required: [
        'optimized_product_title',
        'optimized_bullet_benefits',
        'optimized_cta_button_text',
        'trust_guarantee_microcopy',
      ],
    },
  },
  required: [
    'overall_score',
    'rank_title',
    'estimated_lost_sales_percentage',
    'summary_verdict',
    'detected_product_name',
    'detected_product_price',
    'sub_scores',
    'free_critical_missions',
    'pro_locked_missions',
    'pro_ai_copywriting_pack',
  ],
};

export async function fetchStorePageMetadata(url: string): Promise<ScrapedStoreMetadata | null> {
  const trimmed = url.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(trimmed, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return parseStoreHtmlMetadata(html, trimmed);
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchStorePageContext(url: string): Promise<string | null> {
  const meta = await fetchStorePageMetadata(url);
  return meta ? meta.contextText : null;
}

async function fetchRemoteImageAsBase64(
  imageUrl: string,
  timeoutMs = 5000
): Promise<{ base64: string; mimeType: string; dataUrl: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/png';
    if (!contentType.startsWith('image/')) return null;

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength < 400) return null;

    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = contentType.split(';')[0].trim();
    return {
      base64,
      mimeType,
      dataUrl: `data:${mimeType};base64,${base64}`,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildHeuristicCustomAudit(params: {
  platform?: string;
  storeUrl?: string;
  productCopy?: string;
  presetId?: string;
  scrapedMeta?: ScrapedStoreMetadata | null;
  capturedImageUrl?: string;
  engineNotes?: string;
}): StoreAuditReport {
  const {
    platform = 'Shopify',
    storeUrl = '',
    productCopy = '',
    presetId,
    scrapedMeta,
    capturedImageUrl,
    engineNotes,
  } = params;

  const isPresetDemo = Boolean(presetId && PRESET_STORE_CASES.some((p) => p.id === presetId));
  const matchingPreset =
    PRESET_STORE_CASES.find((p) => p.id === presetId) ??
    PRESET_STORE_CASES.find((p) => p.platform.toLowerCase() === platform.toLowerCase()) ??
    PRESET_STORE_CASES[0];

  const base = structuredClone(matchingPreset.report);
  base.audit_source = 'heuristic_fallback';
  base.engine_notes =
    engineNotes || 'Diagnóstico generado con motor heurístico local (fallback).';

  if (capturedImageUrl) {
    base.captured_image_url = capturedImageUrl;
  }

  if (isPresetDemo && !storeUrl.trim() && !productCopy.trim()) {
    return normalizeAuditReport(base, matchingPreset.id);
  }

  // Extract real product name and price from scraped metadata, productCopy, or URL slug — never leak "$149.00 USD"
  const cleanCopy = productCopy.trim();
  const priceRegex = /(?:US\$|\$|€|ARS|USD|MXN|CLP|COP)\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/i;
  const copyPriceMatch = cleanCopy.match(priceRegex);

  const urlSlugTitle = storeUrl.trim()
    ? decodeURIComponent(
        storeUrl
          .trim()
          .replace(/^https?:\/\//, '')
          .split('/')
          .filter(Boolean)
          .pop() || ''
      )
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())
    : '';

  const realTitle =
    scrapedMeta?.pageTitle ||
    (cleanCopy ? cleanCopy.split(/[.\n]/)[0].slice(0, 72) : '') ||
    urlSlugTitle ||
    `Producto Auditado en ${platform}`;

  const realPrice =
    (scrapedMeta?.detectedPrice && scrapedMeta.detectedPrice !== 'No visible'
      ? scrapedMeta.detectedPrice
      : '') ||
    (copyPriceMatch ? copyPriceMatch[0].trim() : 'No visible');

  base.detected_product_name = realTitle;
  base.detected_product_price = realPrice;
  base.summary_verdict = `Auditoría CRO en ${platform} para "${realTitle}": detectamos fugas de conversión en la jerarquía visual del botón de compra, falta de micro-garantías junto al precio (${realPrice}) y copy que no resuelve objeciones inmediatas.`;

  base.pro_ai_copywriting_pack = {
    optimized_product_title: `${realTitle} — Edición Destacada con Garantía de Satisfacción y Envío Rápido`,
    optimized_bullet_benefits: [
      `Resultados reales desde el primer uso con ${realTitle}, diseñado para máxima durabilidad y confort diario.`,
      'Compra 100% libre de riesgo: cambios y devoluciones sin costo durante los primeros 30 días.',
      'Despacho prioritario con seguimiento en tiempo real y embalaje protegido hasta tu puerta.',
    ],
    optimized_cta_button_text: `Comprar ${realTitle.slice(0, 28)} con Envío Seguro →`,
    trust_guarantee_microcopy:
      'Pago 100% protegido · Garantía de satisfacción de 30 días · Despacho rápido verificado',
  };

  return normalizeAuditReport(base, matchingPreset.id);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  app.post('/api/audit', async (req, res) => {
    const {
      imageBase64,
      mimeType = 'image/png',
      storeUrl = '',
      platform = 'Shopify',
      productCopy = '',
      presetId = '',
    } = req.body ?? {};

    const cleanUrl = typeof storeUrl === 'string' ? storeUrl.trim() : '';
    const scrapedMeta = cleanUrl ? await fetchStorePageMetadata(cleanUrl) : null;

    // Step 2: If user provided storeUrl without uploading an image, automatically obtain screenshot or og:image
    let effectiveBase64 =
      typeof imageBase64 === 'string' && imageBase64.length > 50 ? imageBase64 : '';
    let effectiveMimeType = mimeType || 'image/png';
    let capturedImageUrl: string | undefined = undefined;

    if (!effectiveBase64 && cleanUrl) {
      const thumIoUrl = `https://image.thum.io/get/width/1200/crop/800/noanimate/${cleanUrl}`;
      if (scrapedMeta?.ogImageUrl) {
        const ogFetched = await fetchRemoteImageAsBase64(scrapedMeta.ogImageUrl, 4000);
        if (ogFetched) {
          effectiveBase64 = ogFetched.base64;
          effectiveMimeType = ogFetched.mimeType;
          capturedImageUrl = ogFetched.dataUrl;
        } else {
          capturedImageUrl = scrapedMeta.ogImageUrl;
        }
      }

      if (!capturedImageUrl && (scrapedMeta || !productCopy.trim())) {
        const thumFetched = await fetchRemoteImageAsBase64(thumIoUrl, 4500);
        if (thumFetched) {
          effectiveBase64 = thumFetched.base64;
          effectiveMimeType = thumFetched.mimeType;
          capturedImageUrl = thumFetched.dataUrl;
        } else {
          capturedImageUrl = thumIoUrl;
        }
      }
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    const isCustomUserAudit = !presetId || ! String(presetId).trim();

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const msg =
        'No se puede ejecutar la auditoría en vivo porque GEMINI_API_KEY (o API_KEY) no está configurada en el servidor.';
      console.error(`[StoreLevelUp Engine] ${msg}`);

      if (isCustomUserAudit) {
        return res.status(400).json({
          error:
            'GEMINI_API_KEY no está configurada en el entorno. Para auditar tu propia captura o tienda sin usar datos de demostración, configura una API Key válida de Gemini.',
        });
      }

      const report = buildHeuristicCustomAudit({
        platform,
        storeUrl: cleanUrl,
        productCopy,
        presetId,
        scrapedMeta,
        capturedImageUrl,
        engineNotes: msg,
      });
      return res.json(report);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (effectiveBase64 && effectiveBase64.length > 50) {
        const cleanBase64 = effectiveBase64.replace(/^data:[^;]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: effectiveMimeType,
            data: cleanBase64,
          },
        });
      }

      const contextLines = [
        `Plataforma de e-commerce seleccionada: ${platform}`,
        cleanUrl ? `URL de la página de producto: ${cleanUrl}` : '',
        scrapedMeta
          ? `Datos reales extraídos del HTML de la tienda:\n${scrapedMeta.contextText}`
          : '',
        productCopy ? `Texto / Descripción proporcionada por el usuario: ${productCopy}` : '',
        'INSTRUCCIÓN CRÍTICA DE INSPECCIÓN VISUAL: Analiza exclusivamente los píxeles reales de la imagen adjunta (y los datos reales del producto si se adjuntaron). Aplica estrictamente la Regla A (si la imagen NO es una página de producto o tienda online, devuelve overall_score: 0 y explica en summary_verdict qué ves realmente en la imagen), la Regla B (cita entre comillas los textos exactos, precios, colores y posiciones reales en cada problem_detected y quick_fix_5min, sin consejos genéricos) y la Regla C (escribe en visual_evidence_detected qué elemento exacto ves en las coordenadas x_percent e y_percent de la captura).',
      ]
        .filter(Boolean)
        .join('\n\n');

      parts.push({ text: contextLines });

      const candidateModels = [
        'gemini-3.5-flash',
        'gemini-3-flash-preview',
        'gemini-3.1-flash-lite-preview',
        'gemini-3.8-flash',
        'gemini-2.5-flash',
      ];
      let response = null;
      let usedModel = candidateModels[0];
      let lastModelError: unknown = null;

      for (const modelName of candidateModels) {
        try {
          usedModel = modelName;
          response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              responseSchema: auditResponseSchema,
              temperature: 0.3,
              abortSignal: AbortSignal.timeout(18000),
            },
          });
          break;
        } catch (modelErr) {
          lastModelError = modelErr;
          const errStr = String(modelErr);
          if (
            errStr.includes('404') ||
            errStr.includes('NOT_FOUND') ||
            errStr.includes('no longer available') ||
            errStr.includes('503') ||
            errStr.includes('UNAVAILABLE') ||
            errStr.includes('429') ||
            errStr.includes('RESOURCE_EXHAUSTED') ||
            errStr.includes('TimeoutError') ||
            errStr.includes('aborted')
          ) {
            continue;
          }
          throw modelErr;
        }
      }

      if (!response) {
        throw lastModelError || new Error('No se pudo obtener respuesta de Gemini.');
      }

      const rawText = response.text;
      if (!rawText) {
        throw new Error(`Respuesta vacía del modelo ${usedModel}.`);
      }

      const parsed = JSON.parse(rawText) as Partial<StoreAuditReport>;
      parsed.audit_source = 'live_gemini';
      parsed.engine_notes = scrapedMeta
        ? `Análisis multimodal Gemini (${usedModel}) + Extracción HTML en vivo completado.`
        : `Análisis multimodal Gemini (${usedModel}) en vivo completado.`;

      if (capturedImageUrl) {
        parsed.captured_image_url = capturedImageUrl;
      }
      if (
        (!parsed.detected_product_name || parsed.detected_product_name === 'No visible') &&
        scrapedMeta?.pageTitle
      ) {
        parsed.detected_product_name = scrapedMeta.pageTitle;
      }
      if (
        (!parsed.detected_product_price || parsed.detected_product_price === 'No visible') &&
        scrapedMeta?.detectedPrice &&
        scrapedMeta.detectedPrice !== 'No visible'
      ) {
        parsed.detected_product_price = scrapedMeta.detectedPrice;
      }

      const normalized = normalizeAuditReport(parsed, presetId || 'shopify-sneaker');
      return res.json(normalized);
    } catch (error) {
      const errorDetail =
        error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      console.error('[StoreLevelUp Engine] Error en llamada a gemini-2.5-flash:', error);

      if (isCustomUserAudit) {
        return res.status(500).json({
          error: `No se pudo completar el análisis en vivo con Gemini 2.5 Flash (${errorDetail}). Verifica la imagen o la configuración de GEMINI_API_KEY e intenta nuevamente.`,
        });
      }

      const fallbackReport = buildHeuristicCustomAudit({
        platform,
        storeUrl: cleanUrl,
        productCopy,
        presetId,
        scrapedMeta,
        capturedImageUrl,
        engineNotes: `Fallback activado tras error en Gemini API (${errorDetail})`,
      });
      return res.json(fallbackReport);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StoreLevelUp CRO Engine running on http://localhost:${PORT}`);
  });
}

startServer();
