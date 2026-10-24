import React, { useState } from 'react';
import {
  Copy,
  Check,
  Lock,
  Unlock,
} from 'lucide-react';
import { StoreAuditReport } from '../utils/auditEngine';

interface CopywritingAndJsonPanelProps {
  report: StoreAuditReport;
  proUnlocked: boolean;
  onToggleProUnlock: () => void;
}

export const CopywritingAndJsonPanel: React.FC<CopywritingAndJsonPanelProps> = ({
  report,
  proUnlocked,
  onToggleProUnlock,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const pack = report.pro_ai_copywriting_pack;

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <section
      id="copywriting-pack-section"
      aria-labelledby="copy-pack-heading"
      className="glass-panel rounded-2xl p-6 sm:p-8 space-y-7"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#CCFF00] font-bold font-display tracking-wide px-2.5 py-0.5 rounded-full glass-pill w-fit">
            PSICOLOGÍA DE VENTAS · TEXTOS LISTOS PARA TU TIENDA
          </div>
          <h2
            id="copy-pack-heading"
            className="text-xl sm:text-2xl font-bold text-[#F5F3EF] font-display mt-1.5"
          >
            Pack de Copywriting de Alta Conversión
          </h2>
        </div>

        <button
          type="button"
          onClick={onToggleProUnlock}
          className={`px-4 py-2 text-xs font-bold font-display rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            proUnlocked
              ? 'glass-button-ghost text-[#C7C3BC] hover:text-[#F5F3EF]'
              : 'bg-[#FF5500] text-[#0C0B0A] hover:bg-[#FF6A1F] shadow-[0_4px_16px_rgba(255,85,0,0.3)]'
          }`}
        >
          {proUnlocked ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Bloquear Pack Copywriting</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5" />
              <span>Desbloquear Pack Copywriting Pro</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* FREE SAMPLE: Optimized Product Title */}
        <div className="p-6 rounded-2xl glass-card space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-display">
              <span className="text-[#CCFF00] font-bold">MUESTRA GRATUITA</span>
              <span aria-hidden="true" className="text-[#57534E]">·</span>
              <span className="text-[#9E9A93]">
                Título H1 de Alta Conversión Listo para Copiar
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('title', pack.optimized_product_title)}
              className="px-3 py-1.5 text-xs font-semibold text-[#F5F3EF] glass-button-ghost rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedKey === 'title' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Título</span>
                </>
              )}
            </button>
          </div>
          <p
            data-testid="copywriting-free-title"
            className="text-lg sm:text-xl font-bold text-[#F5F3EF] font-display leading-snug"
          >
            {pack.optimized_product_title}
          </p>
        </div>

        {/* PRO LOCKED ZONE */}
        <div className="relative rounded-2xl">
          <div
            data-testid="copywriting-pro-content"
            aria-hidden={!proUnlocked}
            className={`space-y-5 transition-all ${
              !proUnlocked
                ? 'blur-sm select-none pointer-events-none opacity-40'
                : ''
            }`}
          >
            {/* 3 Bullet Benefits */}
            <div className="p-6 rounded-2xl glass-card space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold font-display text-[#9E9A93] tracking-wide">
                  3 VIÑETAS DE BENEFICIOS · TRANSFORMACIÓN, OBJECIÓN Y RAPIDEZ
                </span>
                <button
                  type="button"
                  disabled={!proUnlocked}
                  onClick={() =>
                    handleCopy(
                      'bullets',
                      pack.optimized_bullet_benefits.map((b) => `• ${b}`).join('\n')
                    )
                  }
                  className="px-3 py-1.5 text-xs font-semibold text-[#F5F3EF] glass-button-ghost rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedKey === 'bullets' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar 3 Beneficios</span>
                    </>
                  )}
                </button>
              </div>

              <ul className="space-y-3">
                {pack.optimized_bullet_benefits.map((benefit, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-[#D6D3CD] leading-relaxed"
                  >
                    <span className="font-display text-xs font-bold text-[#CCFF00] mt-0.5 shrink-0">
                      0{idx + 1}
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button Text & Trust Guarantee Microcopy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl glass-card space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold font-display text-[#9E9A93]">
                    TEXTO PARA EL BOTÓN DE COMPRA (CTA)
                  </span>
                  <button
                    type="button"
                    disabled={!proUnlocked}
                    onClick={() => handleCopy('cta', pack.optimized_cta_button_text)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#F5F3EF] glass-button-ghost rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copiedKey === 'cta' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar CTA</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="py-3 px-4 rounded-xl bg-[#FF5500] text-[#0C0B0A] font-bold font-display text-sm text-center shadow-[0_4px_16px_rgba(255,85,0,0.35)]">
                  {pack.optimized_cta_button_text}
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-card space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold font-display text-[#9E9A93]">
                    MICROCOPY DE GARANTÍA BAJO EL BOTÓN
                  </span>
                  <button
                    type="button"
                    disabled={!proUnlocked}
                    onClick={() => handleCopy('trust', pack.trust_guarantee_microcopy)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#F5F3EF] glass-button-ghost rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copiedKey === 'trust' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Garantía</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-[#D6D3CD] font-medium pt-1 leading-relaxed">
                  {pack.trust_guarantee_microcopy}
                </p>
              </div>
            </div>
          </div>

          {/* Lock Overlay when proUnlocked === false */}
          {!proUnlocked && (
            <div
              data-testid="copywriting-pro-lock-overlay"
              className="absolute inset-0 flex items-center justify-center p-4 backdrop-blur-[2px]"
            >
              <div className="max-w-md w-full glass-modal rounded-2xl p-7 text-center space-y-4">
                <div className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#FF5500] flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#F5F3EF] font-display">
                  Desbloquea los 3 Bullets Persuasivos, el Botón CTA y el Microcopy de Garantía
                </h3>
                <p className="text-xs text-[#A6A29A] leading-relaxed">
                  Reescrito a medida para <strong className="text-[#F5F3EF]">{report.detected_product_name}</strong> resolviendo objeciones reales de compra.
                </p>
                <button
                  type="button"
                  onClick={onToggleProUnlock}
                  className="w-full py-3 px-4 text-xs font-bold font-display bg-[#FF5500] text-[#0C0B0A] rounded-xl hover:bg-[#FF6A1F] transition-colors cursor-pointer shadow-[0_6px_20px_rgba(255,85,0,0.35)]"
                >
                  Desbloquear Pack Copywriting Pro Ahora
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
