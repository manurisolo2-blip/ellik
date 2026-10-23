import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

export interface SubScores {
  visual_clarity: number;
  cta_power: number;
  trust_and_security: number;
  copywriting_persuasion: number;
}

export interface MissionItem {
  id: number;
  title: string;
  visual_evidence_detected: string;
  problem_detected: string;
  sales_impact: string;
  xp_reward: number;
  quick_fix_5min: string;
  x_percent: number;
  y_percent: number;
}

export interface ProAiCopywritingPack {
  optimized_product_title: string;
  optimized_bullet_benefits: string[];
  optimized_cta_button_text: string;
  trust_guarantee_microcopy: string;
}

export type AuditSourceType = 'live_gemini' | 'heuristic_fallback';

export interface StoreAuditReport {
  overall_score: number;
  rank_title: string;
  estimated_lost_sales_percentage: string;
  summary_verdict: string;
  detected_product_name: string;
  detected_product_price: string;
  sub_scores: SubScores;
  free_critical_missions: MissionItem[];
  pro_locked_missions: MissionItem[];
  pro_ai_copywriting_pack: ProAiCopywritingPack;
  audit_source?: AuditSourceType;
  engine_notes?: string;
  captured_image_url?: string;
}

export interface ScrapedStoreMetadata {
  contextText: string;
  pageTitle: string;
  detectedPrice: string;
  ogImageUrl: string | null;
}

function getRankTitleForScore(score: number): string {
  if (score >= 90) return 'Leyenda del Checkout';
  if (score >= 80) return 'Maestro de Conversión';
  if (score >= 70) return 'Mercader Audaz';
  if (score >= 55) return 'Artesano en Ascenso';
  return 'Mercader Aprendiz';
}

