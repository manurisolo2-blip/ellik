/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  RefreshCw,
  ArrowLeft,
  RotateCcw,
  Settings,
  X,
  Cpu,
  Sliders,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import {
  PRESET_STORE_CASES,
  PresetStoreCase,
  StoreAuditReport,
  calculateLevelUpState,
  EcommercePlatform,
} from './utils/auditEngine';
import {
  ProductScreenshotInspector,
  generatePresetCanvasBase64,
} from './components/ProductScreenshotInspector';
import { MissionListSection } from './components/MissionListSection';
import { CopywritingAndJsonPanel } from './components/CopywritingAndJsonPanel';
import { AuditScannerForm } from './components/AuditScannerForm';

/**
 * 240° Precision Arc Gauge with crisp matte styling (Zero artificial blur or neon glows).
 */
const ConversionArcGauge: React.FC<{
  score: number;
  rankTitle: string;
  lostSalesPercentage: string;
}> = ({ score, rankTitle, lostSalesPercentage }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const cx = 110;
  const cy = 104;
  const r = 72;

  // 240-degree arc from 150° (bottom-left) to 390° (bottom-right)
  const startAngle = 150;
  const totalSweep = 240;
  const endAngle = startAngle + totalSweep;
  const activeAngle = startAngle + (clamped / 100) * totalSweep;

  const polarToCartesian = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArc = (fromDeg: number, toDeg: number, radius: number) => {
    const start = polarToCartesian(fromDeg, radius);
    const end = polarToCartesian(toDeg, radius);
    const sweep = toDeg - fromDeg;
    const largeArcFlag = sweep > 180 ? 1 : 0;
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  };

  // Generate 29 crisp radial ticks around the outer perimeter
  const ticks = Array.from({ length: 29 }, (_, idx) => {
    const deg = startAngle + (idx / 28) * totalSweep;
    const isActiveTick = deg <= activeAngle;
    const inner = polarToCartesian(deg, r + 9);
    const outer = polarToCartesian(deg, r + (idx % 4 === 0 ? 15 : 12));
    return { inner, outer, isActiveTick };
  });

  const formattedLostSales = lostSalesPercentage.startsWith('-')
    ? lostSalesPercentage
    : `-${lostSalesPercentage}`;

  return (
    <div className="flex flex-col items-center select-none w-full">
      <h2 className="text-sm font-semibold font-display text-[#E6E2DC] tracking-tight mb-1">
        Score de Conversión
      </h2>

      <div className="relative flex flex-col items-center justify-center w-full">
        <svg
          viewBox="0 0 220 176"
          className="w-full max-w-[280px] h-auto overflow-visible mx-auto"
          aria-label={`Score de Conversión ${clamped} sobre 100`}
        >
          {/* Outer crisp radial tick marks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.inner.x}
              y1={t.inner.y}
              x2={t.outer.x}
              y2={t.outer.y}
              stroke={t.isActiveTick ? '#FF5500' : '#221F1C'}
              strokeWidth={i % 4 === 0 ? '1.5' : '1'}
            />
          ))}

          {/* Inner thin decorative hairline ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r - 12}
            fill="none"
            stroke="#1D1A18"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Background matte track arc */}
          <path
            d={describeArc(startAngle, endAngle, r)}
            fill="none"
            stroke="#1E1C1A"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Active Cinema Orange progress arc (crisp solid, no fuzzy glow) */}
          {clamped > 0 && (
            <path
              d={describeArc(startAngle, Math.max(startAngle + 2, activeAngle), r)}
              fill="none"
              stroke="#FF5500"
              strokeWidth="8"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Center Numerical Readout & Rank Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 pointer-events-none">
          <div className="flex items-baseline font-display tracking-tight">
            <span
              data-testid="overall-score-value"
              className="text-[40px] leading-none font-bold text-[#FF5500]"
            >
              {clamped}
            </span>
            <span className="text-2xl leading-none font-bold text-[#F5F3EF]">
              /100
            </span>
          </div>

          <span
            data-testid="rank-title-value"
            className="mt-3 text-xs font-semibold font-display text-[#FF661A] tracking-wide"
          >
            {rankTitle}
          </span>
        </div>
      </div>

      {/* Estimated Lost Sales caption */}
      <div className="-mt-1 text-xs text-[#B8B3AA] font-sans text-center">
        <span>Fuga de ventas estimada: </span>
        <span
          data-testid="lost-sales-value"
          className="font-semibold text-[#F5F3EF] font-display"
        >
          {formattedLostSales}
        </span>
      </div>
    </div>
  );
};

/**
 * Dual-Curve Conversion Projection Line Chart with razor-sharp vector lines (No fuzzy glow).
 */
const ConversionProjectionChart: React.FC<{
  baseScore: number;
  projectedScore: number;
}> = ({ baseScore, projectedScore }) => {
  const boostRatio = Math.max(0, Math.min(1, (projectedScore - baseScore) / 36));
  const endY = Math.round(24 - boostRatio * 12);

  const orangeCurve = `M 16 94 C 68 90, 108 64, 154 44 C 184 31, 206 ${endY + 6}, 226 ${endY}`;
  const baselineCurve = `M 16 98 C 72 95, 118 82, 166 64 C 194 53, 212 44, 226 38`;

  return (
    <div className="pt-1 flex flex-col items-center w-full">
      <svg
        viewBox="0 0 240 114"
        className="w-full max-w-[320px] h-auto overflow-visible mx-auto"
        aria-label="Gráfico de Proyección de Conversión"
      >
        {/* 4 Subtle Horizontal Hairline Grid Lines */}
        {[24, 50, 76, 102].map((y) => (
          <line
            key={y}
            x1="14"
            y1={y}
            x2="228"
            y2={y}
            stroke="#1D1A18"
            strokeWidth="1"
          />
        ))}

        {/* Secondary baseline comparison curve */}
        <path
          d={baselineCurve}
          fill="none"
          stroke="#383028"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Primary Cinema Orange trajectory curve */}
        <path
          d={orangeCurve}
          fill="none"
          stroke="#FF5500"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <div className="mt-1 text-xs font-semibold font-display text-[#C7C3BC] text-center">
        Proyección de Conversión
      </div>
    </div>
  );
};

