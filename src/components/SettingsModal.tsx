import React, { useState, useEffect } from 'react';
import { Settings, X, Check, Key, ShieldCheck, AlertTriangle, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCopywriting: () => void;
  screenMode: 'scanner' | 'report';
  onToggleScreenMode: () => void;
}

export const LOCAL_STORAGE_GEMINI_KEY = 'ellik_custom_gemini_key';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenCopywriting,
  screenMode,
  onToggleScreenMode,
}) => {
  const [serverStatus, setServerStatus] = useState<{
    loading: boolean;
    hasKey?: boolean;
    error?: string;
  }>({ loading: true });

  const [inputKey, setInputKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load custom key from localStorage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_GEMINI_KEY);
      if (stored) {
        setSavedKey(stored);
        setInputKey(stored);
      }
    } catch {
      // localStorage not accessible
    }

    // Ping server diagnostics
    const checkServer = async () => {
      setServerStatus({ loading: true });
      try {
        const endpoint =
          typeof window !== 'undefined' &&
          window.location.hostname === 'localhost' &&
          window.location.port &&
          window.location.port !== '3000'
            ? 'http://localhost:3000/api/audit'
            : '/api/audit';

        const res = await fetch(endpoint, { method: 'GET' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setServerStatus({
          loading: false,
          hasKey: Boolean(data?.hasGeminiKey),
        });
      } catch (err) {
        setServerStatus({
          loading: false,
          hasKey: false,
          error: err instanceof Error ? err.message : 'No se pudo conectar',
        });
      }
    };

    checkServer();
  }, [isOpen]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputKey.trim();
    if (!clean) {
      handleRemoveKey();
      return;
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_GEMINI_KEY, clean);
      setSavedKey(clean);
      setFeedbackMessage('Clave guardada exitosamente en tu navegador.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      setFeedbackMessage('No se pudo guardar la clave en localStorage.');
    }
  };

  const handleRemoveKey = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_GEMINI_KEY);
      setSavedKey(null);
      setInputKey('');
      setFeedbackMessage('Clave eliminada del navegador.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-modal p-6 sm:p-7 space-y-6 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.14]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-white">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 id="settings-modal-title" className="text-base font-bold font-display text-white">
                Ajustes de Motor &amp; Gemini
              </h3>
              <p className="text-[11px] text-white/70">
                Diagnóstico de Serverless y respaldo de auditoría
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/[0.10] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Server Status Section */}
        <div className="p-4 rounded-2xl glass-card space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Servidor Vercel Serverless:</span>
            {serverStatus.loading ? (
              <span className="text-white/80 font-mono">Verificando...</span>
            ) : serverStatus.hasKey ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#38BDF8]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GEMINI_API_KEY activa</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#FFB4A2]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Sin clave en variables de Vercel</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/70">Modelo preferido:</span>
            <span className="font-display font-semibold text-[#38BDF8]">
              gemini-2.5-flash (REST directo)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/70">Temperatura CRO:</span>
            <span className="font-display font-semibold text-white">0.3</span>
          </div>
        </div>

        {/* Local Storage API Key (Direct Browser Fallback) */}
        <form onSubmit={handleSaveKey} className="space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor="custom-gemini-key-input"
              className="text-xs font-semibold text-white font-display flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Tu Gemini API Key (Respaldo en navegador)</span>
              </span>
              {savedKey && (
                <span className="text-[10px] text-[#38BDF8] font-normal flex items-center gap-1">
                  <Check className="w-3 h-3" /> Clave guardada
                </span>
              )}
            </label>
            <p className="text-[11px] text-white/70 leading-relaxed">
              Si el servidor de Vercel no tiene la clave en sus variables de entorno, tu navegador
              usará automáticamente esta clave como respaldo directo sin interrumpir el análisis.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              id="custom-gemini-key-input"
              type="password"
              autoComplete="off"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Pega aquí tu clave: AIzaSy... o AQ...."
              className="flex-1 px-3.5 py-2.5 rounded-2xl glass-input text-xs text-white placeholder:text-white/40 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-[#FF6A1F] hover:from-[#FF6A1F] hover:to-[#FF7A30] text-white text-xs font-bold font-display transition-colors cursor-pointer shrink-0 shadow-[0_4px_16px_rgba(255,85,0,0.35)] border border-white/20"
            >
              Guardar
            </button>
            {savedKey && (
              <button
                type="button"
                onClick={handleRemoveKey}
                title="Eliminar clave guardada"
                className="p-2.5 rounded-2xl glass-button-ghost text-white/70 hover:text-[#FF5500] transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {feedbackMessage && (
            <p className="text-[11px] text-[#38BDF8] font-medium pt-1">{feedbackMessage}</p>
          )}
        </form>

        {/* Quick Nav Actions */}
        <div className="pt-2 border-t border-white/[0.14] space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCopywriting();
            }}
            className="w-full py-2.5 px-3.5 rounded-2xl glass-card-interactive text-xs font-semibold font-display text-white/90 hover:text-white transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>Ver Pack de Copywriting IA &amp; JSON</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onToggleScreenMode();
            }}
            className="w-full py-2.5 px-3.5 rounded-2xl glass-card-interactive text-xs font-semibold font-display text-white/90 hover:text-white transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>Cambiar a {screenMode === 'report' ? 'Modo Escáner' : 'Modo Reporte'}</span>
            <span>→</span>
          </button>
        </div>

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl glass-button-ghost text-white/90 hover:text-white text-xs font-semibold font-display transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
