"use client";

import {
    motion,
    useTransform,
    useReducedMotion,
    useMotionValue,
    useSpring,
    MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface TunnelItem {
    src: string;
    title: string;
    category?: string;
    onClick?: () => void;
}

const DEFAULT_IMAGES: TunnelItem[] = [
    { src: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80", title: "Sneakers Streetwear", category: "Shopify" },
    { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80", title: "Relojería Minimal", category: "Tiendanube" },
    { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", title: "Audio Pro Studio", category: "WooCommerce" },
    { src: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80", title: "Smartwatch Tech", category: "MercadoLibre" },
    { src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80", title: "Cámara Analógica", category: "Shopify" },
    { src: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80", title: "Auriculares Gamer", category: "Tiendanube" },
    { src: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80", title: "Lentes de Sol Polarizados", category: "WooCommerce" },
    { src: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80", title: "Calzado Deportivo Elite", category: "MercadoLibre" },
    { src: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80", title: "Zapatos Formales Cuero", category: "Shopify" },
];

export interface PerspectiveTunnelHeroProps {
    items?: TunnelItem[];
    badgeText?: string;
    titleFirstLine?: string;
    titleSecondLine?: string;
    description?: string;
    onExploreClick?: () => void;
    onCardSelect?: (item: TunnelItem, index: number) => void;
    className?: string;
}

interface TunnelCardData {
    item: TunnelItem;
    angleCos: number;
    angleSin: number;
    radiusFactorX: number;
    radiusFactorY: number;
    rotationZ: number;
    index: number;
}

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

interface StageDimensions {
    width: number;
    height: number;
    isMobile: boolean;
}

function useCameraParallax(enabled: boolean) {
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const x = useSpring(rawX, SPRING_CONFIG);
    const y = useSpring(rawY, SPRING_CONFIG);

    useEffect(() => {
        if (!enabled) return;
        const onMove = (e: PointerEvent) => {
            rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
            rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, [enabled, rawX, rawY]);

    return { x, y };
}

interface TunnelCardProps {
    card: TunnelCardData;
    progress: MotionValue<number>;
    pointer: { x: MotionValue<number>; y: MotionValue<number> };
    total: number;
    stage: StageDimensions;
    onCardSelect?: (item: TunnelItem, index: number) => void;
}

function TunnelCard({ card, progress, pointer, total, stage, onCardSelect }: TunnelCardProps) {
    const staggerSpan = 0.55;
    const start = (card.index / total) * (1 - staggerSpan);
    const end = start + staggerSpan;

    const localProgress = useTransform(progress, [start, end], [0, 1]);

    const farZ = stage.isMobile ? -1200 : -1700;
    const nearZ = stage.isMobile ? 350 : 500;
    const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

    const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

    const cardWidth = stage.isMobile
        ? Math.max(130, Math.min(180, stage.width * 0.38))
        : Math.max(180, Math.min(270, stage.width * 0.18));

    const baseX = card.angleCos * (stage.width * card.radiusFactorX);
    const baseY = card.angleSin * (stage.height * card.radiusFactorY);
    const panStrength = stage.isMobile ? 20 : 45;

    const transform = useTransform(
        [z, pointer.x, pointer.y],
        (values: any[]) => {
            const currZ = values[0] as number;
            const px = values[1] as number;
            const py = values[2] as number;
            const offsetX = baseX - px * panStrength;
            const offsetY = baseY - py * panStrength;
            return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`;
        }
    );

    const handleClick = () => {
        if (card.item.onClick) {
            card.item.onClick();
        }
        if (onCardSelect) {
            onCardSelect(card.item, card.index);
        }
    };

    return (
        <motion.div
            style={{
                width: cardWidth,
                transform,
                opacity,
                zIndex: card.index + 1,
            }}
            onClick={handleClick}
            className="pointer-events-auto absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform select-none cursor-pointer"
        >
            <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl shadow-black/80 ring-1 ring-white/15 transition-all duration-500 hover:ring-[#38BDF8] hover:shadow-[0_0_30px_rgba(56,189,248,0.35)]">
                <img
                    src={card.item.src}
                    alt={card.item.title}
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-5">
                    {card.item.category && (
                        <span className="text-[10px] font-mono tracking-wider uppercase text-[#38BDF8] font-bold mb-0.5">
                            {card.item.category}
                        </span>
                    )}
                    <span className="text-xs sm:text-sm font-display tracking-tight text-white/95 font-semibold drop-shadow-md">
                        {card.item.title}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

export function PerspectiveTunnelHero({
    items = DEFAULT_IMAGES,
    badgeText = "Auditoría Visual de Conversión CRO",
    titleFirstLine = "OPTIMIZA",
    titleSecondLine = "TU CHECKOUT.",
    description = "Gira la rueda o desliza tu trackpad para explorar las tiendas analizadas en el túnel tridimensional interactivo.",
    onExploreClick,
    onCardSelect,
    className = "",
}: PerspectiveTunnelHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();

    const [stage, setStage] = useState<StageDimensions>({
        width: 1440,
        height: 900,
        isMobile: false,
    });

    useEffect(() => {
        const updateDimensions = () => {
            setStage({
                width: window.innerWidth,
                height: window.innerHeight,
                isMobile: window.innerWidth < 768,
            });
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const tunnelCards: TunnelCardData[] = items.map((item, i) => {
        const goldenAngle = i * 137.5 * (Math.PI / 180);
        const radiusFactorX = 0.28 + (i % 3) * 0.08;
        const radiusFactorY = 0.26 + (i % 2) * 0.09;

        return {
            item,
            angleCos: Math.cos(goldenAngle),
            angleSin: Math.sin(goldenAngle),
            radiusFactorX,
            radiusFactorY,
            rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
            index: i,
        };
    });

    // Raw motion value controlled directly by mouse wheel / touch trackpad
    const rawProgress = useMotionValue(0);
    const smoothProgress = useSpring(rawProgress, {
        stiffness: 80,
        damping: 30,
        restDelta: 0.0001,
    });

    // Handle wheel scrolling locally inside the viewport container
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            // Only capture if within progress bounds, allowing normal page scroll at edges
            const current = rawProgress.get();
            const delta = e.deltaY * 0.0008;
            const next = current + delta;

            if (next >= 0 && next <= 1) {
                e.preventDefault();
                rawProgress.set(Math.min(1, Math.max(0, next)));
            }
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, [rawProgress]);

    const pointer = useCameraParallax(!reduce);

    const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.85, 1, 1.25]);
    const titleOpacity = useTransform(smoothProgress, [0, 0.12, 0.85, 1], [0.35, 1, 1, 0]);
    const promptOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);

    return (
        <div
            ref={containerRef}
            className={`relative min-h-[85vh] sm:h-[92svh] w-full overflow-hidden bg-[#060913] text-white select-none flex items-center justify-center rounded-[32px] border border-white/15 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8)] backdrop-blur-2xl ${className}`}
            style={{
                perspective: stage.isMobile ? "900px" : "1200px",
                transformStyle: "preserve-3d",
            }}
        >
            {/* Immersive Background Grid & Glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_60%,transparent_100%)] opacity-40" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18)_0%,transparent_75%)]" />

            {/* Depth Ring Guides */}
            <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-sky-400/20" />
            <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-white/10" />

            {/* Central Anchor Typography */}
            <motion.div
                style={{ scale: titleScale, opacity: titleOpacity }}
                className="pointer-events-none z-0 flex flex-col items-center text-center px-6 max-w-2xl"
            >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-xs font-mono uppercase tracking-[0.25em] text-[#38BDF8] mb-4">
                    <span>{badgeText}</span>
                </div>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-display tracking-tighter leading-[0.92] bg-gradient-to-b from-white via-white/95 to-white/40 bg-clip-text text-transparent">
                    {titleFirstLine}
                    <br />
                    {titleSecondLine}
                </h1>
                <p className="mt-4 max-w-[42ch] text-sm sm:text-base font-light text-white/75 leading-relaxed">
                    {description}
                </p>

                {onExploreClick && (
                    <button
                        type="button"
                        onClick={onExploreClick}
                        className="pointer-events-auto mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF6A1F] hover:from-[#FF6A1F] hover:to-[#FF7A30] text-white text-xs font-bold font-display transition-all shadow-[0_8px_24px_rgba(255,85,0,0.4)] border border-white/20 cursor-pointer"
                    >
                        Comenzar Auditoría de Tienda →
                    </button>
                )}
            </motion.div>

            {/* Scroll Prompt */}
            <motion.div
                style={{ opacity: promptOpacity }}
                className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-white/60"
            >
                <span>Desliza para Navegar</span>
                <div className="h-6 w-px bg-gradient-to-b from-[#38BDF8] to-transparent animate-pulse" />
            </motion.div>

            {/* 3D Z-Space Plane */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ transformStyle: "preserve-3d" }}
            >
                {tunnelCards.map((card, i) => (
                    <TunnelCard
                        key={i}
                        card={card}
                        progress={smoothProgress}
                        pointer={pointer}
                        total={tunnelCards.length}
                        stage={stage}
                        onCardSelect={onCardSelect}
                    />
                ))}
            </div>
        </div>
    );
}

export default PerspectiveTunnelHero;
