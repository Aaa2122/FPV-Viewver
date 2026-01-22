import React, { Suspense, useRef, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Sparkles, Grid } from '@react-three/drei';
import DroneModel from './DroneModel';

// Fiche technique en overlay 2D fixe - position adaptative (memoized)
const TechCardOverlay = memo(({ component, onClose }) => {
    if (!component) return null;

    // Position adaptative basée sur la position X du composant dans l'espace 3D
    // X positif = gauche de l'écran (composant à gauche) → carte à droite
    // X négatif = droite de l'écran (composant à droite) → carte à gauche
    // X = 0 (centre) → carte à droite par défaut
    const componentX = component.position?.[0] ?? 0;
    const side = componentX >= 0 ? 'right' : 'left';

    return (
        <div
            className={`absolute top-1/2 -translate-y-1/2 z-50 ${side === 'right' ? 'right-8' : 'left-8'}`}
        >
            {/* Ligne de connexion horizontale vers le centre - plus longue */}
            <svg
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                width="200"
                height="24"
                style={{
                    [side === 'right' ? 'left' : 'right']: '-190px',
                }}
            >
                {/* Ligne horizontale animée */}
                <line
                    x1={side === 'right' ? 0 : 200}
                    y1="12"
                    x2={side === 'right' ? 180 : 20}
                    y2="12"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    style={{ animation: 'dash 1s linear infinite' }}
                />
                {/* Gradient pour la ligne */}
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={side === 'right' ? '#3b82f6' : '#60a5fa'} />
                        <stop offset="100%" stopColor={side === 'right' ? '#60a5fa' : '#3b82f6'} />
                    </linearGradient>
                </defs>
                {/* Point au bout (vers le drone) */}
                <circle
                    cx={side === 'right' ? 180 : 20}
                    cy="12"
                    r="8"
                    fill="#3b82f6"
                    opacity="0.3"
                />
                <circle
                    cx={side === 'right' ? 180 : 20}
                    cy="12"
                    r="5"
                    fill="#3b82f6"
                />
                <circle
                    cx={side === 'right' ? 180 : 20}
                    cy="12"
                    r="2"
                    fill="#ffffff"
                />
            </svg>

            {/* Card principale */}
            <div
                className={`w-[320px] border border-blue-500/40 overflow-hidden animate-in ${side === 'right' ? 'slide-in-from-right-4' : 'slide-in-from-left-4'} fade-in duration-500`}
                style={{
                    background: 'linear-gradient(135deg, rgba(2, 6, 23, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping opacity-50" />
                            </div>
                            <h3 className="text-white font-bold text-base tracking-[0.12em] font-mono uppercase">
                                {component.title}
                            </h3>
                        </div>
                        <div className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 text-[9px] text-blue-400 font-mono tracking-widest">
                            SYS.ACTIVE
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="px-5 py-4 border-b border-white/5">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {component.description}
                    </p>
                </div>

                {/* Specs Grid */}
                {component.specs && Object.keys(component.specs).length > 0 && (
                    <div className="px-5 py-4 border-b border-white/5">
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(component.specs).map(([key, value], index) => (
                                <div
                                    key={key}
                                    className="flex justify-between items-center py-2 border-b border-white/5 animate-in fade-in slide-in-from-bottom-1"
                                    style={{ animationDelay: `${index * 80}ms` }}
                                >
                                    <span className="text-[11px] text-gray-500 uppercase tracking-wider font-mono">
                                        {key}
                                    </span>
                                    <span className="text-sm text-blue-400 font-mono font-bold">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="px-5 py-3 flex items-center justify-between bg-black/30">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                            STATUS:
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            NOMINAL
                        </span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">
                        ID: {component.id?.toUpperCase()}
                    </span>
                </div>

                {/* Coins décoratifs */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/60" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/60" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/60" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500/60" />
            </div>

            {/* Bouton fermer */}
            <button
                onClick={onClose}
                className={`absolute -top-3 ${side === 'right' ? '-right-3' : '-left-3'} w-8 h-8 rounded-lg bg-black/90 border border-white/20 hover:border-red-500/50 hover:bg-red-500/20 flex items-center justify-center transition-all duration-200 group z-10`}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-gray-400 group-hover:text-red-400 transition-colors">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
});

TechCardOverlay.displayName = 'TechCardOverlay';

const DroneViewer3D = ({ isDarkMode, selectedComponent, onComponentSelect, onCloseComponent }) => {
    const controlsRef = useRef();
    const cameraRef = useRef();

    return (
        <div className={`w-full h-[750px] rounded-3xl overflow-hidden relative border transition-colors duration-700 ${isDarkMode ? 'border-white/10 shadow-2xl shadow-black/50' : 'border-gray-200 shadow-xl shadow-gray-200/50'
            }`}>
            {/* Fond Harmonisé */}
            <div
                className="absolute inset-0 pointer-events-none transition-colors duration-700"
                style={{
                    background: isDarkMode
                        ? 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' // Dark Slate -> Black
                        : 'radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%)'  // Slate 50 -> Slate 200
                }}
            />

            {/* Effet lumière ambiante */}
            <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
                }}
            />

            <Canvas
                shadows
                style={{ background: 'transparent', touchAction: 'none' }} // none pour fluidité mobile
                gl={{
                    alpha: true,
                    antialias: true,
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true
                }}
                dpr={[1, 1.5]}
                performance={{ min: 0.5 }}
            >
                <PerspectiveCamera
                    ref={cameraRef}
                    makeDefault
                    position={[-4, 2.5, -4]} // Vue de face/gauche
                    fov={45}
                />

                <OrbitControls
                    ref={controlsRef}
                    enablePan={false}
                    enableZoom={false} // Désactivé pour éviter le Scroll Trap
                    maxPolarAngle={Math.PI / 1.5}
                    minPolarAngle={0.2}
                    enableDamping
                    dampingFactor={0.05}
                    rotateSpeed={0.6}
                    minDistance={2}
                    maxDistance={10}
                />

                {/* Éclairage Studio Amélioré */}
                <ambientLight intensity={isDarkMode ? 0.4 : 0.8} />
                <spotLight
                    position={[10, 10, 5]}
                    angle={0.2}
                    penumbra={1}
                    intensity={isDarkMode ? 2 : 1.5}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                />
                <spotLight
                    position={[-5, 5, -5]}
                    angle={0.2}
                    penumbra={1}
                    intensity={1.5}
                    color="#3b82f6" // Touche bleue
                />
                <pointLight position={[-4, -2, -4]} intensity={0.5} color="#60a5fa" />
                <pointLight position={[4, -2, 4]} intensity={0.5} color="#f472b6" />

                <Environment preset={isDarkMode ? "city" : "studio"} blur={0.8} />

                {/* Elements de décor TECH */}
                {/* Particules flottantes */}
                <Sparkles
                    count={150}
                    scale={12}
                    size={2}
                    speed={0.4}
                    opacity={isDarkMode ? 0.4 : 0.2}
                    color={isDarkMode ? "#ffffff" : "#3b82f6"}
                />



                <Suspense fallback={null}>
                    <DroneModel
                        selectedComponent={selectedComponent}
                        onComponentSelect={onComponentSelect}
                        onCloseComponent={onCloseComponent}
                        cameraRef={cameraRef}
                        controlsRef={controlsRef}
                    />
                </Suspense>
            </Canvas>

            {/* Fiche technique en overlay 2D - HORS du Canvas */}
            <TechCardOverlay
                component={selectedComponent}
                onClose={onCloseComponent}
            />

            {/* Instructions */}
            <div className={`absolute bottom-6 left-6 backdrop-blur-xl px-5 py-3 rounded-2xl text-sm border transition-all duration-500 ${isDarkMode
                ? 'bg-white/5 border-white/10 text-white/80'
                : 'bg-black/5 border-black/10 text-black/70'
                }`}>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`} />
                        <span className="font-medium">Faites glisser pour tourner • Cliquez sur un composant</span>
                    </div>
                </div>
            </div>

            {/* Indicateur de mode isolation */}
            {selectedComponent && (
                <div className={`absolute top-6 left-1/2 -translate-x-1/2 backdrop-blur-xl px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest border animate-in fade-in zoom-in-95 duration-300 ${isDarkMode
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-600'
                    }`}>
                    Mode isolation : {selectedComponent.title}
                </div>
            )}
        </div>
    );
};

export default DroneViewer3D;
