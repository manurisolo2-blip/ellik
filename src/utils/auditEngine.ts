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

export type EcommercePlatform = 'Shopify' | 'Tiendanube' | 'WooCommerce' | 'MercadoLibre';

export interface HotspotAnnotation {
  missionId: number;
  xPercent: number;
  yPercent: number;
  label: string;
  severity: 'critical' | 'pro';
}

export interface PresetStoreCase {
  id: string;
  name: string;
  platform: EcommercePlatform;
  productName: string;
  productPrice: string;
  url: string;
  category: string;
  rawCopyExcerpt: string;
  hotspots: HotspotAnnotation[];
  report: StoreAuditReport;
}

export const PRESET_STORE_CASES: PresetStoreCase[] = [
  {
    id: 'shopify-sneaker',
    name: 'AeroStride Runner V2',
    platform: 'Shopify',
    productName: 'Zapatilla AeroStride Runner V2 - Edición Oliva',
    productPrice: '$149.00 USD',
    url: 'https://aerostride-athletics.myshopify.com/products/aerostride-runner-v2',
    category: 'Calzado Deportivo & Running',
    rawCopyExcerpt:
      'AeroStride Runner V2. Material exterior: malla sintética transpirable de 240g. Suela EVA inyectada de doble densidad. Disponible en tallas 38 a 45. Envíos estándar procesados según disponibilidad de almacén.',
    hotspots: [
      { missionId: 1, xPercent: 31, yPercent: 66, label: 'Rescatar el Botón de Compra', severity: 'critical' },
      { missionId: 2, xPercent: 25, yPercent: 78, label: 'Claridad en Precio y Garantía', severity: 'critical' },
      { missionId: 3, xPercent: 58, yPercent: 83, label: 'Simplificar Textos Clave', severity: 'critical' },
      { missionId: 4, xPercent: 82, yPercent: 78, label: 'Muro de texto técnico sin viñetas', severity: 'pro' },
      { missionId: 5, xPercent: 45, yPercent: 28, label: 'Sin estrellas de prueba social junto al H1', severity: 'pro' },
      { missionId: 6, xPercent: 68, yPercent: 44, label: 'Foto única sin contexto de uso real', severity: 'pro' },
      { missionId: 7, xPercent: 76, yPercent: 90, label: 'Sin barra Sticky en scroll', severity: 'pro' },
      { missionId: 8, xPercent: 84, yPercent: 60, label: 'Sin contador de despacho hoy', severity: 'pro' },
    ],
    report: {
      overall_score: 64,
      rank_title: 'Mercader Aprendiz',
      estimated_lost_sales_percentage: '28%',
      summary_verdict:
        'Tu producto tiene gran fotografía de estudio, pero el botón de compra gris pálido se camufla con el fondo y la ausencia total de garantías congela la decisión en el último segundo.',
      detected_product_name: 'Zapatilla AeroStride Runner V2 - Edición Oliva',
      detected_product_price: '$149.00 USD',
      sub_scores: {
        visual_clarity: 70,
        cta_power: 50,
        trust_and_security: 60,
        copywriting_persuasion: 75,
      },
      free_critical_missions: [
        {
          id: 1,
          title: 'Rescatar el Botón de Compra',
          visual_evidence_detected:
            "Botón rectangular gris claro (#E2E8F0) con texto 'SHOP NOW / Agregar al carrito' camuflado en el hero",
          problem_detected:
            'El botón principal usa un fondo de bajo contraste que compite con el fondo de la fotografía y carece de peso visual en el primer impacto.',
          sales_impact: 'Alto',
          xp_reward: 150,
          quick_fix_5min:
            'Cambiar a un color de alto contraste (ej. #FF5500) y aumentar el padding a 16px 32px. Asegurar visibilidad "above the fold".',
          x_percent: 31,
          y_percent: 66,
        },
        {
          id: 2,
          title: 'Claridad en Precio y Garantía',
          visual_evidence_detected:
            'Bloque inferior de precio sin sellos de pago seguro ni política de devolución junto al CTA',
          problem_detected:
            'El precio aparece aislado sin respaldo de compra protegida ni garantía de cambio gratis, generando abandono antes del carrito.',
          sales_impact: 'Alto',
          xp_reward: 150,
          quick_fix_5min:
            'Aumentar el tamaño de fuente del precio en un 20% y añadir íconos de pago seguro y garantía de devolución justo debajo del CTA.',
          x_percent: 25,
          y_percent: 78,
        },
        {
          id: 3,
          title: 'Simplificar Textos Clave',
          visual_evidence_detected:
            'Tarjetas de producto y descripción con texto corrido denso difícil de escanear en 3 segundos',
          problem_detected:
            'Los bloques de texto descriptivo presentan especificaciones sin jerarquía visual ni beneficios inmediatos para el comprador.',
          sales_impact: 'Alto',
          xp_reward: 140,
          quick_fix_5min:
            'Reemplazar párrafos densos por 3 bullet points enfocándose en beneficios directos y urgencia real de stock.',
          x_percent: 58,
          y_percent: 83,
        },
      ],
      pro_locked_missions: [
        {
          id: 4,
          title: 'Convertir Muro Técnico en Viñetas de Transformación',
          visual_evidence_detected:
            "Párrafo corrido gris con texto 'Material exterior: malla sintética transpirable de 240g. Suela EVA inyectada'",
          problem_detected:
            'La descripción actual lista "Suela EVA inyectada de doble densidad" en un párrafo denso que nadie escanea en lugar de explicar cómo protege las rodillas al correr.',
          sales_impact: 'Medio/Alto',
          xp_reward: 200,
          quick_fix_5min:
            'Reemplaza el párrafo técnico por 3 viñetas con íconos enfocadas en beneficio físico: absorción de impacto articular, frescura térmica en carreras largas y agarre antideslizante.',
          x_percent: 70,
          y_percent: 52,
        },
        {
          id: 5,
          title: 'Inyectar Prueba Social Verificada Junto al Título',
          visual_evidence_detected:
            "Encabezado superior derecho 'Zapatilla AeroStride Runner V2' sin estrellas ni contador de reseñas",
          problem_detected:
            'No hay calificación de estrellas ni conteo de reseñas debajo del título "AeroStride Runner V2", haciendo que la tienda parezca recién inaugurada y sin clientes reales.',
          sales_impact: 'Alto',
          xp_reward: 220,
          quick_fix_5min:
            'Coloca el bloque de estrellas (ej. "4.9/5 · Basado en 312 corredores verificados") a 8px debajo del H1 del producto con enlace ancla hacia las fotos de clientes.',
          x_percent: 62,
          y_percent: 18,
        },
        {
          id: 6,
          title: 'Añadir Miniatura de Escala y Uso en Movimiento',
          visual_evidence_detected:
            'Cuadro de galería izquierdo con tarjeta verde oliva única sin miniaturas secundarias ni fotos en uso',
          problem_detected:
            'La galería muestra solo un cuadro estático sobre fondo gris frío sin ninguna foto de la zapatilla puesta en asfalto, dificultando imaginar el calce real.',
          sales_impact: 'Medio/Alto',
          xp_reward: 180,
          quick_fix_5min:
            'Sube como segunda imagen de la galería una fotografía lifestyle en uso exterior y reordena las miniaturas para que sea visible sin hacer clic.',
          x_percent: 28,
          y_percent: 46,
        },
        {
          id: 7,
          title: 'Implementar Barra Sticky de Compra en Scroll',
          visual_evidence_detected:
            'Borde inferior derecho de la ventana sin barra fija de compra ni selector rápido',
          problem_detected:
            'Al bajar a leer especificaciones técnicas, el botón "Agregar al carrito" desaparece por completo del viewport, obligando al usuario a volver a subir para comprar.',
          sales_impact: 'Medio/Alto',
          xp_reward: 190,
          quick_fix_5min:
            'Activa el componente Sticky Add-to-Cart en la parte inferior al superar el 40% de scroll mostrando miniatura, talle seleccionado y botón de acción directo.',
          x_percent: 76,
          y_percent: 90,
        },
        {
          id: 8,
          title: 'Incorporar Contador de Despacho en Tiempo Real',
          visual_evidence_detected:
            "Texto técnico 'Envíos estándar procesados según disponibilidad de almacén' sobre el botón CTA",
          problem_detected:
            'El texto "Envíos estándar procesados según disponibilidad de almacén" transmite lentitud e incertidumbre logística.',
          sales_impact: 'Medio',
          xp_reward: 160,
          quick_fix_5min:
            'Sustituye esa frase por una línea dinámica: "Pide dentro de las próximas 3h 20m y despachamos hoy mismo con seguimiento en vivo".',
          x_percent: 82,
          y_percent: 60,
        },
      ],
      pro_ai_copywriting_pack: {
        optimized_product_title:
          'AeroStride Runner V2 — Zapatilla Ultraligera con Amortiguación Reactiva Pro-Knee (Edición Oliva)',
        optimized_bullet_benefits: [
          'Corre hasta 15 km sin fatiga articular gracias a la suela de doble densidad que absorbe el 42% del impacto en asfalto.',
          'Calce perfecto garantizado a la primera: si el talle no te enamora, gestionamos el cambio en tu puerta 100% gratis.',
          'Tejido AeroMesh transpirable de 240g que mantiene tus pies frescos y secos incluso en entrenamientos de alta intensidad.',
        ],
        optimized_cta_button_text: 'Probar mis AeroStride con Envío Gratis →',
        trust_guarantee_microcopy:
          'Pago 100% encriptado · Cambio de talle gratis por 30 días · Despacho hoy desde almacén local',
      },
      audit_source: 'heuristic_fallback',
      engine_notes: 'Caso de demostración precalibrado (Shopify)',
    },
  },
  {
    id: 'tiendanube-skincare',
    name: 'Sérum Botánico Vitamina C 20%',
    platform: 'Tiendanube',
    productName: 'Sérum Facial Vitamina C Pura 20% + Ácido Hialurónico 30ml',
    productPrice: '$34.500 ARS',
    url: 'https://lumina-botanica.mitiendanube.com/productos/serum-vitamina-c-30ml',
    category: 'Cosmética & Cuidado de la Piel',
    rawCopyExcerpt:
      'Sérum Facial Vitamina C 30ml. Ingredientes: Aqua, Ascorbic Acid 20%, Sodium Hyaluronate, Tocopherol. Aplicar por la mañana antes del protector solar. Frasco gotero de vidrio ámbar.',
    hotspots: [
      { missionId: 1, xPercent: 74, yPercent: 72, label: 'Botón "Comprar" desplazado bajo el pliegue', severity: 'critical' },
      { missionId: 2, xPercent: 68, yPercent: 34, label: 'Cuotas sin interés ocultas en submenú', severity: 'critical' },
      { missionId: 3, xPercent: 72, yPercent: 86, label: 'Sin sello dermatológico junto al botón', severity: 'critical' },
      { missionId: 4, xPercent: 70, yPercent: 52, label: 'Lista química INCI en vez de beneficios', severity: 'pro' },
    ],
    report: {
      overall_score: 58,
      rank_title: 'Mercader Aprendiz',
      estimated_lost_sales_percentage: '34%',
      summary_verdict:
        'Tienes una estética orgánica atractiva, pero empujas el botón de compra fuera de la primera pantalla y hablas como laboratorio químico en lugar de prometer luminosidad visible.',
      detected_product_name: 'Sérum Facial Vitamina C Pura 20% + Ácido Hialurónico 30ml',
      detected_product_price: '$34.500 ARS',
      sub_scores: {
        visual_clarity: 76,
        cta_power: 44,
        trust_and_security: 54,
        copywriting_persuasion: 58,
      },
      free_critical_missions: [
        {
          id: 1,
          title: 'Subir el Botón de Compra Above-the-Fold',
          visual_evidence_detected:
            "Botón gris 'Agregar al carrito' ubicado en la mitad inferior derecha debajo del bloque de texto",
          problem_detected:
            'El selector de cantidad, el calculador de código postal y un banner promocional empujan el botón "Agregar al carrito" 180px por debajo del área principal de atención.',
          sales_impact: 'Alto',
          xp_reward: 160,
          quick_fix_5min:
            'En Tiendanube > Diseño > Página de Producto, coloca el botón de compra inmediatamente debajo del precio y mueve el calculador de envío por código postal debajo del botón.',
          x_percent: 74,
          y_percent: 72,
        },
        {
          id: 2,
          title: 'Destacar las Cuotas Sin Interés y Descuento por Transferencia',
          visual_evidence_detected:
            "Precio '$34.500 ARS' en negro sin desglose visible de cuotas ni descuento por transferencia",
          problem_detected:
            'El precio de "$34.500 ARS" se muestra en seco, mientras el beneficio de "3 cuotas sin interés de $11.500" o "15% OFF por transferencia ($29.325)" no aparece junto al precio.',
          sales_impact: 'Alto',
          xp_reward: 150,
          quick_fix_5min:
            'Activa la visualización destacada de cuotas y descuento por transferencia en color esmeralda directamente debajo del precio principal para reducir la fricción del ticket.',
          x_percent: 68,
          y_percent: 34,
        },
        {
          id: 3,
          title: 'Añadir Sello de Seguridad Dermatológica y Aprobación Sanitaria',
          visual_evidence_detected:
            "Zona inferior derecha vacía con alerta 'Zona vacía: sin garantía de devolución ni sellos de confianza'",
          problem_detected:
            'En skincare, el comprador teme reacciones alérgicas o productos oxidados. No hay ninguna mención visible de aprobación sanitaria, libre de parabenos o apto piel sensible.',
          sales_impact: 'Alto',
          xp_reward: 150,
          quick_fix_5min:
            'Añade una fila de 3 garantías cortas bajo el botón: "Clínicamente testeado · Sin efecto graso · Garantía de frescura de 30 días".',
          x_percent: 72,
          y_percent: 86,
        },
      ],
      pro_locked_missions: [
        {
          id: 4,
          title: 'Traducir Ingredientes INCI a Resultados por Semana',
          visual_evidence_detected:
            "Texto técnico 'Ingredientes: Aqua, Ascorbic Acid 20%, Sodium Hyaluronate, Tocopherol'",
          problem_detected:
            'Listar "Sodium Hyaluronate, Tocopherol" enfría el deseo de compra porque la clienta busca eliminar manchas y recuperar luminosidad, no leer una fórmula de farmacia.',
          sales_impact: 'Alto',
          xp_reward: 210,
          quick_fix_5min:
            'Estructura el copy en una línea de tiempo: "Día 1: Hidratación profunda · Día 14: Piel más luminosa · Día 28: Atenuación visible de manchas".',
          x_percent: 70,
          y_percent: 52,
        },
        {
          id: 5,
          title: 'Activar Pack Ahorro x2 Unidades (Subir Ticket Promedio)',
          visual_evidence_detected:
            "Área entre el precio '$34.500 ARS' y la descripción sin selector de packs o rutina x2",
          problem_detected:
            'Vendes únicamente la unidad suelta de 30ml, desaprovechando a las compradoras recurrentes que pagarían un pack de 2 meses para ahorrar el envío.',
          sales_impact: 'Alto',
          xp_reward: 230,
          quick_fix_5min:
            'Crea una variante o promoción "Rutina 60 Días (2 unidades) con 15% OFF + Envío Gratis" preseleccionada como "Más Elegido".',
          x_percent: 64,
          y_percent: 42,
        },
        {
          id: 6,
          title: 'Mostrar Textura Real del Sérum en Segunda Foto',
          visual_evidence_detected:
            "Recuadro ámbar izquierdo con texto 'Sérum Botánico Vitamina C' sin fotos de textura en piel",
          problem_detected:
            'La galería muestra solo el envase; el usuario no sabe si el líquido es pesado, aceitoso o de absorción rápida.',
          sales_impact: 'Medio/Alto',
          xp_reward: 180,
          quick_fix_5min:
            'Coloca como foto #2 un primer plano de la gota cristalina sobre la piel destacando su textura ultraligera sin residuo graso.',
          x_percent: 28,
          y_percent: 48,
        },
        {
          id: 7,
          title: 'Resolver Objeciones con Acordeón de Preguntas Frecuentes',
          visual_evidence_detected:
            'Margen inferior derecho de la ficha sin sección de preguntas frecuentes desplegable',
          problem_detected:
            'Dudas críticas como "¿Se puede usar en verano?" o "¿Sirve para piel mixta?" no están respondidas en la página.',
          sales_impact: 'Medio/Alto',
          xp_reward: 170,
          quick_fix_5min:
            'Inserta 3 preguntas frecuentes desplegables justo debajo de los beneficios principales para cerrar ventas sin requerir consultas por WhatsApp.',
          x_percent: 74,
          y_percent: 90,
        },
        {
          id: 8,
          title: 'Integrar Testimonios con Tipo de Piel del Cliente',
          visual_evidence_detected:
            "Encabezado superior 'Sérum Facial Vitamina C Pura' sin calificación de clientas verificadas",
          problem_detected:
            'No se muestran reseñas verificadas con edad o biotipo cutáneo cerca del título, restando empatía y credibilidad.',
          sales_impact: 'Medio',
          xp_reward: 160,
          quick_fix_5min:
            'Destaca 2 reseñas verificadas cerca del botón de compra incluyendo etiqueta contextual (ej. "Lucía M. · Piel mixta sensible").',
          x_percent: 62,
          y_percent: 18,
        },
      ],
      pro_ai_copywriting_pack: {
        optimized_product_title:
          'Sérum Iluminador Vitamina C 20% + Ácido Hialurónico — Efecto Glow Antimanchas en 14 Días (30ml)',
        optimized_bullet_benefits: [
          'Despierta con una piel visiblemente más luminosa, firme y uniforme desde la segunda semana de uso diario.',
          'Fórmula acuosa de absorción en 10 segundos: cero sensación pegajosa, apta para pieles sensibles, mixtas o grasas.',
          'Frasco ámbar con protección UV y gotero de precisión que rinde hasta 60 aplicaciones sin oxidarse.',
        ],
        optimized_cta_button_text: 'Empezar mi Rutina Glow en 3 Cuotas Sin Interés →',
        trust_guarantee_microcopy:
          'Dermatológicamente testeado · 15% OFF extra por transferencia · Envío rápido y protegido a todo el país',
      },
      audit_source: 'heuristic_fallback',
      engine_notes: 'Caso de demostración precalibrado (Tiendanube)',
    },
  },
  {
    id: 'woocommerce-coffee',
    name: 'Cafetera Barista Pro DualBoiler',
    platform: 'WooCommerce',
    productName: 'Cafetera Expreso Barista Pro 15 Bares Acero Inoxidable',
    productPrice: '$489.00 USD',
    url: 'https://kaffeelab-store.com/producto/cafetera-barista-pro-15-bares',
    category: 'Hogar & Electrodomésticos',
    rawCopyExcerpt:
      'SKU: KFL-8821. Potencia: 1450W. Voltaje: 220V. Presión: 15 bares. Depósito 2L. Garantía sujeta a términos del fabricante.',
    hotspots: [
      { missionId: 1, xPercent: 72, yPercent: 70, label: '3 botones azules compitiendo por atención', severity: 'critical' },
      { missionId: 2, xPercent: 74, yPercent: 86, label: 'Garantía ambigua que asusta en tickets altos', severity: 'critical' },
      { missionId: 3, xPercent: 66, yPercent: 24, label: 'SKU y tabla técnica encima del precio', severity: 'critical' },
    ],
    report: {
      overall_score: 52,
      rank_title: 'Mercader Aprendiz',
      estimated_lost_sales_percentage: '39%',
      summary_verdict:
        'Para un producto de casi $500 USD, tu página genera parálisis por análisis: tres botones del mismo color compiten entre sí y una frase fría sobre la garantía destruye la confianza.',
      detected_product_name: 'Cafetera Expreso Barista Pro 15 Bares Acero Inoxidable',
      detected_product_price: '$489.00 USD',
      sub_scores: {
        visual_clarity: 54,
        cta_power: 46,
        trust_and_security: 48,
        copywriting_persuasion: 60,
      },
      free_critical_missions: [
        {
          id: 1,
          title: 'Eliminar los Botones Gemelos que Sabotean el Checkout',
          visual_evidence_detected:
            "Botón gris pálido 'Agregar al carrito' de bajo contraste debajo de la ficha técnica",
          problem_detected:
            'El botón principal "Agregar al carrito" carece de jerarquía cromática y compite con las acciones secundarias, desviando el 35% de los clics fuera del embudo de compra.',
          sales_impact: 'Alto',
          xp_reward: 170,
          quick_fix_5min:
            'En WooCommerce > Personalizar > Botones, deja "Comprar Ahora" como el único botón sólido de alto contraste (#D97706 ámbar tostado o #16A34A verde) y convierte Wishlist/Comparar en enlaces de texto sutiles.',
          x_percent: 72,
          y_percent: 70,
        },
        {
          id: 2,
          title: 'Blindar la Confianza de Ticket Alto ($489 USD)',
          visual_evidence_detected:
            "Texto 'Garantía sujeta a términos del fabricante' y recuadro inferior sin sellos de respaldo",
          problem_detected:
            'La frase "Garantía sujeta a términos del fabricante" suena a burocracia y abandono post-venta en una compra de "$489.00 USD".',
          sales_impact: 'Alto',
          xp_reward: 160,
          quick_fix_5min:
            'Sustitúyela por un bloque de garantía directa: "Garantía Oficial de 2 Años con reemplazo directo + Soporte técnico especializado y 30 días de prueba en casa".',
          x_percent: 74,
          y_percent: 86,
        },
        {
          id: 3,
          title: 'Limpiar el Ruido de SKU y Códigos Encima del Precio',
          visual_evidence_detected:
            "Bloque de texto 'SKU: KFL-8821. Potencia: 1450W. Voltaje: 220V.' junto al precio '$489.00 USD'",
          problem_detected:
            'Mostrar "SKU: KFL-8821. Potencia: 1450W" sin contexto de beneficio desperdicia el área visual más valiosa de la pantalla.',
          sales_impact: 'Alto',
          xp_reward: 140,
          quick_fix_5min:
            'Mueve los metadatos de SKU al final de la ficha técnica y coloca debajo del título el ahorro en cafeterías (ej. "Se paga sola en 3 meses preparando tu café de especialidad en casa").',
          x_percent: 66,
          y_percent: 24,
        },
      ],
      pro_locked_missions: [
        {
          id: 4,
          title: 'Listar Qué Incluye la Caja con Iconografía Clara',
          visual_evidence_detected:
            "Especificaciones 'Presión: 15 bares. Depósito 2L.' sin listado de accesorios incluidos",
          problem_detected:
            'El comprador no sabe si incluye tamper metálico, jarra espumadora o filtros presurizados, por lo que abre otra pestaña para buscar en Amazon o MercadoLibre.',
          sales_impact: 'Alto',
          xp_reward: 210,
          quick_fix_5min:
            'Añade un recuadro "Kit Barista Completo Incluido en tu Caja (Valorado en $65 USD gratis hoy)" con los 4 accesorios incluidos.',
          x_percent: 70,
          y_percent: 54,
        },
        {
          id: 5,
          title: 'Destacar Financiación Mensual frente al Precio Total',
          visual_evidence_detected:
            "Precio '$489.00 USD' en tipografía monoespaciada sin desglose de cuotas mensuales",
          problem_detected:
            'Ver "$489.00 USD" de golpe activa resistencia psicológica; mostrar la cuota mensual reduce el dolor de pago inmediato.',
          sales_impact: 'Alto',
          xp_reward: 200,
          quick_fix_5min:
            'Muestra "Desde $40.75/mes en 12 cuotas sin interés (o $489.00 de contado)" junto al precio principal.',
          x_percent: 68,
          y_percent: 36,
        },
        {
          id: 6,
          title: 'Incorporar Video Corto o GIF de Extracción de Crema',
          visual_evidence_detected:
            "Recuadro gris oscuro izquierdo con título 'Cafetera Barista Pro DualB' sin galería en acción",
          problem_detected:
            'La imagen estática no transmite la textura del espresso ni la potencia del vaporizador de leche.',
          sales_impact: 'Medio/Alto',
          xp_reward: 190,
          quick_fix_5min:
            'Agrega un clip de 6 segundos mostrando la extracción doble con crema avellana en la galería principal.',
          x_percent: 28,
          y_percent: 48,
        },
        {
          id: 7,
          title: 'Tabla Comparativa Rápida vs. Cafeteras de Cápsulas',
          visual_evidence_detected:
            'Zona inferior derecha debajo del área de garantías sin comparativa de ahorro por taza',
          problem_detected:
            'Muchos visitantes dudan entre esta máquina y una cafetera de cápsulas económica.',
          sales_impact: 'Medio',
          xp_reward: 175,
          quick_fix_5min:
            'Inserta una comparativa de 3 filas mostrando el ahorro anual en grano recién molido ($0.22 por taza vs. $0.95 en cápsula).',
          x_percent: 76,
          y_percent: 90,
        },
        {
          id: 8,
          title: 'Mostrar Seguro de Envío contra Golpes en Tránsito',
          visual_evidence_detected:
            "Alerta en rojo 'Envío calculado recién en el último paso del checkout' debajo de '$489.00 USD'",
          problem_detected:
            'Al ser un equipo pesado de precisión, el cliente teme costos sorpresa y daños en el correo.',
          sales_impact: 'Medio',
          xp_reward: 165,
          quick_fix_5min:
            'Añade junto al envío: "Embalaje blindado de doble espuma + Seguro 100% cubierto hasta tu mesada".',
          x_percent: 82,
          y_percent: 62,
        },
      ],
      pro_ai_copywriting_pack: {
        optimized_product_title:
          'Cafetera Barista Pro DualBoiler 15 Bares — Espresso de Especialidad y Microespuma en 45 Segundos',
        optimized_bullet_benefits: [
          'Extrae espressos con crema densa y vaporiza leche sedosa al mismo tiempo gracias a su sistema térmico DualBoiler profesional.',
          'Kit Barista completo incluido en la caja: portafiltro de 58mm en acero macizo, tamper calibrado y jarra latte art sin costo extra.',
          'Respaldo total sin letra chica: 2 años de garantía oficial directa y envío asegurado gratis hasta la puerta de tu casa.',
        ],
        optimized_cta_button_text: 'Llevar mi Barista Pro con Kit Gratis y Envío Asegurado →',
        trust_guarantee_microcopy:
          'Garantía Oficial 2 Años · Envío blindado 100% asegurado · 30 días de prueba en tu cocina',
      },
      audit_source: 'heuristic_fallback',
      engine_notes: 'Caso de demostración precalibrado (WooCommerce)',
    },
  },
  {
    id: 'mercadolibre-earbuds',
    name: 'Auriculares ANC SonicPulse Pro',
    platform: 'MercadoLibre',
    productName: 'Auriculares Inalámbricos Bluetooth 5.3 Cancelación Ruido',
    productPrice: '$89.990 ARS',
    url: 'https://articulo.mercadolibre.com.ar/MLA-14298301-auriculares-anc-sonicpulse-pro',
    category: 'Electrónica, Audio y Video',
    rawCopyExcerpt:
      'Auriculares bluetooth modelo SP-900. Batería 400mAh. Alcance 10 metros. Consultar stock de colores antes de ofertar. No hacemos factura A.',
    hotspots: [
      { missionId: 1, xPercent: 72, yPercent: 54, label: 'Fricción: "Consultar stock antes de ofertar"', severity: 'critical' },
      { missionId: 2, xPercent: 28, yPercent: 45, label: 'Portada saturada con textos ilegibles', severity: 'critical' },
      { missionId: 3, xPercent: 68, yPercent: 34, label: 'Ficha técnica en mAh en vez de horas reales', severity: 'critical' },
    ],
    report: {
      overall_score: 61,
      rank_title: 'Mercader Aprendiz',
      estimated_lost_sales_percentage: '31%',
      summary_verdict:
        'Tu publicación tiene buen precio competitivo, pero pedir que "consulten stock antes de ofertar" mata la compra impulsiva de Mercado Envíos Full y tu primera foto incumple las reglas de fondo blanco limpio.',
      detected_product_name: 'Auriculares Inalámbricos Bluetooth 5.3 Cancelación Ruido',
      detected_product_price: '$89.990 ARS',
      sub_scores: {
        visual_clarity: 58,
        cta_power: 68,
        trust_and_security: 56,
        copywriting_persuasion: 62,
      },
      free_critical_missions: [
        {
          id: 1,
          title: 'Eliminar la Barrera "Consultar Stock Antes de Ofertar"',
          visual_evidence_detected:
            "Texto en descripción 'Consultar stock de colores antes de ofertar. No hacemos factura A.'",
          problem_detected:
            'En MercadoLibre el 78% de los compradores compran sin preguntar. La frase "Consultar stock de colores antes de ofertar" frena la compra inmediata a las 11 PM.',
          sales_impact: 'Alto',
          xp_reward: 165,
          quick_fix_5min:
            'Sincroniza el stock real por variante de color (Negro Mate / Plata) en el panel de variantes de MercadoLibre y reemplaza esa frase por: "Stock real sincronizado: si está publicado, despachamos en el día".',
          x_percent: 72,
          y_percent: 54,
        },
        {
          id: 2,
          title: 'Despejar la Foto 1 y Crear Infografía en Foto 2',
          visual_evidence_detected:
            "Cuadro de imagen principal izquierdo con fondo oscuro '#1E293B' y texto sobreimpreso",
          problem_detected:
            'La imagen principal no tiene fondo blanco puro (#FFFFFF) y reduce la exposición en los listados de MercadoLibre.',
          sales_impact: 'Alto',
          xp_reward: 155,
          quick_fix_5min:
            'Deja la Foto 1 con fondo blanco puro (#FFFFFF) cubriendo el 85% del cuadro y pasa los 4 íconos de autonomía (36h, ANC -42dB, IPX5, Carga USB-C) a la Foto 2.',
          x_percent: 28,
          y_percent: 45,
        },
        {
          id: 3,
          title: 'Reescribir Ficha Técnica y Compatibilidad Universal',
          visual_evidence_detected:
            "Línea técnica 'Auriculares bluetooth modelo SP-900. Batería 400mAh. Alcance 10 metros.'",
          problem_detected:
            'Decir solo "Batería 400mAh" no significa nada para el comprador promedio, quien abandona la publicación para averiguar cuántas horas reales dura.',
          sales_impact: 'Alto',
          xp_reward: 145,
          quick_fix_5min:
            'Traduce mAh a horas reales: "Hasta 8 horas continuas por carga + 36 horas totales con el estuche cargador (compatible con iPhone, Samsung, Xiaomi y PC)".',
          x_percent: 68,
          y_percent: 34,
        },
      ],
      pro_locked_missions: [
        {
          id: 4,
          title: 'Optimizar Título SEO de 60 Caracteres para el Algoritmo',
          visual_evidence_detected:
            "Título superior 'Auriculares Inalámbricos Bluetooth 5.3' truncado sin marca ni autonomía",
          problem_detected:
            'El título repite "Inalámbricos Bluetooth" y omite atributos de alta intención como "Micrófono Dual" y "Estuche Carga Rápida".',
          sales_impact: 'Alto',
          xp_reward: 215,
          quick_fix_5min:
            'Actualiza el título usando la fórmula Marca + Modelo + Especificación Estrella + Uso (ej. "Auriculares Inalámbricos SonicPulse Pro ANC 36h Micrófono HD").',
          x_percent: 64,
          y_percent: 22,
        },
        {
          id: 5,
          title: 'Transformar el "No Hacemos Factura A" en Mensaje Positivo',
          visual_evidence_detected:
            "Frase negativa 'No hacemos factura A' al final del bloque de texto del producto",
          problem_detected:
            'Las negaciones en la descripción ("No hacemos factura A") generan sensación de vendedor informal.',
          sales_impact: 'Medio/Alto',
          xp_reward: 180,
          quick_fix_5min:
            'Muévelo al pie de la descripción como: "Emitimos Factura B automática adjunta a tu compra + Garantía escrita de 6 meses".',
          x_percent: 74,
          y_percent: 82,
        },
        {
          id: 6,
          title: 'Añadir Foto de Contenido de la Caja (Unboxing Visual)',
          visual_evidence_detected:
            'Parte inferior de la galería izquierda sin miniaturas de accesorios ni cable USB-C',
          problem_detected:
            'Las preguntas más repetidas en publicaciones de audio son "¿Trae cable USB-C?" y "¿Vienen gomitas de distintos tamaños?".',
          sales_impact: 'Medio/Alto',
          xp_reward: 185,
          quick_fix_5min:
            'Sube una tercera imagen mostrando los auriculares, estuche, cable USB-C trenzado y los 3 pares de almohadillas siliconadas S/M/L.',
          x_percent: 24,
          y_percent: 72,
        },
        {
          id: 7,
          title: 'Completar el 100% de la Ficha Técnica Estructurada',
          visual_evidence_detected:
            'Zona inferior derecha sin tabla estructurada de resistencia IPX ni micrófonos',
          problem_detected:
            'Faltan campos clave en la tabla de especificaciones (Clasificación IP, Con modo juego, Cantidad de micrófonos), perdiendo filtros laterales.',
          sales_impact: 'Medio/Alto',
          xp_reward: 175,
          quick_fix_5min:
            'Rellena todos los atributos opcionales en el editor de publicación de MercadoLibre para ganar el badge de calidad máxima.',
          x_percent: 76,
          y_percent: 88,
        },
        {
          id: 8,
          title: 'Pre-responder las 4 Objeciones Clave en la Descripción',
          visual_evidence_detected:
            'Bloque derecho encima del botón CTA sin casos de uso (Oficina, Gimnasio, Viajes)',
          problem_detected:
            'El comprador duda si sirven para correr bajo lluvia o hacer videollamadas en oficina.',
          sales_impact: 'Medio',
          xp_reward: 160,
          quick_fix_5min:
            'Agrega un bloque "Ideal para:" con 3 escenarios concretos (Home Office / Zoom, Gimnasio resistente al sudor IPX5, Viajes en transporte público).',
          x_percent: 80,
          y_percent: 64,
        },
      ],
      pro_ai_copywriting_pack: {
        optimized_product_title:
          'Auriculares Inalámbricos SonicPulse Pro ANC -42dB 36h Bluetooth 5.3 Micrófono Dual HD',
        optimized_bullet_benefits: [
          'Aíslate del ruido de la calle o la oficina al instante con su Cancelación Activa de Ruido Híbrida (-42dB) y modo transparencia.',
          'Olvídate del cargador toda la semana: 36 horas de batería real con estuche de carga rápida USB-C (10 min = 2 horas de música).',
          'Llamadas cristalinas en Zoom, WhatsApp y calle gracias a sus 4 micrófonos con filtro inteligente de viento y resistencia IPX5.',
        ],
        optimized_cta_button_text: 'Comprar Ahora con Envío Rápido Protegido →',
        trust_guarantee_microcopy:
          'Stock real para despacho hoy · Compra Protegida 30 días · Garantía oficial de 6 meses',
      },
      audit_source: 'heuristic_fallback',
      engine_notes: 'Caso de demostración precalibrado (MercadoLibre)',
    },
  },
];

