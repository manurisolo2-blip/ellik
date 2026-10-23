import React, { useState, useRef } from 'react';
import {
  Upload,
  Globe,
  FileText,
  ArrowRight,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import {
  EcommercePlatform,
  StoreAuditReport,
} from '../utils/auditEngine';

interface AuditScannerFormProps {
  defaultPlatform: EcommercePlatform;
  onAuditCompleted: (
    report: StoreAuditReport,
    meta: {
      platform: EcommercePlatform;
      storeUrl: string;
      productCopy: string;
      uploadedImageUrl: string | null;
    }
  ) => void;
}

const PLATFORMS: EcommercePlatform[] = [
  'Shopify',
  'Tiendanube',
  'WooCommerce',
  'MercadoLibre',
];

export const AuditScannerForm: React.FC<AuditScannerFormProps> = ({
  defaultPlatform,
  onAuditCompleted,
}) => {
  const [platform, setPlatform] = useState<EcommercePlatform>(defaultPlatform);
  const [storeUrl, setStoreUrl] = useState('');
  const [productCopy, setProductCopy] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValidationError(null);
    setImageMimeType(file.type || 'image/png');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview && !storeUrl.trim() && !productCopy.trim()) {
      setValidationError(
        'Sube una captura de pantalla de tu página de producto o pega la URL de tu tienda para iniciar la auditoría.'
      );
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      const primaryEndpoint =
        typeof window !== 'undefined' &&
        window.location.hostname === 'localhost' &&
        window.location.port &&
        window.location.port !== '3000'
          ? 'http://localhost:3000/api/audit'
          : '/api/audit';

      let response = await fetch(primaryEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          storeUrl: storeUrl.trim(),
          productCopy: productCopy.trim(),
          imageBase64: imagePreview,
          mimeType: imageMimeType,
        }),
      });

      // Fallback if relative /api/audit returned 404 in dev
      if (
        !response.ok &&
        response.status === 404 &&
        primaryEndpoint === '/api/audit' &&
        typeof window !== 'undefined' &&
        window.location.hostname === 'localhost'
      ) {
        response = await fetch('http://localhost:3000/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform,
            storeUrl: storeUrl.trim(),
            productCopy: productCopy.trim(),
            imageBase64: imagePreview,
            mimeType: imageMimeType,
          }),
        });
      }

      if (!response.ok) {
        const errPayload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(
          errPayload?.error || `Error del servidor al procesar la auditoría (${response.status})`
        );
      }

      const report = (await response.json()) as StoreAuditReport;
      onAuditCompleted(report, {
        platform,
        storeUrl: storeUrl.trim(),
        productCopy: productCopy.trim(),
        uploadedImageUrl: imagePreview || report.captured_image_url || null,
      });
    } catch (err) {
      setValidationError(
        err instanceof Error
          ? err.message
          : 'Error inesperado al auditar la página.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#141312] border border-[#221F1C] rounded-2xl p-6 sm:p-9 space-y-8 w-full">
      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Platform Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#F5F3EF] font-display tracking-tight">
              Motor de E-Commerce
            </label>
            <p className="text-xs text-[#9E9A93]">
              Ajustamos las heurísticas visuales de checkout y jerarquía según tu plataforma
            </p>
          </div>
          <div
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0C0B0A] rounded-xl w-fit"
            role="group"
            aria-label="Seleccionar plataforma de e-commerce"
          >
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  platform === p
                    ? 'bg-[#FF5500] text-[#0C0B0A]'
                    : 'text-[#A6A29A] hover:text-[#F5F3EF]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Main Input Grid: Upload Screenshot OR Paste Store URL (No vertical divider line) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left: Screenshot Dropzone */}
          <div className="lg:col-span-6 flex flex-col">
            <label
              htmlFor="screenshot-upload-input"
              className="block text-sm font-semibold text-[#F5F3EF] font-display tracking-tight mb-2.5"
            >
              Captura de pantalla del producto
            </label>
            <input
              ref={fileInputRef}
              id="screenshot-upload-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />

            {imagePreview ? (
              <div className="relative flex-1 min-h-[220px] rounded-xl bg-[#0C0B0A] p-5 flex flex-col items-center justify-center gap-3.5">
                <img
                  src={imagePreview}
                  alt="Vista previa de captura cargada"
                  referrerPolicy="no-referrer"
                  className="max-h-44 w-auto object-contain rounded-lg"
                />
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[#CCFF00] font-semibold inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Captura lista para inspección de píxeles</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[#FF5500] hover:underline font-medium cursor-pointer"
                  >
                    Cambiar imagen
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-h-[220px] rounded-xl bg-[#0C0B0A] hover:bg-[#11100E] p-7 flex flex-col items-center justify-center gap-3 text-center transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-[#161513] group-hover:bg-[#1E1C19] flex items-center justify-center text-[#FF5500] transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-[#F5F3EF]">
                  Subir captura de página de producto (PNG, JPG, WebP)
                </span>
                <span className="text-xs text-[#9E9A93] max-w-sm leading-relaxed">
                  Localizamos las coordenadas exactas del botón de compra, precio, galería y fugas de confianza
                </span>
              </button>
            )}
          </div>

          {/* Right: Store URL & Optional Copy */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
            <div>
              <label
                htmlFor="store-url-input"
                className="block text-sm font-semibold text-[#F5F3EF] font-display tracking-tight mb-1.5"
              >
                URL directa del producto
              </label>
              <p className="text-xs text-[#9E9A93] mb-2.5">
                Si no subes una imagen, extraemos automáticamente la vista, título y precio desde tu enlace
              </p>
              <div className="relative">
                <Globe className="w-4 h-4 text-[#78746D] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="store-url-input"
                  type="url"
                  value={storeUrl}
                  onChange={(e) => {
                    setStoreUrl(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="https://mitienda.com/products/mi-producto"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-[#0C0B0A] rounded-xl text-[#F5F3EF] placeholder:text-[#66625B] focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="product-copy-input"
                className="block text-xs font-semibold text-[#C7C3BC] mb-2"
              >
                Descripción o contexto adicional del producto (Opcional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#78746D] absolute left-4 top-3.5" />
                <textarea
                  id="product-copy-input"
                  rows={3}
                  value={productCopy}
                  onChange={(e) => {
                    setProductCopy(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Pega aquí la descripción actual, precio o detalles sobre tu embudo..."
                  className="w-full pl-11 pr-4 py-3 text-sm bg-[#0C0B0A] rounded-xl text-[#F5F3EF] placeholder:text-[#66625B] focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
                />
              </div>
            </div>
          </div>
        </div>

        {validationError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-[#261310] text-xs text-[#FFB4A2] flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-[#FF5500] shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 text-sm font-bold bg-[#FF5500] text-[#0C0B0A] rounded-xl hover:bg-[#FF6A1F] disabled:opacity-60 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Inspeccionando píxeles y jerarquía de conversión...</span>
              </>
            ) : (
              <>
                <span>Analizar Página de Producto Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
