import React, { useState, useMemo } from 'react';
import {
  Eye,
  Check,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShoppingBag,
  Wrench,
  AlertCircle,
  Lock,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import {
  EcommercePlatform,
  MissionItem,
  PresetStoreCase,
  StoreAuditReport,
} from '../utils/auditEngine';

interface ProductScreenshotInspectorProps {
  platform: EcommercePlatform;
  storeUrl: string;
  isCustomAudit: boolean;
  preset?: PresetStoreCase;
  uploadedImageUrl: string | null;
  report: StoreAuditReport;
  completedMissionIds: number[];
  selectedMissionId: number | null;
  onSelectMission: (id: number) => void;
  onToggleMissionComplete: (id: number) => void;
  proUnlocked: boolean;
  onUnlockPro: () => void;
}

export function generatePresetCanvasBase64(preset: PresetStoreCase): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Top dark announcement bar
    ctx.fillStyle = '#181615';
    ctx.fillRect(0, 0, 960, 28);
    ctx.fillStyle = '#A6A29A';
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Envíos estándar procesados según disponibilidad · ${preset.platform} Store`,
      480,
      18
    );

    // White navigation header bar
    ctx.fillStyle = '#F7F5F2';
    ctx.fillRect(0, 28, 960, 56);
    ctx.fillStyle = '#181615';
    ctx.textAlign = 'left';
    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Home', 42, 61);
    ctx.fillText('Catálogo ▾', 98, 61);

    // Center store brand in navbar
    ctx.font = 'bold 22px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ellik.', 480, 62);

    // Sub-links under brand
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#57534E';
    ctx.fillText('Home      Tienda      Producto      Contacto', 480, 78);

    // Right icons in navbar
    ctx.textAlign = 'right';
    ctx.font = '500 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#181615';
    ctx.fillText(`${preset.productPrice}`, 918, 61);

    // Hero lifestyle section (warm muted studio photography tone like the mockup)
    const heroGrad = ctx.createLinearGradient(0, 84, 960, 430);
    heroGrad.addColorStop(0, '#6E665E');
    heroGrad.addColorStop(0.55, '#59524B');
    heroGrad.addColorStop(1, '#2B2723');
    ctx.fillStyle = heroGrad;
    ctx.fillRect(0, 84, 960, 346);

    // Subtle studio wardrobe / product silhouettes in hero background
    ctx.fillStyle = 'rgba(20, 18, 16, 0.35)';
    ctx.fillRect(60, 130, 190, 260);
    ctx.fillStyle = 'rgba(245, 243, 239, 0.12)';
    ctx.fillRect(95, 155, 55, 210);
    ctx.fillStyle = 'rgba(180, 140, 110, 0.22)';
    ctx.fillRect(160, 155, 65, 210);

    // Right dark editorial silhouette
    ctx.fillStyle = 'rgba(15, 14, 13, 0.72)';
    ctx.beginPath();
    ctx.roundRect(530, 105, 280, 315, 16);
    ctx.fill();

    // Center Hero Title & Weak CTA Button
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F7F5F2';
    ctx.font = '500 38px "Space Grotesk", sans-serif';
    ctx.fillText(preset.name.slice(0, 28), 480, 265);

    ctx.fillStyle = '#D6D3CD';
    ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `${preset.productName} · ${preset.productPrice} · Sin sello de garantía visible`,
      480,
      294
    );

    // Small low-contrast CTA button in center of hero
    ctx.fillStyle = '#F5F3EF';
    ctx.beginPath();
    ctx.roundRect(415, 318, 130, 38, 4);
    ctx.fill();
    ctx.fillStyle = '#181615';
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Comprar ahora', 480, 342);

    // Bottom 4-column product grid strip (matching the reference mockup)
    ctx.fillStyle = '#EAE6E1';
    ctx.fillRect(0, 430, 960, 210);

    const cardColors = ['#B59E88', '#22201E', '#2C2A29', '#1F1D1B'];
    const cardLabels = ['Vista Frontal', 'Detalle Material', 'Escala Real', 'Ficha Técnica'];
    for (let i = 0; i < 4; i++) {
      const x = 44 + i * 222;
      ctx.fillStyle = '#DCD7D0';
      ctx.fillRect(x, 446, 206, 178);

      // Product silhouette inside each card
      ctx.fillStyle = cardColors[i];
      ctx.beginPath();
      ctx.roundRect(x + 52, 476, 102, 125, 18);
      ctx.fill();

      ctx.fillStyle = '#57534E';
      ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(cardLabels[i], x + 103, 614);
    }

    ctx.textAlign = 'left';
    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

export const ProductScreenshotInspector: React.FC<ProductScreenshotInspectorProps> = ({
  platform,
  storeUrl,
  isCustomAudit,
  preset,
  uploadedImageUrl,
  report,
  completedMissionIds,
  selectedMissionId,
  onSelectMission,
  onToggleMissionComplete,
  proUnlocked,
  onUnlockPro,
}) => {
  const [viewMode, setViewMode] = useState<'audit' | 'optimized'>('audit');
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const demoCanvasUrl = useMemo(() => {
    if (isCustomAudit || !preset) return null;
    return generatePresetCanvasBase64(preset);
  }, [isCustomAudit, preset]);

  const effectiveImageUrl =
    uploadedImageUrl || report.captured_image_url || demoCanvasUrl || null;

  const allMissions: Array<{ mission: MissionItem; severity: 'critical' | 'pro' }> = [
    ...report.free_critical_missions.map((mission) => ({
      mission,
      severity: 'critical' as const,
    })),
    ...report.pro_locked_missions.map((mission) => ({
      mission,
      severity: 'pro' as const,
    })),
  ];

  const visibleMissions = allMissions.filter(
    (item) => item.severity === 'critical' || proUnlocked
  );

  const activeMissionEntry =
    allMissions.find((item) => item.mission.id === selectedMissionId) ||
    allMissions[0] || {
      severity: 'critical' as const,
      mission: {
        id: 1,
        title: 'Diagnóstico de Imagen Subida',
        visual_evidence_detected: report.summary_verdict || 'Sin elementos comerciales detectados',
        problem_detected:
          report.summary_verdict || 'No se detectaron elementos de tienda online en la imagen.',
        sales_impact: 'N/A',
        xp_reward: 0,
        quick_fix_5min:
          'Sube una captura de pantalla de una página de producto o tienda online válida.',
        x_percent: 50,
        y_percent: 50,
      },
    };

  const activeMission = activeMissionEntry.mission;
  const isActiveMissionLocked = activeMissionEntry.severity === 'pro' && !proUnlocked;
  const isActiveMissionCompleted = completedMissionIds.includes(activeMission.id);

  const realProductName = report.detected_product_name || 'Producto Auditado';
  const realProductPrice = report.detected_product_price || 'No visible';

  return (
    <section
      aria-label="Análisis Multimodal de Imagen"
      className="bg-[#121110] border border-[#1E1C19] rounded-2xl p-4 sm:p-5 space-y-4 relative w-full"
    >
      {/* Top HUD Frame Header (Matches "Análisis Multimodal de Imagen" + waveform + coordinates) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-[#1A1816]">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#161513] border border-[#24211E] text-xs font-medium text-[#E6E2DC]">
            Análisis Multimodal de Imagen
          </div>

          {/* Subtle analog signal bars */}
          <svg
            width="68"
            height="18"
            viewBox="0 0 68 18"
            className="text-[#57534E] hidden sm:block"
            aria-hidden="true"
          >
            {[2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62].map((x, i) => {
              const heights = [4, 7, 13, 8, 16, 10, 6, 12, 5, 9, 4, 6, 3, 5, 2, 4];
              const h = heights[i % heights.length];
              return (
                <rect
                  key={x}
                  x={x}
                  y={18 - h}
                  width="1.5"
                  height={h}
                  rx="0.75"
                  fill="currentColor"
                />
              );
            })}
          </svg>
        </div>

        {/* Right HUD Controls: Telemetry + View Switch */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-display text-[#6E6A63] hidden xl:inline">
            CRO {activeMission.x_percent}, {activeMission.y_percent}, {report.overall_score}
          </span>

          <div
            className="flex items-center gap-1 p-1 bg-[#0C0B0A] rounded-lg border border-[#1A1816]"
            role="group"
            aria-label="Modo de visualización de la página"
          >
            <button
              type="button"
              onClick={() => setViewMode('audit')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer font-display ${
                viewMode === 'audit'
                  ? 'bg-[#FF5500] text-[#0C0B0A]'
                  : 'text-[#9E9A93] hover:text-[#F5F3EF]'
              }`}
            >
              Pines ({visibleMissions.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('optimized')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer font-display ${
                viewMode === 'optimized'
                  ? 'bg-[#CCFF00] text-[#0C0B0A]'
                  : 'text-[#9E9A93] hover:text-[#F5F3EF]'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Antes / Después</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'audit' ? (
        <div className="space-y-4">
          {/* Technical Viewport Frame with subtle edge ticks and Teardrop Map Pins */}
          <div className="relative px-1 sm:px-2 pt-1 pb-2">
            {/* Subtle vertical coordinate label on left edge */}
            <div
              aria-hidden="true"
              className="hidden sm:block absolute left-0 bottom-12 -rotate-90 origin-bottom-left text-[9px] font-display text-[#57534E] tracking-widest select-none"
            >
              {activeMission.x_percent}.0 · {activeMission.y_percent}.0
            </div>

            {/* Screenshot Canvas Container */}
            <div className="relative rounded-xl bg-[#0C0B0A] border border-[#1A1816] overflow-hidden min-h-[360px] flex items-center justify-center">
              {effectiveImageUrl && !imageLoadFailed ? (
                <div className="relative w-full">
                  <img
                    src={effectiveImageUrl}
                    alt={`Captura de pantalla de ${realProductName}`}
                    referrerPolicy="no-referrer"
                    onError={() => setImageLoadFailed(true)}
                    className="w-full h-auto max-h-[820px] 2xl:max-h-[900px] object-contain block mx-auto"
                  />

                  {/* Teardrop Map Pins (#1, #2, #3...) matching the mockup */}
                  {visibleMissions.map(({ mission }, idx) => {
                    const isSelected = activeMission.id === mission.id;
                    const isCompleted = completedMissionIds.includes(mission.id);
                    const pinFill = isCompleted
                      ? '#CCFF00'
                      : idx % 2 === 1 && !isSelected
                      ? '#F59E0B'
                      : '#FF5500';
                    const textColor = isCompleted || (idx % 2 === 1 && !isSelected)
                      ? '#0C0B0A'
                      : '#FFFFFF';

                    return (
                      <button
                        key={mission.id}
                        type="button"
                        onClick={() => onSelectMission(mission.id)}
                        style={{
                          left: `${mission.x_percent}%`,
                          top: `${mission.y_percent}%`,
                        }}
                        title={`Misión #${mission.id}: ${mission.title}`}
                        aria-label={`Seleccionar pin ${mission.id}: ${mission.title}`}
                        className={`group absolute -translate-x-1/2 -translate-y-[88%] flex flex-col items-center cursor-pointer transition-transform ${
                          isSelected ? 'scale-115 z-20' : 'hover:scale-110 z-10'
                        }`}
                      >
                        <div className="relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                          <svg
                            width="40"
                            height="48"
                            viewBox="0 0 40 48"
                            className="overflow-visible"
                          >
                            <path
                              d="M20 2C10.6 2 3 9.6 3 19C3 30.2 20 45 20 45C20 45 37 30.2 37 19C37 9.6 29.4 2 20 2Z"
                              fill={pinFill}
                              stroke={isSelected ? '#FFFFFF' : '#141312'}
                              strokeWidth={isSelected ? '2' : '1.5'}
                            />
                          </svg>
                          <span
                            style={{ color: textColor }}
                            className="absolute inset-x-0 top-[9px] text-center font-display text-xs font-bold tracking-tight"
                          >
                            {isCompleted ? '✓' : `#${mission.id}`}
                          </span>
                        </div>
                        {/* Clean precision contact dot at the exact pixel coordinate */}
                        <span
                          className="w-2 h-2 rounded-full -mt-1 border border-[#0C0B0A]"
                          style={{ backgroundColor: pinFill }}
                        />
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Clean Structural Map when user only provided text copy */
                <div className="relative w-full p-7 min-h-[340px] flex flex-col justify-between bg-[#0C0B0A] text-[#F5F3EF]">
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-center gap-2 text-xs text-[#9E9A93] font-display">
                      <ImageIcon className="w-4 h-4 text-[#FF5500]" />
                      <span>Mapa Estructural de Página Auditada ({platform})</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#F5F3EF] font-display">
                      {realProductName}
                    </h3>
                    <div className="text-base font-display font-bold text-[#FF5500]">
                      Precio detectado: {realProductPrice}
                    </div>
                  </div>

                  {/* Teardrop Pins over structural frame */}
                  {visibleMissions.map(({ mission }) => {
                    const isSelected = activeMission.id === mission.id;
                    const isCompleted = completedMissionIds.includes(mission.id);
                    const pinFill = isCompleted ? '#CCFF00' : '#FF5500';
                    return (
                      <button
                        key={mission.id}
                        type="button"
                        onClick={() => onSelectMission(mission.id)}
                        style={{
                          left: `${mission.x_percent}%`,
                          top: `${mission.y_percent}%`,
                        }}
                        aria-label={`Seleccionar pin ${mission.id}: ${mission.title}`}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full font-display text-xs font-bold flex items-center justify-center transition-transform cursor-pointer ${
                          isCompleted
                            ? 'bg-[#CCFF00] text-[#0C0B0A]'
                            : isSelected
                            ? 'bg-[#FF5500] text-white scale-125 z-10 ring-2 ring-white'
                            : 'bg-[#FF5500]/90 text-white'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : `#${mission.id}`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom HUD Ruler Ticks (Matches bottom-left ruler in the reference image) */}
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-display text-[#57534E] px-1">
              <div className="flex items-center gap-2">
                <span>
                  0{activeMission.x_percent}.00 · -{activeMission.y_percent}.00
                </span>
                <div className="flex items-end gap-1 h-2.5" aria-hidden="true">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-px bg-[#3A352F] ${i % 3 === 0 ? 'h-2.5' : 'h-1.5'}`}
                    />
                  ))}
                </div>
              </div>
              <span className="truncate max-w-[260px]">
                {realProductName} · <strong className="text-[#A6A29A]">{realProductPrice}</strong>
              </span>
            </div>
          </div>

          {/* Selected Pin Evidence & Action Strip right below the viewport */}
          <div
            data-testid="selected-pin-detail-card"
            className="rounded-xl bg-[#151412] border border-[#201D1A] p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-display">
                <span className="w-5 h-5 rounded-full bg-[#FF5500] text-white text-[11px] font-bold inline-flex items-center justify-center">
                  #{activeMission.id}
                </span>
                <h3
                  data-testid="selected-pin-title"
                  className="text-sm font-bold text-[#F5F3EF] font-display"
                >
                  {activeMission.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#2A1C11] text-[#FF8833] text-[11px] font-bold">
                  +{activeMission.xp_reward} XP
                </span>
              </div>

              {!isActiveMissionLocked && (
                <button
                  type="button"
                  onClick={() => onToggleMissionComplete(activeMission.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold font-display transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActiveMissionCompleted
                      ? 'bg-[#1D240B] text-[#CCFF00]'
                      : 'bg-[#FF5500] text-[#0C0B0A] hover:bg-[#FF6A1F]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isActiveMissionCompleted
                      ? 'Misión Resuelta'
                      : `Marcar como Resuelto (+${activeMission.xp_reward} XP)`}
                  </span>
                </button>
              )}
            </div>

            {isActiveMissionLocked ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-xs text-[#9E9A93]">
                  Esta coordenada corresponde a una misión avanzada de Nivel Pro.
                </p>
                <button
                  type="button"
                  onClick={onUnlockPro}
                  className="px-3.5 py-1.5 text-xs font-bold font-display bg-[#FF5500] text-[#0C0B0A] rounded-lg hover:bg-[#FF6A1F] transition-colors shrink-0 cursor-pointer"
                >
                  Desbloquear Pro
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {activeMission.visual_evidence_detected && (
                  <div
                    data-testid="selected-pin-visual-evidence"
                    className="space-y-0.5"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#FF5500] font-display">
                      <Eye className="w-3 h-3 shrink-0" />
                      <span>
                        Evidencia Visual ({activeMission.x_percent}%, {activeMission.y_percent}%)
                      </span>
                    </div>
                    <p className="text-xs text-[#D6D3CD] leading-relaxed">
                      “{activeMission.visual_evidence_detected}”
                    </p>
                  </div>
                )}

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#CCFF00] font-display">
                    <Wrench className="w-3 h-3 shrink-0" />
                    <span>Solución en 5 Minutos</span>
                  </div>
                  <p className="text-xs text-[#C7C3BC] leading-relaxed">
                    {activeMission.quick_fix_5min}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SIMULACIÓN OPTIMIZADA CRO: Side-by-Side Before (Original) vs After (Optimized) */
        <div
          data-testid="cro-simulation-comparator"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch pt-1"
        >
          {/* Left Column (5 cols): ANTES */}
          <div className="lg:col-span-5 rounded-xl bg-[#0C0B0A] p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-display text-[#FF5500]">
                <span className="font-bold">ANTES · ACTUAL</span>
                <span>Fuga: {report.estimated_lost_sales_percentage}</span>
              </div>

              {effectiveImageUrl && !imageLoadFailed && (
                <div className="rounded-lg bg-[#161513] p-2 overflow-hidden max-h-36 flex items-center justify-center">
                  <img
                    src={effectiveImageUrl}
                    alt={`Estado original de ${realProductName}`}
                    referrerPolicy="no-referrer"
                    className="max-h-32 w-auto object-contain rounded"
                  />
                </div>
              )}

              <div className="space-y-0.5">
                <h4
                  data-testid="simulation-original-name"
                  className="text-sm font-bold text-[#F5F3EF] font-display"
                >
                  {realProductName}
                </h4>
                <div
                  data-testid="simulation-original-price"
                  className="text-base font-display font-bold text-[#A6A29A]"
                >
                  {realProductPrice}
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-[#9E9A93]">
                {report.free_critical_missions.map((m) => (
                  <li key={m.id} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FF5500] shrink-0 mt-0.5" />
                    <span>{m.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column (7 cols): DESPUÉS */}
          <div className="lg:col-span-7 rounded-xl bg-[#1C1A17] p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-display text-[#CCFF00]">
                <span className="font-bold">DESPUÉS · OPTIMIZADO CRO</span>
                <span className="text-[#9E9A93]">{platform}</span>
              </div>

              <h4
                data-testid="simulation-optimized-title"
                className="text-base font-bold text-[#F5F3EF] font-display leading-snug"
              >
                {report.pro_ai_copywriting_pack.optimized_product_title}
              </h4>

              <div
                data-testid="simulation-optimized-price"
                className="text-xl font-bold font-display text-[#FF5500]"
              >
                {realProductPrice}
              </div>

              <ul className="space-y-1.5 text-xs text-[#D6D3CD]">
                {report.pro_ai_copywriting_pack.optimized_bullet_benefits.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <div className="w-full py-2.5 px-4 rounded-lg bg-[#FF5500] text-[#0C0B0A] font-bold font-display text-xs text-center flex items-center justify-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>{report.pro_ai_copywriting_pack.optimized_cta_button_text}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[11px] text-[#9E9A93] text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />
                <span>{report.pro_ai_copywriting_pack.trust_guarantee_microcopy}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