export function getRankTitleForScore(score: number): string {
  if (score >= 90) return 'Leyenda del E-Commerce';
  if (score >= 78) return 'Arquitecto del Checkout';
  if (score >= 65) return 'Artesano de Conversión';
  return 'Mercader Aprendiz';
}

export function validateAuditReportSchema(candidate: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!candidate || typeof candidate !== 'object') {
    return { valid: false, errors: ['El objeto raíz no es un JSON válido.'] };
  }

  const obj = candidate as Record<string, unknown>;

  if (typeof obj.overall_score !== 'number' || obj.overall_score < 0 || obj.overall_score > 100) {
    errors.push('overall_score debe ser un número entre 0 y 100.');
  }
  if (typeof obj.rank_title !== 'string' || obj.rank_title.trim().length === 0) {
    errors.push('rank_title debe ser un string no vacío.');
  }
  if (
    typeof obj.estimated_lost_sales_percentage !== 'string' ||
    !obj.estimated_lost_sales_percentage.trim().endsWith('%')
  ) {
    errors.push('estimated_lost_sales_percentage debe ser un string terminado en "%".');
  }
  if (typeof obj.summary_verdict !== 'string' || obj.summary_verdict.trim().length === 0) {
    errors.push('summary_verdict debe ser un string no vacío.');
  }
  if (typeof obj.detected_product_name !== 'string' || obj.detected_product_name.trim().length === 0) {
    errors.push('detected_product_name debe ser un string no vacío.');
  }
  if (typeof obj.detected_product_price !== 'string' || obj.detected_product_price.trim().length === 0) {
    errors.push('detected_product_price debe ser un string no vacío.');
  }

  const sub = obj.sub_scores as Record<string, unknown> | undefined;
  if (!sub || typeof sub !== 'object') {
    errors.push('sub_scores es obligatorio.');
  } else {
    for (const key of ['visual_clarity', 'cta_power', 'trust_and_security', 'copywriting_persuasion']) {
      if (typeof sub[key] !== 'number') {
        errors.push(`sub_scores.${key} debe ser numérico.`);
      }
    }
  }

  const checkMissionsArray = (arr: unknown, fieldName: string, expectedLen: number) => {
    if (!Array.isArray(arr) || arr.length !== expectedLen) {
      errors.push(
        `${fieldName} debe contener exactamente ${expectedLen} elementos (actual: ${
          Array.isArray(arr) ? arr.length : 0
        }).`
      );
      return;
    }
    arr.forEach((m, idx) => {
      if (!m || typeof m !== 'object') {
        errors.push(`${fieldName}[${idx}] no es un objeto válido.`);
        return;
      }
      const mission = m as Record<string, unknown>;
      if (
        typeof mission.visual_evidence_detected !== 'string' ||
        !mission.visual_evidence_detected.trim()
      ) {
        errors.push(
          `${fieldName}[${idx}].visual_evidence_detected debe ser un string no vacío con la evidencia visual.`
        );
      }
      if (
        typeof mission.x_percent !== 'number' ||
        mission.x_percent < 8 ||
        mission.x_percent > 92
      ) {
        errors.push(`${fieldName}[${idx}].x_percent debe ser un número entre 8 y 92.`);
      }
      if (
        typeof mission.y_percent !== 'number' ||
        mission.y_percent < 8 ||
        mission.y_percent > 92
      ) {
        errors.push(`${fieldName}[${idx}].y_percent debe ser un número entre 8 y 92.`);
      }
    });
  };

  checkMissionsArray(obj.free_critical_missions, 'free_critical_missions', 3);
  checkMissionsArray(obj.pro_locked_missions, 'pro_locked_missions', 5);

  const pack = obj.pro_ai_copywriting_pack as Record<string, unknown> | undefined;
  if (!pack || typeof pack !== 'object') {
    errors.push('pro_ai_copywriting_pack es obligatorio.');
  } else {
    if (typeof pack.optimized_product_title !== 'string' || !pack.optimized_product_title.trim()) {
      errors.push('pro_ai_copywriting_pack.optimized_product_title es obligatorio.');
    }
    if (
      !Array.isArray(pack.optimized_bullet_benefits) ||
      pack.optimized_bullet_benefits.length < 3
    ) {
      errors.push('pro_ai_copywriting_pack.optimized_bullet_benefits debe incluir al menos 3 beneficios.');
    }
    if (typeof pack.optimized_cta_button_text !== 'string' || !pack.optimized_cta_button_text.trim()) {
      errors.push('pro_ai_copywriting_pack.optimized_cta_button_text es obligatorio.');
    }
    if (typeof pack.trust_guarantee_microcopy !== 'string' || !pack.trust_guarantee_microcopy.trim()) {
      errors.push('pro_ai_copywriting_pack.trust_guarantee_microcopy es obligatorio.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function normalizeAuditReport(
  raw: Partial<StoreAuditReport> | null | undefined,
  fallbackPresetId = 'shopify-sneaker'
): StoreAuditReport {
  const fallback =
    PRESET_STORE_CASES.find((c) => c.id === fallbackPresetId)?.report ??
    PRESET_STORE_CASES[0].report;

  if (!raw || typeof raw !== 'object') {
    return structuredClone(fallback);
  }

  const clampScore = (val: unknown, def: number) => {
    if (typeof val !== 'number' || Number.isNaN(val)) return def;
    return Math.max(0, Math.min(100, Math.round(val)));
  };

  const clampCoord = (val: unknown, def: number) => {
    if (typeof val !== 'number' || Number.isNaN(val)) return def;
    return Math.max(8, Math.min(92, Math.round(val)));
  };

  const isLiveGemini = raw.audit_source === 'live_gemini';

  if (isLiveGemini) {
    // Requirement 4: When raw.audit_source === 'live_gemini', NEVER replace titles, verdicts, or missions with shopify-sneaker fallback.
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
      audit_source: 'live_gemini',
    };

    if (typeof raw.engine_notes === 'string' && raw.engine_notes.trim()) {
      liveResult.engine_notes = raw.engine_notes.trim();
    }
    if (typeof raw.captured_image_url === 'string' && raw.captured_image_url.trim()) {
      liveResult.captured_image_url = raw.captured_image_url.trim();
    }

    return liveResult;
  }

  const overall_score = clampScore(raw.overall_score, fallback.overall_score);
  const rank_title =
    typeof raw.rank_title === 'string' && raw.rank_title.trim()
      ? raw.rank_title.trim()
      : getRankTitleForScore(overall_score);

  let estimated_lost_sales_percentage = fallback.estimated_lost_sales_percentage;
  if (typeof raw.estimated_lost_sales_percentage === 'string' && raw.estimated_lost_sales_percentage.trim()) {
    const clean = raw.estimated_lost_sales_percentage.trim();
    estimated_lost_sales_percentage = clean.endsWith('%') ? clean : `${clean}%`;
  }

  const summary_verdict =
    typeof raw.summary_verdict === 'string' && raw.summary_verdict.trim()
      ? raw.summary_verdict.trim()
      : fallback.summary_verdict;

  const detected_product_name =
    typeof raw.detected_product_name === 'string' && raw.detected_product_name.trim()
      ? raw.detected_product_name.trim()
      : fallback.detected_product_name;

  const detected_product_price =
    typeof raw.detected_product_price === 'string' && raw.detected_product_price.trim()
      ? raw.detected_product_price.trim()
      : fallback.detected_product_price;

  const sub_scores: SubScores = {
    visual_clarity: clampScore(raw.sub_scores?.visual_clarity, fallback.sub_scores.visual_clarity),
    cta_power: clampScore(raw.sub_scores?.cta_power, fallback.sub_scores.cta_power),
    trust_and_security: clampScore(
      raw.sub_scores?.trust_and_security,
      fallback.sub_scores.trust_and_security
    ),
    copywriting_persuasion: clampScore(
      raw.sub_scores?.copywriting_persuasion,
      fallback.sub_scores.copywriting_persuasion
    ),
  };

  const sanitizeMission = (
    item: Partial<MissionItem> | undefined,
    def: MissionItem,
    forcedId: number
  ): MissionItem => ({
    id: forcedId,
    title: typeof item?.title === 'string' && item.title.trim() ? item.title.trim() : def.title,
    visual_evidence_detected:
      typeof item?.visual_evidence_detected === 'string' && item.visual_evidence_detected.trim()
        ? item.visual_evidence_detected.trim()
        : def.visual_evidence_detected,
    problem_detected:
      typeof item?.problem_detected === 'string' && item.problem_detected.trim()
        ? item.problem_detected.trim()
        : def.problem_detected,
    sales_impact:
      typeof item?.sales_impact === 'string' && item.sales_impact.trim()
        ? item.sales_impact.trim()
        : def.sales_impact,
    xp_reward:
      typeof item?.xp_reward === 'number' && item.xp_reward > 0
        ? Math.round(item.xp_reward)
        : def.xp_reward,
    quick_fix_5min:
      typeof item?.quick_fix_5min === 'string' && item.quick_fix_5min.trim()
        ? item.quick_fix_5min.trim()
        : def.quick_fix_5min,
    x_percent: clampCoord(item?.x_percent, def.x_percent),
    y_percent: clampCoord(item?.y_percent, def.y_percent),
  });

  const rawFree = Array.isArray(raw.free_critical_missions) ? raw.free_critical_missions : [];
  const free_critical_missions: MissionItem[] = [0, 1, 2].map((idx) =>
    sanitizeMission(rawFree[idx], fallback.free_critical_missions[idx], idx + 1)
  );

  const rawPro = Array.isArray(raw.pro_locked_missions) ? raw.pro_locked_missions : [];
  const pro_locked_missions: MissionItem[] = [0, 1, 2, 3, 4].map((idx) =>
    sanitizeMission(rawPro[idx], fallback.pro_locked_missions[idx], idx + 4)
  );

  const rawBullets = Array.isArray(raw.pro_ai_copywriting_pack?.optimized_bullet_benefits)
    ? raw.pro_ai_copywriting_pack!.optimized_bullet_benefits.filter(
        (b): b is string => typeof b === 'string' && b.trim().length > 0
      )
    : [];

  const optimized_bullet_benefits =
    rawBullets.length >= 3
      ? rawBullets.slice(0, 3)
      : [
          rawBullets[0] ?? fallback.pro_ai_copywriting_pack.optimized_bullet_benefits[0],
          rawBullets[1] ?? fallback.pro_ai_copywriting_pack.optimized_bullet_benefits[1],
          rawBullets[2] ?? fallback.pro_ai_copywriting_pack.optimized_bullet_benefits[2],
        ];

  const pro_ai_copywriting_pack: ProAiCopywritingPack = {
    optimized_product_title:
      typeof raw.pro_ai_copywriting_pack?.optimized_product_title === 'string' &&
      raw.pro_ai_copywriting_pack.optimized_product_title.trim()
        ? raw.pro_ai_copywriting_pack.optimized_product_title.trim()
        : fallback.pro_ai_copywriting_pack.optimized_product_title,
    optimized_bullet_benefits,
    optimized_cta_button_text:
      typeof raw.pro_ai_copywriting_pack?.optimized_cta_button_text === 'string' &&
      raw.pro_ai_copywriting_pack.optimized_cta_button_text.trim()
        ? raw.pro_ai_copywriting_pack.optimized_cta_button_text.trim()
        : fallback.pro_ai_copywriting_pack.optimized_cta_button_text,
    trust_guarantee_microcopy:
      typeof raw.pro_ai_copywriting_pack?.trust_guarantee_microcopy === 'string' &&
      raw.pro_ai_copywriting_pack.trust_guarantee_microcopy.trim()
        ? raw.pro_ai_copywriting_pack.trust_guarantee_microcopy.trim()
        : fallback.pro_ai_copywriting_pack.trust_guarantee_microcopy,
  };

  const result: StoreAuditReport = {
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
  };

  if (raw.audit_source === 'live_gemini' || raw.audit_source === 'heuristic_fallback') {
    result.audit_source = raw.audit_source;
  } else if (fallback.audit_source) {
    result.audit_source = fallback.audit_source;
  }

  if (typeof raw.engine_notes === 'string' && raw.engine_notes.trim()) {
    result.engine_notes = raw.engine_notes.trim();
  }

  if (typeof raw.captured_image_url === 'string' && raw.captured_image_url.trim()) {
    result.captured_image_url = raw.captured_image_url.trim();
  }

  return result;
}

export interface LevelUpSimulation {
  earnedXp: number;
  totalPossibleXp: number;
  completedCount: number;
  totalMissionsCount: number;
  projectedScore: number;
  projectedRank: string;
  projectedLostSalesPercentage: string;
  recoveredSalesPoints: number;
}

export function calculateLevelUpState(
  report: StoreAuditReport,
  completedMissionIds: number[]
): LevelUpSimulation {
  const allMissions = [...report.free_critical_missions, ...report.pro_locked_missions];
  const completedSet = new Set(completedMissionIds);

  let earnedXp = 0;
  let totalPossibleXp = 0;
  let completedCount = 0;

  for (const mission of allMissions) {
    totalPossibleXp += mission.xp_reward;
    if (completedSet.has(mission.id)) {
      earnedXp += mission.xp_reward;
      completedCount += 1;
    }
  }

  const maxScoreGain = Math.max(0, 98 - report.overall_score);
  const progressRatio = totalPossibleXp > 0 ? earnedXp / totalPossibleXp : 0;
  const projectedScore = Math.min(99, Math.round(report.overall_score + maxScoreGain * progressRatio));

  const baseLostNumeric = parseInt(report.estimated_lost_sales_percentage.replace(/[^0-9]/g, ''), 10) || 28;
  const recoveredSalesPoints = Math.round(baseLostNumeric * 0.85 * progressRatio);
  const remainingLost = Math.max(3, baseLostNumeric - recoveredSalesPoints);

  const projectedRank =
    completedCount === 0 ? report.rank_title : getRankTitleForScore(projectedScore);

  return {
    earnedXp,
    totalPossibleXp,
    completedCount,
    totalMissionsCount: allMissions.length,
    projectedScore,
    projectedRank,
    projectedLostSalesPercentage: `${remainingLost}%`,
    recoveredSalesPoints,
  };
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

export interface ScrapedStoreMetadata {
  contextText: string;
  pageTitle: string;
  detectedPrice: string;
  ogImageUrl: string | null;
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

  // Extract price from meta tags or body text
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

export function extractStoreHtmlContext(html: string): string | null {
  const parsed = parseStoreHtmlMetadata(html);
  return parsed ? parsed.contextText : null;
}
