import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, ZoomIn, Search, RotateCcw, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

const ControlItem = ({ icon: Icon, text, isDarkMode }) => (
    <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
        isDarkMode
            ? "bg-white/5 border border-white/5 hover:border-white/10"
            : "bg-black/5 border border-black/5 hover:border-black/10"
    )}>
        <Icon className={cn("w-4 h-4", isDarkMode ? "text-blue-400" : "text-blue-600")} />
        <span className={cn(
            "text-xs font-mono tracking-wide",
            isDarkMode ? "text-gray-400" : "text-gray-600"
        )}>
            {text}
        </span>
    </div>
);

const Controls = ({ isDarkMode, language, selectedComponent, onResetCamera }) => {
    const t = {
        rotate: language === 'fr' ? 'Rotation' : 'Rotate',
        zoom: language === 'fr' ? 'Zoomer' : 'Zoom',
        inspect: language === 'fr' ? 'Inspecter' : 'Inspect',
        reset: language === 'fr' ? 'Réinitialiser la Vue' : 'Reset View',
        tip: language === 'fr' ? 'MODE INTERACTIF ACTIF' : 'INTERACTIVE MODE ACTIVE'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={cn(
                "fixed bottom-8 left-1/2 -translate-x-1/2 z-40",
                "flex flex-col items-center gap-4"
            )}
        >
            {/* Flight HUD Controls */}
            <div className={cn(
                "flex items-center gap-2 p-2 rounded-2xl backdrop-blur-xl shadow-2xl border",
                isDarkMode
                    ? "bg-black/40 border-white/10 shadow-black/50"
                    : "bg-white/60 border-black/5 shadow-gray-200/50"
            )}>
                <ControlItem
                    icon={MousePointer2}
                    text={t.rotate}
                    isDarkMode={isDarkMode}
                />
                <ControlItem
                    icon={ZoomIn}
                    text={t.zoom}
                    isDarkMode={isDarkMode}
                />
                <ControlItem
                    icon={Search}
                    text={t.inspect}
                    isDarkMode={isDarkMode}
                />

                <div className={cn("w-px h-8 mx-2", isDarkMode ? "bg-white/10" : "bg-black/10")} />

                <button
                    onClick={onResetCamera}
                    className={cn(
                        "p-3 rounded-xl transition-all duration-300 flex items-center gap-2",
                        isDarkMode
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                            : "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20"
                    )}
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Status Line */}
            <div className="flex items-center gap-2">
                <div className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    isDarkMode ? "bg-emerald-400" : "bg-emerald-500"
                )} />
                <span className={cn(
                    "text-[10px] font-mono tracking-[0.2em] opacity-50",
                    isDarkMode ? "text-white" : "text-black"
                )}>
                    {t.tip}
                </span>
            </div>
        </motion.div>
    );
};

export default Controls;
