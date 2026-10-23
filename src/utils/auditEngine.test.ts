import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESET_STORE_CASES,
  validateAuditReportSchema,
  normalizeAuditReport,
  calculateLevelUpState,
  getRankTitleForScore,
  extractStoreHtmlContext,
  parseStoreHtmlMetadata,
} from './auditEngine';

test('all preset store cases strictly satisfy the StoreLevelUp JSON contract (3 free + 5 pro missions + valid x_percent/y_percent + detected fields)', () => {
  for (const preset of PRESET_STORE_CASES) {
    const result = validateAuditReportSchema(preset.report);
    assert.equal(result.valid, true, `Preset ${preset.id} failed validation: ${result.errors.join(', ')}`);
    assert.equal(preset.report.free_critical_missions.length, 3);
    assert.equal(preset.report.pro_locked_missions.length, 5);
    assert.equal(preset.report.pro_ai_copywriting_pack.optimized_bullet_benefits.length, 3);
    assert.ok(preset.report.detected_product_name.length > 0);
    assert.ok(preset.report.detected_product_price.length > 0);

    const allMissions = [
      ...preset.report.free_critical_missions,
      ...preset.report.pro_locked_missions,
    ];
    for (const m of allMissions) {
      assert.ok(m.x_percent >= 8 && m.x_percent <= 92, `Invalid x_percent ${m.x_percent}`);
      assert.ok(m.y_percent >= 8 && m.y_percent <= 92, `Invalid y_percent ${m.y_percent}`);
    }
  }
});

test('normalizeAuditReport with live_gemini strictly preserves Gemini texts and visual_evidence_detected without injecting shopify-sneaker fallback', () => {
  const liveGeminiInput = {
    overall_score: 71,
    rank_title: 'Mercader Audaz',
    estimated_lost_sales_percentage: '22',
    summary_verdict: 'El botón azul "Comprar" compite con el banner superior.',
    detected_product_name: 'Campera Impermeable Patagonia',
    detected_product_price: '$125.000 ARS',
    audit_source: 'live_gemini' as const,
    engine_notes: 'Scraped URL + Gemini 2.5 Flash Vision',
    free_critical_missions: [
      {
        id: 99,
        title: 'Misión Real de Campera',
        visual_evidence_detected: "Botón azul con texto 'Comprar ahora' debajo del precio $125.000 ARS",
        problem_detected: 'El botón "Comprar ahora" está pegado al borde inferior.',
        sales_impact: 'Alto',
        xp_reward: 180,
        quick_fix_5min: 'Aumentar padding del botón "Comprar ahora".',
        x_percent: 2,
        y_percent: 99,
      },
    ],
    pro_locked_missions: [],
    pro_ai_copywriting_pack: {
      optimized_product_title: 'Campera Impermeable Patagonia Gore-Tex',
      optimized_bullet_benefits: ['100% impermeable', 'Costuras termoselladas', 'Envío gratis hoy'],
      optimized_cta_button_text: 'Comprar mi Campera Ahora',
      trust_guarantee_microcopy: 'Cambio gratis por 30 días',
    },
  };

  const normalized = normalizeAuditReport(liveGeminiInput, 'shopify-sneaker');

  assert.equal(normalized.overall_score, 71);
  assert.equal(normalized.summary_verdict, 'El botón azul "Comprar" compite con el banner superior.');
  assert.equal(normalized.detected_product_name, 'Campera Impermeable Patagonia');
  assert.equal(normalized.detected_product_price, '$125.000 ARS');
  assert.equal(normalized.estimated_lost_sales_percentage, '22%');
  assert.equal(normalized.audit_source, 'live_gemini');
  assert.equal(normalized.free_critical_missions.length, 1);
  assert.equal(
    normalized.free_critical_missions[0].visual_evidence_detected,
    "Botón azul con texto 'Comprar ahora' debajo del precio $125.000 ARS"
  );
  assert.equal(normalized.free_critical_missions[0].x_percent, 8);
  assert.equal(normalized.free_critical_missions[0].y_percent, 92);
  // Must NOT inject the 5 shopify-sneaker missions when live_gemini returned empty pro_locked_missions
  assert.equal(normalized.pro_locked_missions.length, 0);
  assert.ok(!JSON.stringify(normalized).includes('AeroStride'));

  // Also verify Regla A (score 0 for non-ecommerce image) is preserved and not overwritten by fallback score 64
  const nonEcommerceInput = {
    overall_score: 0,
    summary_verdict:
      'La imagen subida no parece ser una página de producto de e-commerce. Vemos: un escritorio con una laptop.',
    audit_source: 'live_gemini' as const,
  };
  const normalizedZero = normalizeAuditReport(nonEcommerceInput, 'shopify-sneaker');
  assert.equal(normalizedZero.overall_score, 0);
  assert.ok(
    normalizedZero.summary_verdict.startsWith(
      'La imagen subida no parece ser una página de producto de e-commerce.'
    )
  );
});

test('calculateLevelUpState increases XP, projected score, and lowers lost sales percentage', () => {
  const report = PRESET_STORE_CASES[0].report;
  const initial = calculateLevelUpState(report, []);
  assert.equal(initial.earnedXp, 0);
  assert.equal(initial.projectedScore, 64);
  assert.equal(initial.projectedLostSalesPercentage, '28%');

  const afterFreeMissions = calculateLevelUpState(report, [1, 2, 3]);
  assert.equal(afterFreeMissions.earnedXp, 150 + 150 + 140);
  assert.ok(afterFreeMissions.projectedScore > 64);
  assert.ok(afterFreeMissions.recoveredSalesPoints > 0);

  const afterAllMissions = calculateLevelUpState(report, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(afterAllMissions.earnedXp, afterAllMissions.totalPossibleXp);
  assert.equal(afterAllMissions.projectedScore, 98);
  assert.equal(afterAllMissions.projectedRank, getRankTitleForScore(98));
});

test('parseStoreHtmlMetadata and extractStoreHtmlContext extract title, price, og:image, and strip scripts', () => {
  const sampleHtml = `
    <html>
      <head>
        <title>Zapatillas AeroStride — Tienda Oficial</title>
        <meta name="description" content="Compra las nuevas AeroStride con envío rápido." />
        <meta property="og:image" content="https://cdn.example.com/aerostride.jpg" />
        <style>.hidden { display: none; }</style>
      </head>
      <body>
        <script>console.log("secret tracker");</script>
        <h1>AeroStride Runner V2</h1>
        <h2>Especificaciones Técnicas</h2>
        <p>Oferta lanzamiento: $189.900. Envío sujeto a disponibilidad.</p>
      </body>
    </html>
  `;

  const meta = parseStoreHtmlMetadata(sampleHtml);
  assert.ok(meta);
  assert.equal(meta.ogImageUrl, 'https://cdn.example.com/aerostride.jpg');
  assert.equal(meta.detectedPrice, '$189.900');

  const extracted = extractStoreHtmlContext(sampleHtml);
  assert.ok(extracted);
  assert.ok(extracted.includes('AeroStride Runner V2'));
  assert.ok(extracted.includes('$189.900'));
  assert.ok(!extracted.includes('secret tracker'));
});
