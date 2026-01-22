import React, { Suspense, useRef, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Sparkles, Grid, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Cpu, Battery, Camera, Activity, Fan, Minimize2, ChevronRight, Zap } from 'lucide-react';
import DroneModel from './DroneModel';

// Mapping icônes Lucide par ID de composant
const getComponentIcon = (id) => {
    if (id.includes('motor')) return Fan;
    if (id.includes('camera')) return Camera;
    if (id.includes('battery')) return Battery;
    if (id.includes('fc')) return Cpu;
    if (id.includes('frame')) return Activity;
    return Activity;
};

// Fiche technique Sci-Fi Overlay
const TechCardOverlay = memo(({ component, onClose, isDarkMode }) => {
    if (!component) return null;

    const Icon = getComponentIcon(component.id);
    const isRight = (component.position?.[0] ?? 0) >= 0;

    return (
        <div className={cn(
            "absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none", // pointer-events-none sur le container pour laisser passer les clics
            isRight ? "right-[10%]" : "left-[10%]"
        )}>
            {/* Background avec effet de Scanline */}
            <motion.div
                initial={{ opacity: 0, x: isRight ? 50 : -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                    "pointer-events-auto w-[350px] overflow-hidden rounded-lg border backdrop-blur-md relative group",
                    isDarkMode
                        ? "bg-slate-900/80 border-cyan-500/30 shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)]"
                        : "bg-white/80 border-blue-500/20 shadow-2xl"
                )}
            >
                {/* Ligne décorative animée en haut */}
                <div className={cn(
                    "absolute top-0 left-0 w-full h-1 overflow-hidden",
                    isDarkMode ? "bg-cyan-900/50" : "bg-blue-100"
                )}>
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className={cn("h-full w-1/2", isDarkMode ? "bg-cyan-500" : "bg-blue-500")}
                    />
                </div>

                {/* Header */}
                <div className={cn(
                    "p-6 border-b",
                    isDarkMode ? "border-white/10" : "border-black/5"
                )}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-lg border",
                                isDarkMode
                                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                                    : "bg-blue-500/10 border-blue-500/20 text-blue-600"
                            )}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={cn(
                                    "font-bold text-lg leading-tight tracking-wide uppercase font-mono",
                                    isDarkMode ? "text-white" : "text-slate-900"
                                )}>
                                    {component.name}
                                </h3>
                                <div className={cn(
                                    "text-[10px] font-mono mt-1",
                                    isDarkMode ? "text-cyan-400" : "text-blue-500"
                                )}>
                                    ID: {component.id.toUpperCase()}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={cn(
                                "p-1 rounded opacity-50 hover:opacity-100 transition-opacity",
                                isDarkMode ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-black"
                            )}
                        >
                            <Minimize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <p className={cn(
                        "text-sm leading-relaxed",
                        isDarkMode ? "text-slate-300" : "text-slate-600"
                    )}>
                        {component.description}
                    </p>

                    {/* Specs Grid */}
                    {component.specs && (
                        <div className="grid gap-2">
                            {Object.entries(component.specs).map(([key, value], i) => (
                                <div
                                    key={key}
                                    className={cn(
                                        "flex items-center justify-between p-2 rounded text-xs font-mono border-b border-dashed",
                                        isDarkMode ? "border-white/10 text-slate-400" : "border-black/5 text-slate-500"
                                    )}
                                >
                                    <span className="uppercase tracking-wider">{key}</span>
                                    <span className={cn(
                                        "font-bold",
                                        isDarkMode ? "text-cyan-300" : "text-blue-600"
                                    )}>{value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Status */}
                <div className={cn(
                    "px-6 py-3 text-[10px] font-mono flex items-center justify-between uppercase tracking-widest",
                    isDarkMode ? "bg-black/40 text-slate-500" : "bg-slate-50 text-slate-500"
                )}>
                    <span className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        SYSTEM CONNECTED
                    </span>
                    <span>v2.4.0</span>
                </div>
            </motion.div>
        </div>
    );
});

TechCardOverlay.displayName = 'TechCardOverlay';

const DroneViewer3D = ({ isDarkMode, selectedComponent, onComponentSelect, onCloseComponent }) => {
    const controlsRef = useRef();
    const cameraRef = useRef();

    return (
        <div className="relative w-full h-[80vh] min-h-[600px]">
            {/* Background Canvas */}
            <div className={cn(
                "absolute inset-0 rounded-3xl overflow-hidden transition-all duration-700 border",
                isDarkMode
                    ? "bg-[#050505] border-white/10 shadow-2xl"
                    : "bg-slate-50 border-slate-200 shadow-xl"
            )}>
                {/* Graduations/Grid décorative de fond type "Blueprint" */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(${isDarkMode ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDarkMode ? '#fff' : '#000'} 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                <Canvas
                    shadows
                    camera={{ position: [-4, 2, 4], fov: 45 }}
                    gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
                    dpr={[1, 1.5]} // Optimisation perf
                >
                    <fog attach="fog" args={[isDarkMode ? '#050505' : '#f8fafc', 5, 20]} />

                    <Suspense fallback={null}>
                        <PerspectiveCamera makeDefault position={[-4, 2, 4]} />
                        <OrbitControls
                            makeDefault
                            enablePan={false}
                            minPolarAngle={0}
                            maxPolarAngle={Math.PI / 1.5}
                            minDistance={2}
                            maxDistance={8}
                        />

                        <Environment preset={isDarkMode ? "city" : "studio"} blur={1} />

                        <ambientLight intensity={isDarkMode ? 0.2 : 0.5} />
                        <spotLight
                            position={[10, 10, 5]}
                            angle={0.15}
                            penumbra={1}
                            intensity={isDarkMode ? 2 : 1}
                            castShadow
                            shadow-bias={-0.0001}
                        />
                        {/* Lumières colorées pour ambiance Cyberpunk en dark mode */}
                        {isDarkMode && (
                            <>
                                <pointLight position={[-5, 2, -5]} intensity={2} color="#06b6d4" distance={10} />
                                <pointLight position={[5, 2, 5]} intensity={2} color="#3b82f6" distance={10} />
                            </>
                        )}

                        <DroneModel
                            selectedComponent={selectedComponent}
                            onComponentSelect={onComponentSelect}
                            onCloseComponent={onCloseComponent}
                            cameraRef={cameraRef}
                            controlsRef={controlsRef}
                        />

                        {/* Floating Particles */}
                        <Sparkles
                            count={100}
                            scale={5}
                            size={2}
                            speed={0.2}
                            opacity={0.2}
                            color={isDarkMode ? "#06b6d4" : "#94a3b8"}
                        />

                        {/* Ombre au sol douce */}
                        <ContactShadows
                            resolution={1024}
                            scale={20}
                            blur={2}
                            opacity={0.5}
                            far={10}
                            color="#000000"
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Overlay UI */}
            <AnimatePresence>
                {selectedComponent && (
                    <TechCardOverlay
                        component={selectedComponent}
                        onClose={onCloseComponent}
                        isDarkMode={isDarkMode}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DroneViewer3D;