/**
 * 5-Axis Radar / Pentagon Chart with crisp matte geometry and subtle tint.
 */
const SubScoresRadarPentagon: React.FC<{
  visual: number;
  cta: number;
  copy: number;
  trust: number;
  bonusPoints: number;
}> = ({ visual, cta, copy, trust, bonusPoints }) => {
  const cx = 120;
  const cy = 104;
  const maxR = 66;

  const clampVal = (v: number) => Math.max(20, Math.min(99, Math.round(v + bonusPoints * 0.6)));
  const precioUxBase = Math.round((visual + trust) / 2);

  // 5 vertices ordered clockwise starting from top (-90°)
  const axes = [
    { label: 'Visual', angleDeg: -90, value: clampVal(visual), labelOffset: { dx: 0, dy: -12 } },
    { label: 'CTA', angleDeg: -18, value: clampVal(cta), labelOffset: { dx: 18, dy: 3 } },
    { label: 'Copy', angleDeg: 54, value: clampVal(copy), labelOffset: { dx: 16, dy: 14 } },
    { label: 'Precio/UX', angleDeg: 126, value: clampVal(precioUxBase), labelOffset: { dx: -18, dy: 14 } },
    { label: 'Trust', angleDeg: 198, value: clampVal(trust), labelOffset: { dx: -20, dy: 3 } },
  ];

  const getPoint = (angleDeg: number, ratio: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + maxR * ratio * Math.cos(rad),
      y: cy + maxR * ratio * Math.sin(rad),
    };
  };

  const buildPolygonPoints = (ratio: number) =>
    axes
      .map((a) => {
        const pt = getPoint(a.angleDeg, ratio);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ');

  const dataPoints = axes.map((a) => getPoint(a.angleDeg, a.value / 100));
  const dataPolygonString = dataPoints
    .map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
    .join(' ');

  return (
    <div className="pt-1 flex flex-col items-center select-none w-full">
      <svg
        viewBox="0 0 240 202"
        className="w-full max-w-[300px] h-auto overflow-visible mx-auto"
        aria-label="Radar de 5 ejes: Visual, CTA, Copy, Trust y Precio/UX"
      >
        {/* 4 Concentric Pentagon Rings */}
        {[0.25, 0.5, 0.75, 1].map((level) => (
          <polygon
            key={level}
            points={buildPolygonPoints(level)}
            fill="none"
            stroke="#1E1C1A"
            strokeWidth="1"
          />
        ))}

        {/* 5 Radiating Axis Spokes */}
        {axes.map((a) => {
          const outer = getPoint(a.angleDeg, 1);
          return (
            <line
              key={a.label}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="#1E1C1A"
              strokeWidth="1"
            />
          );
        })}

        {/* Active Translucent Orange Polygon */}
        <polygon
          points={dataPolygonString}
          fill="rgba(255, 85, 0, 0.08)"
          stroke="#FF5500"
          strokeWidth="1.5"
        />

        {/* Precision Solid Vertex Dots */}
        {dataPoints.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r="2.5"
            fill="#FF5500"
            stroke="#0C0B0A"
            strokeWidth="1"
          />
        ))}

        {/* Axis Labels */}
        {axes.map((a) => {
          const outer = getPoint(a.angleDeg, 1);
          return (
            <text
              key={a.label}
              x={outer.x + a.labelOffset.dx}
              y={outer.y + a.labelOffset.dy}
              textAnchor="middle"
              fill="#A8A39B"
              fontSize="11"
              fontWeight="500"
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              {a.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default function App() {
  const initialMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('mode') === 'report'
      ? 'report'
      : 'scanner';

  const [screenMode, setScreenMode] = useState<'scanner' | 'report'>('scanner');
  const [isCustomAudit, setIsCustomAudit] = useState<boolean>(false);
  const [activePlatform, setActivePlatform] = useState<EcommercePlatform>('Shopify');
  const [activeStoreUrl, setActiveStoreUrl] = useState<string>(
    PRESET_STORE_CASES[0].url
  );
  const [activeRawCopy, setActiveRawCopy] = useState<string>(
    PRESET_STORE_CASES[0].rawCopyExcerpt
  );
  const [selectedPreset, setSelectedPreset] = useState<PresetStoreCase | undefined>(
    PRESET_STORE_CASES[0]
  );
  const [report, setReport] = useState<StoreAuditReport>(
    PRESET_STORE_CASES[0].report
  );
  const [completedMissionIds, setCompletedMissionIds] = useState<number[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(1);
  const [proUnlocked, setProUnlocked] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isRunningLiveAi, setIsRunningLiveAi] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showCopywritingDrawer, setShowCopywritingDrawer] = useState<boolean>(false);

  const levelUp = calculateLevelUpState(report, completedMissionIds);

  const handleLoadPresetDemo = (preset: PresetStoreCase) => {
    setIsCustomAudit(false);
    setSelectedPreset(preset);
    setActivePlatform(preset.platform);
    setActiveStoreUrl(preset.url);
    setActiveRawCopy(preset.rawCopyExcerpt);
    setReport(preset.report);
    setCompletedMissionIds([]);
    setSelectedMissionId(1);
    setUploadedImageUrl(null);
    setScreenMode('report');
  };

  const handleCustomAuditCompleted = (
    customReport: StoreAuditReport,
    meta: {
      platform: EcommercePlatform;
      storeUrl: string;
      productCopy: string;
      uploadedImageUrl: string | null;
    }
  ) => {
    setIsCustomAudit(true);
    setSelectedPreset(undefined);
    setActivePlatform(meta.platform);
    setActiveStoreUrl(meta.storeUrl);
    setActiveRawCopy(meta.productCopy);
    setReport(customReport);
    setUploadedImageUrl(meta.uploadedImageUrl || customReport.captured_image_url || null);
    setCompletedMissionIds([]);
    setSelectedMissionId(1);
    setScreenMode('report');
  };

  const handleToggleMissionComplete = (missionId: number) => {
    setCompletedMissionIds((prev) =>
      prev.includes(missionId)
        ? prev.filter((id) => id !== missionId)
        : [...prev, missionId]
    );
  };

  const handleReauditCurrentWithAi = async () => {
    setIsRunningLiveAi(true);
    try {
      const base64Png =
        uploadedImageUrl ||
        report.captured_image_url ||
        (selectedPreset ? generatePresetCanvasBase64(selectedPreset) : '');
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: activePlatform,
          storeUrl: activeStoreUrl,
          productCopy: activeRawCopy,
          presetId: isCustomAudit ? '' : selectedPreset?.id || '',
          imageBase64: base64Png.startsWith('data:') ? base64Png : '',
          mimeType: 'image/png',
        }),
      });
      if (res.ok) {
        const freshReport = (await res.json()) as StoreAuditReport;
        setReport(freshReport);
        if (!uploadedImageUrl && freshReport.captured_image_url) {
          setUploadedImageUrl(freshReport.captured_image_url);
        }
        setCompletedMissionIds([]);
      }
    } finally {
      setIsRunningLiveAi(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0B0A] text-[#F5F3EF] flex flex-col relative selection:bg-[#FF5500] selection:text-[#0C0B0A] w-full">
      {/* Subtle analog film grain overlay (3.8% opacity) */}
      <div className="ellik-film-grain" aria-hidden="true" />

      {/* TOP NAVIGATION BAR — Full screen width with "ellik." and Cog Wheel "Ajustes" */}
      <header className="sticky top-0 z-30 bg-[#0C0B0A]/95 backdrop-blur-md border-b border-[#1A1816] w-full">
        <div className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setScreenMode(screenMode === 'report' ? 'scanner' : 'report');
            }}
            className="text-2xl font-bold tracking-tight text-[#F5F3EF] font-display whitespace-nowrap shrink-0"
          >
            ellik<span className="text-[#CCFF00]">.</span>
          </a>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Bell Notification Button */}
            <button
              type="button"
              onClick={handleReauditCurrentWithAi}
              disabled={isRunningLiveAi}
              title="Notificaciones y estado de motor Gemini Vision"
              aria-label="Notificaciones"
              className="p-2 rounded-lg bg-[#141312] hover:bg-[#1A1816] border border-[#221F1C] hover:border-[#332E29] text-[#A6A29A] hover:text-[#F5F3EF] transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Ajustes Button with Gear / Nut Wheel ("ruedita estilo tuerca") */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              aria-label="Ajustes de auditoría y configuración"
              className="px-3.5 py-2 rounded-lg bg-[#141312] hover:bg-[#1A1816] border border-[#221F1C] hover:border-[#38332E] text-xs font-medium text-[#D8D3CA] hover:text-[#F5F3EF] transition-colors flex items-center gap-2 cursor-pointer group"
            >
              <Settings className="w-4 h-4 text-[#A6A29A] group-hover:text-[#FF5500] transition-transform duration-500 group-hover:rotate-90 shrink-0" />
              <span>Ajustes</span>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal (Clean, technical slide-over dialog) */}
      {showSettingsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-[#121110] border border-[#26221E] p-6 space-y-6 text-[#F5F3EF] shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1C1A]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#181614] border border-[#2C2722] flex items-center justify-center text-[#FF5500]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="settings-modal-title" className="text-base font-bold font-display">
                    Ajustes de Auditoría
                  </h3>
                  <p className="text-[11px] text-[#8C8881]">
                    Motor StoreLevelUp &amp; Gemini 2.5 Flash Vision
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-lg text-[#8C8881] hover:text-[#F5F3EF] hover:bg-[#1A1816] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Technical Specs & Status */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#171513] border border-[#24201C] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#8C8881]">Modelo de IA:</span>
                  <span className="font-display font-semibold text-[#FF5500]">
                    gemini-2.5-flash (Vision Multimodal)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8C8881]">Temperatura analítica:</span>
                  <span className="font-display font-semibold text-[#F5F3EF]">0.3 (Precisión CRO)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8C8881]">Detección de coordenadas:</span>
                  <span className="font-display font-semibold text-[#CCFF00]">
                    Activa (x%, y% en píxeles)
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    setShowCopywritingDrawer(true);
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#181614] hover:bg-[#201D1A] border border-[#26221E] text-xs font-semibold font-display text-[#D8D3CA] hover:text-[#F5F3EF] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#FF5500]" />
                    <span>Ver Pack de Copywriting IA &amp; JSON</span>
                  </span>
                  <span>→</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    setScreenMode(screenMode === 'report' ? 'scanner' : 'report');
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#181614] hover:bg-[#201D1A] border border-[#26221E] text-xs font-semibold font-display text-[#D8D3CA] hover:text-[#F5F3EF] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#CCFF00]" />
                    <span>
                      Cambiar a {screenMode === 'report' ? 'Modo Escáner' : 'Modo Reporte'}
                    </span>
                  </span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF661A] text-[#0C0B0A] text-xs font-bold font-display transition-colors cursor-pointer"
              >
                Cerrar Ajustes
              </button>
            </div>
          </div>
        </div>
      )}

      {screenMode === 'scanner' ? (
        /* SCREEN 1: MODO ESCÁNER — Landing Page Principal */
        <main
          id="top"
          data-testid="scanner-screen"
          className="flex-1 w-full max-w-[1160px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs font-bold font-display text-[#FF5500] tracking-wider uppercase">
              Auditoría Visual de Conversión · Shopify · Tiendanube · WooCommerce · MercadoLibre
            </div>
            <button
              type="button"
              onClick={() => setScreenMode('report')}
              className="px-3.5 py-1.5 rounded-lg bg-[#141312] border border-[#221F1C] text-xs font-medium text-[#E6E2DC] hover:border-[#FF5500] transition-colors cursor-pointer"
            >
              Ir a Modo Reporte →
            </button>
          </div>

          <div id="escaner-principal" className="space-y-3 max-w-4xl">
            <h1 className="text-3xl sm:text-5xl font-bold text-[#F5F3EF] font-display tracking-tight leading-[1.08]">
              Detecta por qué tu tienda pierde ventas y corrígelo en 5 minutos.
            </h1>
            <p className="text-sm sm:text-base text-[#A6A29A] leading-relaxed pt-1">
              Sube una captura de tu página de producto o pega su URL. Inspeccionamos píxel por píxel la jerarquía del botón de compra, el precio, las garantías y reescribimos tu copywriting.
            </p>
          </div>

          <AuditScannerForm
            defaultPlatform={activePlatform}
            onAuditCompleted={handleCustomAuditCompleted}
          />

          <div
            id="ejemplos-reales"
            className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#8C8881]"
          >
            <span>Explorar diagnósticos pre-calibrados por plataforma:</span>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_STORE_CASES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadPresetDemo(preset)}
                  className="px-3.5 py-2 rounded-xl bg-[#141312] border border-[#201D1A] text-[#C7C3BC] hover:text-[#F5F3EF] hover:border-[#332E29] transition-colors font-medium whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Probar ejemplo {preset.platform}
                </button>
              ))}
            </div>
          </div>
        </main>
      ) : (
        /* SCREEN 2: MODO REPORTE — Full-width 3-Column Cockpit */
        <main
          id="top"
          data-testid="report-screen"
          className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-4 space-y-4"
        >
          {/* SUB-HEADER BAR: "← Auditar otra tienda" Left | "Modo Reporte" Center | Quick Actions Right */}
          <div className="grid grid-cols-3 items-center gap-4 pb-1">
            <div className="flex items-center justify-start">
              <button
                type="button"
                onClick={() => setScreenMode('scanner')}
                className="px-4 py-2 rounded-lg bg-[#141312] hover:bg-[#1A1816] border border-[#221F1C] text-xs font-medium text-[#E6E2DC] hover:text-[#F5F3EF] transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#B8B3AA]" />
                <span>Auditar otra tienda</span>
              </button>
            </div>

            <div className="flex items-center justify-center">
              <h1 className="text-lg sm:text-xl font-bold font-display text-[#F5F3EF] tracking-tight">
                Modo Reporte
              </h1>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <span
                data-testid="xp-counter"
                className="hidden sm:inline-flex px-2.5 py-1 rounded-md bg-[#141312] border border-[#201D1A] text-[11px] font-bold font-display text-[#CCFF00]"
              >
                +{levelUp.earnedXp} / {levelUp.totalPossibleXp} XP
              </span>

              {completedMissionIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCompletedMissionIds([])}
                  className="px-2.5 py-1.5 rounded-lg bg-[#141312] border border-[#201D1A] text-[11px] text-[#9E9A93] hover:text-[#F5F3EF] flex items-center gap-1 cursor-pointer"
                  title="Reiniciar progreso de misiones"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden md:inline">Reiniciar</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReauditCurrentWithAi}
                disabled={isRunningLiveAi}
                className="px-3 py-1.5 rounded-lg bg-[#141312] hover:bg-[#1A1816] border border-[#201D1A] text-[11px] font-medium text-[#B8B3AA] hover:text-[#F5F3EF] disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isRunningLiveAi ? 'animate-spin text-[#FF5500]' : ''}`} />
                <span className="hidden sm:inline">
                  {isRunningLiveAi ? 'Auditando...' : 'Re-analizar'}
                </span>
              </button>
            </div>
          </div>

          {/* MAIN 3-COLUMN FULL-WIDTH COCKPIT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 xl:gap-6 items-start w-full">
            {/* LEFT COLUMN (3 cols): Telemetry Card with Score Arc Gauge + Line Chart + Radar Pentagon */}
            <section
              id="diagnostico-cro"
              aria-label="Telemetría y Score de Conversión"
              className="lg:col-span-3 bg-[#121110] border border-[#1E1C19] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-6 w-full"
            >
              <ConversionArcGauge
                score={levelUp.projectedScore}
                rankTitle={levelUp.projectedRank}
                lostSalesPercentage={levelUp.projectedLostSalesPercentage}
              />

              <ConversionProjectionChart
                baseScore={report.overall_score}
                projectedScore={levelUp.projectedScore}
              />

              <SubScoresRadarPentagon
                visual={report.sub_scores.visual_clarity}
                cta={report.sub_scores.cta_power}
                copy={report.sub_scores.copywriting_persuasion}
                trust={report.sub_scores.trust_and_security}
                bonusPoints={levelUp.projectedScore - report.overall_score}
              />
            </section>

            {/* CENTER COLUMN (6 cols): Multimodal Image Inspector with Teardrop Pins */}
            <div className="lg:col-span-6 w-full">
              <ProductScreenshotInspector
                platform={activePlatform}
                storeUrl={activeStoreUrl}
                isCustomAudit={isCustomAudit}
                preset={selectedPreset}
                uploadedImageUrl={uploadedImageUrl}
                report={report}
                completedMissionIds={completedMissionIds}
                selectedMissionId={selectedMissionId}
                onSelectMission={setSelectedMissionId}
                onToggleMissionComplete={handleToggleMissionComplete}
                proUnlocked={proUnlocked}
                onUnlockPro={() => setProUnlocked(true)}
              />
            </div>

            {/* RIGHT COLUMN (3 cols): Misiones Críticas Stack */}
            <div className="lg:col-span-3 w-full">
              <MissionListSection
                freeMissions={report.free_critical_missions}
                proMissions={report.pro_locked_missions}
                completedMissionIds={completedMissionIds}
                selectedMissionId={selectedMissionId}
                proUnlocked={proUnlocked}
                onToggleMissionComplete={handleToggleMissionComplete}
                onSelectMission={setSelectedMissionId}
                onToggleProUnlock={() => setProUnlocked((prev) => !prev)}
              />
            </div>
          </div>

          {/* Expandable Secondary Copywriting & Raw JSON Panel */}
          <div className="pt-4 border-t border-[#1A1816]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="text-xs text-[#8C8881] font-display">
                Producto detectado:{' '}
                <span className="text-[#E6E2DC] font-semibold">
                  {report.detected_product_name}
                </span>{' '}
                <span className="text-[#FF5500] font-semibold">
                  ({report.detected_product_price})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowCopywritingDrawer((prev) => !prev)}
                className="text-xs font-semibold font-display text-[#9E9A93] hover:text-[#F5F3EF] transition-colors cursor-pointer"
              >
                {showCopywritingDrawer
                  ? 'Ocultar Pack de Copywriting IA ▲'
                  : 'Ver Pack de Copywriting IA & JSON ▼'}
              </button>
            </div>

            {showCopywritingDrawer && (
              <CopywritingAndJsonPanel
                report={report}
                proUnlocked={proUnlocked}
                onToggleProUnlock={() => setProUnlocked((prev) => !prev)}
              />
            )}
          </div>
        </main>
      )}

      {/* Full-width Colophon Footer */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 mt-8 border-t border-[#171513] w-full">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78746D]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F5F3EF] font-display text-sm">
              ellik<span className="text-[#CCFF00]">.</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Auditoría Visual de Conversión &amp; UI/UX para E-Commerce</span>
          </div>
          <button
            type="button"
            onClick={() => setScreenMode('scanner')}
            className="hover:text-[#F5F3EF] transition-colors cursor-pointer"
          >
            Auditar otra tienda
          </button>
        </div>
      </footer>
    </div>
  );
}