function stripHtmlTags(htmlFragment: string): string {
  return htmlFragment
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseStoreHtmlMetadata(html: string, baseUrl = ''): ScrapedStoreMetadata | null {
  if (!html || typeof html !== 'string') return null;

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch ? stripHtmlTags(titleMatch[1]) : '';

  const ogTitleMatch =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["'][^>]*>/i);
  const ogTitle = ogTitleMatch ? stripHtmlTags(ogTitleMatch[1]) : '';

  const metaDescMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
  const metaDescription = metaDescMatch ? stripHtmlTags(metaDescMatch[1]) : '';

  const ogImageMatch =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["'][^>]*>/i);
  let ogImageUrl = ogImageMatch ? ogImageMatch[1].trim() : null;
  if (ogImageUrl && ogImageUrl.startsWith('//')) {
    ogImageUrl = `https:${ogImageUrl}`;
  } else if (ogImageUrl && ogImageUrl.startsWith('/') && baseUrl) {
    try {
      ogImageUrl = new URL(ogImageUrl, baseUrl).toString();
    } catch {
      // keep as is
    }
  }

  const metaPriceMatch =
    html.match(/<meta[^>]+property=["'](?:product|og):price:amount["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["'](?:product|og):price:amount["'][^>]*>/i);
  const metaCurrencyMatch =
    html.match(/<meta[^>]+property=["'](?:product|og):price:currency["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["'](?:product|og):price:currency["'][^>]*>/i);

  const headings: string[] = [];
  const headingRegex = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(html)) !== null && headings.length < 8) {
    const cleanHeading = stripHtmlTags(match[1]);
    if (cleanHeading) {
      headings.push(cleanHeading);
    }
  }

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const rawBody = bodyMatch ? bodyMatch[1] : html;
  const bodyWithoutScriptsAndStyles = rawBody
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ');

  const bodyText = stripHtmlTags(bodyWithoutScriptsAndStyles).slice(0, 1500);

  let detectedPrice = '';
  if (metaPriceMatch && metaPriceMatch[1].trim()) {
    const currency = metaCurrencyMatch?.[1]?.trim() || '';
    detectedPrice = `$${metaPriceMatch[1].trim()}${currency ? ` ${currency}` : ''}`;
  } else {
    const priceRegex = /(?:US\$|\$|€|ARS|USD|MXN|CLP|COP)\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/i;
    const bodyPriceMatch = bodyText.match(priceRegex);
    if (bodyPriceMatch) {
      detectedPrice = bodyPriceMatch[0].trim();
    }
  }

  const bestTitle = ogTitle || headings[0] || rawTitle;

  const extractedSections = [
    bestTitle ? `- Título del Producto Detectado: ${bestTitle}` : '',
    detectedPrice ? `- Precio Detectado en HTML: ${detectedPrice}` : '',
    metaDescription ? `- Meta Description: ${metaDescription}` : '',
    headings.length > 0 ? `- Encabezados H1/H2: ${headings.join(' | ')}` : '',
    bodyText ? `- Extracto del Body (1500 chars): ${bodyText}` : '',
  ].filter(Boolean);

  if (extractedSections.length === 0) return null;

  return {
    contextText: extractedSections.join('\n'),
    pageTitle: bestTitle,
    detectedPrice: detectedPrice || 'No visible',
    ogImageUrl,
  };
}

function normalizeLiveOrFallbackReport(raw: Partial<StoreAuditReport>): StoreAuditReport {
  const clampScore = (val: unknown, def: number) => {
    if (typeof val !== 'number' || Number.isNaN(val)) return def;
    return Math.max(0, Math.min(100, Math.round(val)));
  };

  const clampCoord = (val: unknown, def: number) => {
    if (typeof val !== 'number' || Number.isNaN(val)) return def;
    return Math.max(8, Math.min(92, Math.round(val)));
  };

  const overall_score = clampScore(raw.overall_score, 0);
  const rank_title =
    typeof raw.rank_title === 'string' && raw.rank_title.trim()
      ? raw.rank_title.trim()
      : overall_score === 0
      ? 'Imagen No Comercial'
      : getRankTitleForScore(overall_score);

  let estimated_lost_sales_percentage = '0%';
  if (
    typeof raw.estimated_lost_sales_percentage === 'string' &&
    raw.estimated_lost_sales_percentage.trim()
  ) {
    const clean = raw.estimated_lost_sales_percentage.trim();
    estimated_lost_sales_percentage = clean.endsWith('%') ? clean : `${clean}%`;
  }

  const summary_verdict =
    typeof raw.summary_verdict === 'string' ? raw.summary_verdict.trim() : '';

  const detected_product_name =
    typeof raw.detected_product_name === 'string' && raw.detected_product_name.trim()
      ? raw.detected_product_name.trim()
      : 'No detectado en la captura';

  const detected_product_price =
    typeof raw.detected_product_price === 'string' && raw.detected_product_price.trim()
      ? raw.detected_product_price.trim()
      : 'No visible';

  const sub_scores: SubScores = {
    visual_clarity: clampScore(raw.sub_scores?.visual_clarity, 0),
    cta_power: clampScore(raw.sub_scores?.cta_power, 0),
    trust_and_security: clampScore(raw.sub_scores?.trust_and_security, 0),
    copywriting_persuasion: clampScore(raw.sub_scores?.copywriting_persuasion, 0),
  };

  const sanitizeLiveMission = (
    item: Partial<MissionItem> | undefined,
    forcedId: number
  ): MissionItem => ({
    id: forcedId,
    title: typeof item?.title === 'string' ? item.title.trim() : '',
    visual_evidence_detected:
      typeof item?.visual_evidence_detected === 'string'
        ? item.visual_evidence_detected.trim()
        : '',
    problem_detected:
      typeof item?.problem_detected === 'string' ? item.problem_detected.trim() : '',
    sales_impact:
      typeof item?.sales_impact === 'string' && item.sales_impact.trim()
        ? item.sales_impact.trim()
        : 'Alto',
    xp_reward:
      typeof item?.xp_reward === 'number' && item.xp_reward > 0
        ? Math.round(item.xp_reward)
        : 150,
    quick_fix_5min:
      typeof item?.quick_fix_5min === 'string' ? item.quick_fix_5min.trim() : '',
    x_percent: clampCoord(item?.x_percent, 50),
    y_percent: clampCoord(item?.y_percent, 50),
  });

  const rawFree = Array.isArray(raw.free_critical_missions) ? raw.free_critical_missions : [];
  const free_critical_missions: MissionItem[] = rawFree.map((m, idx) =>
    sanitizeLiveMission(m, idx + 1)
  );

  const rawPro = Array.isArray(raw.pro_locked_missions) ? raw.pro_locked_missions : [];
  const pro_locked_missions: MissionItem[] = rawPro.map((m, idx) =>
    sanitizeLiveMission(m, idx + 1 + free_critical_missions.length)
  );

  const rawBullets = Array.isArray(raw.pro_ai_copywriting_pack?.optimized_bullet_benefits)
    ? raw.pro_ai_copywriting_pack!.optimized_bullet_benefits
        .filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
        .map((b) => b.trim())
    : [];

  const pro_ai_copywriting_pack: ProAiCopywritingPack = {
    optimized_product_title:
      typeof raw.pro_ai_copywriting_pack?.optimized_product_title === 'string'
        ? raw.pro_ai_copywriting_pack.optimized_product_title.trim()
        : '',
    optimized_bullet_benefits: rawBullets,
    optimized_cta_button_text:
      typeof raw.pro_ai_copywriting_pack?.optimized_cta_button_text === 'string'
        ? raw.pro_ai_copywriting_pack.optimized_cta_button_text.trim()
        : '',
    trust_guarantee_microcopy:
      typeof raw.pro_ai_copywriting_pack?.trust_guarantee_microcopy === 'string'
        ? raw.pro_ai_copywriting_pack.trust_guarantee_microcopy.trim()
        : '',
  };

  const liveResult: StoreAuditReport = {
    overall_score,
    rank_title,
    estimated_lost_sales_percentage,
    summary_verdict,
    detected_product_name,
    detected_product_price,
    sub_scores,
    free_critical_missions,
    pro_locked_missions,
    pro_ai_copywriting_pack,
    audit_source: raw.audit_source || 'live_gemini',
  };

  if (typeof raw.engine_notes === 'string' && raw.engine_notes.trim()) {
    liveResult.engine_notes = raw.engine_notes.trim();
  }
  if (typeof raw.captured_image_url === 'string' && raw.captured_image_url.trim()) {
    liveResult.captured_image_url = raw.captured_image_url.trim();
  }

  return liveResult;
}

export const SYSTEM_INSTRUCTION = `Actúa como el motor de inteligencia artificial visual de "StoreLevelUp", un auditor experto en Optimización de Tasa de Conversión (CRO), diseño UI/UX para e-commerce (Shopify, Tiendanube, WooCommerce, MercadoLibre) y psicología de ventas con enfoque gamificado.

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

export const missionSchema = {
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

export const auditResponseSchema = {
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

export async function fetchRemoteImageAsBase64(
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

export function buildHeuristicCustomAudit(params: {
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
    scrapedMeta,
    capturedImageUrl,
    engineNotes,
  } = params;

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

  return normalizeLiveOrFallbackReport({
    overall_score: 64,
    rank_title: 'Artesano en Ascenso',
    estimated_lost_sales_percentage: '28%',
    summary_verdict: `Auditoría CRO en ${platform} para "${realTitle}": detectamos fugas de conversión en la jerarquía visual del botón de compra, falta de micro-garantías junto al precio (${realPrice}) y copy que no resuelve objeciones inmediatas.`,
    detected_product_name: realTitle,
    detected_product_price: realPrice,
    sub_scores: {
      visual_clarity: 72,
      cta_power: 54,
      trust_and_security: 48,
      copywriting_persuasion: 62,
    },
    free_critical_missions: [
      {
        id: 1,
        title: 'Contraste y Jerarquía del CTA Principal',
        visual_evidence_detected: `Botón de acción principal junto a "${realTitle}"`,
        problem_detected:
          'El botón principal no domina visualmente el primer pantallazo frente a elementos secundarios.',
        sales_impact: 'Alto',
        xp_reward: 150,
        quick_fix_5min:
          'Aumenta el alto del botón a 54px, usa color de alto contraste y agrega verbo de acción directa.',
        x_percent: 72,
        y_percent: 62,
      },
      {
        id: 2,
        title: 'Anclaje de Valor Junto al Precio',
        visual_evidence_detected: `Bloque de precio (${realPrice}) sin desglose de cuotas ni envío`,
        problem_detected:
          'El precio aparece aislado sin contexto de cuotas sin interés ni costo de envío inmediato.',
        sales_impact: 'Alto',
        xp_reward: 150,
        quick_fix_5min:
          'Coloca debajo del precio el desglose en cuotas y una insignia de envío rápido.',
        x_percent: 66,
        y_percent: 34,
      },
      {
        id: 3,
        title: 'Micro-Garantías Bajo el Botón de Compra',
        visual_evidence_detected: 'Zona inferior del botón de compra sin sellos de garantía',
        problem_detected:
          'Ausencia de garantías de cambio/devolución y pago protegido en el momento de decisión.',
        sales_impact: 'Medio/Alto',
        xp_reward: 140,
        quick_fix_5min:
          'Agrega una línea de microcopy con íconos de Pago Protegido y Cambios Gratis por 30 días.',
        x_percent: 72,
        y_percent: 74,
      },
    ],
    pro_locked_missions: [
      {
        id: 4,
        title: 'Prueba Social Cercana al Título',
        visual_evidence_detected: `Encabezado "${realTitle}" sin calificación visible`,
        problem_detected: 'No se visualizan estrellas ni conteo de reseñas verificadas sobre el pliegue.',
        sales_impact: 'Alto',
        xp_reward: 180,
        quick_fix_5min: 'Inserta estrellas y enlace a reseñas reales justo debajo del H1.',
        x_percent: 64,
        y_percent: 21,
      },
      {
        id: 5,
        title: 'Optimización de Miniaturas en Galería',
        visual_evidence_detected: 'Galería principal de producto a la izquierda',
        problem_detected: 'Faltan ángulos de detalle y foto en contexto de uso real.',
        sales_impact: 'Medio/Alto',
        xp_reward: 160,
        quick_fix_5min: 'Ordena la galería: 1) Producto, 2) En uso, 3) Detalle/Tabla de medidas.',
        x_percent: 28,
        y_percent: 48,
      },
      {
        id: 6,
        title: 'Bullets Orientados a Beneficios',
        visual_evidence_detected: 'Bloque de descripción textual del producto',
        problem_detected: 'El texto describe características técnicas sin traducirlas en beneficios.',
        sales_impact: 'Medio/Alto',
        xp_reward: 170,
        quick_fix_5min: 'Reemplaza el párrafo denso por 3 bullets escaneables con íconos.',
        x_percent: 68,
        y_percent: 46,
      },
      {
        id: 7,
        title: 'Estimador de Entrega por Ubicación',
        visual_evidence_detected: 'Área inferior del formulario de compra',
        problem_detected: 'El comprador debe avanzar al checkout para saber cuándo recibe su pedido.',
        sales_impact: 'Alto',
        xp_reward: 200,
        quick_fix_5min: 'Muestra fecha estimada ("Recíbelo entre martes y jueves") sobre el CTA.',
        x_percent: 70,
        y_percent: 82,
      },
      {
        id: 8,
        title: 'Sticky Bar de Compra en Mobile',
        visual_evidence_detected: 'Cierre de primer viewport',
        problem_detected: 'Al hacer scroll para leer detalles se pierde de vista el botón de compra.',
        sales_impact: 'Medio',
        xp_reward: 140,
        quick_fix_5min: 'Activa una barra fija inferior en mobile con precio y botón Comprar.',
        x_percent: 50,
        y_percent: 89,
      },
    ],
    pro_ai_copywriting_pack: {
      optimized_product_title: `${realTitle} — Edición Destacada con Garantía de Satisfacción y Envío Rápido`,
      optimized_bullet_benefits: [
        `Resultados reales desde el primer uso con ${realTitle}, diseñado para máxima durabilidad y confort diario.`,
        'Compra 100% libre de riesgo: cambios y devoluciones sin costo durante los primeros 30 días.',
        'Despacho prioritario con seguimiento en tiempo real y embalaje protegido hasta tu puerta.',
      ],
      optimized_cta_button_text: `Comprar ${realTitle.slice(0, 28)} con Envío Seguro →`,
      trust_guarantee_microcopy:
        'Pago 100% protegido · Garantía de satisfacción de 30 días · Despacho rápido verificado',
    },
    audit_source: 'heuristic_fallback',
    engine_notes: engineNotes || 'Diagnóstico generado con motor heurístico local (fallback).',
    captured_image_url: capturedImageUrl,
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST /api/audit.' });
  }

  let body: Record<string, any> = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' });
    }
  } else if (req.body && typeof req.body === 'object') {
    body = req.body;
  }

  const {
    imageBase64,
    mimeType = 'image/jpeg',
    storeUrl = '',
    platform = 'Shopify',
    productCopy = '',
    presetId = '',
  } = body;

  const cleanUrl = typeof storeUrl === 'string' ? storeUrl.trim() : '';
  const scrapedMeta = cleanUrl ? await fetchStorePageMetadata(cleanUrl) : null;

  let effectiveBase64 =
    typeof imageBase64 === 'string' && imageBase64.length > 50 ? imageBase64 : '';
  let effectiveMimeType = mimeType || 'image/jpeg';
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

    if (!capturedImageUrl && (scrapedMeta || !String(productCopy).trim())) {
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

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.API_KEY;
  const isCustomUserAudit = !presetId || !String(presetId).trim();

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const msg =
      'No se puede ejecutar la auditoría en vivo porque GEMINI_API_KEY (o API_KEY) no está configurada en el servidor.';
    console.error(`[StoreLevelUp Engine] ${msg}`);

    if (isCustomUserAudit) {
      return res.status(400).json({
        error:
          'GEMINI_API_KEY no está configurada en las variables de entorno del servidor (Vercel Settings → Environment Variables). Si recién la agregaste, haz clic en "Redeploy" en Vercel para activarla.',
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
    return res.status(200).json(report);
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
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-2.5-flash',
    ];
    let response = null;
    let usedModel = candidateModels[0];
    let lastModelError: unknown = null;

    for (const modelName of candidateModels) {
      try {
        usedModel = modelName;
        const supportsMinimalThinking =
          modelName === 'gemini-3.5-flash-lite' || modelName === 'gemini-3.1-flash-lite';
        response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: auditResponseSchema,
            temperature: 0.3,
            ...(supportsMinimalThinking
              ? { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } }
              : {}),
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

    const normalized = normalizeLiveOrFallbackReport(parsed);
    return res.status(200).json(normalized);
  } catch (error) {
    const errorDetail =
      error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error('[StoreLevelUp Engine] Error en llamada a Gemini:', error);

    if (isCustomUserAudit) {
      return res.status(500).json({
        error: `No se pudo completar el análisis en vivo con Gemini (${errorDetail}). Verifica la imagen o la configuración de GEMINI_API_KEY e intenta nuevamente.`,
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
    return res.status(200).json(fallbackReport);
  }
}
