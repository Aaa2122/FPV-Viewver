import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Zap, Clock, DollarSign, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { componentCatalog, defaultBuild, compatibilityRules } from '../data/componentCatalog';
import { generatePerformanceReport } from '../utils/performanceCalculator';
import { cn } from '../lib/utils';

const Configurator = ({ isDarkMode, language, onBuildChange }) => {
    const [selectedComponents, setSelectedComponents] = useState(() => {
        // Initialize with default build
        return {
            frame: componentCatalog.frames.find(f => f.id === defaultBuild.frame),
            motors: componentCatalog.motors.find(m => m.id === defaultBuild.motors),
            stack: componentCatalog.stacks.find(s => s.id === defaultBuild.stack),
            camera: componentCatalog.cameras.find(c => c.id === defaultBuild.camera),
            battery: componentCatalog.batteries.find(b => b.id === defaultBuild.battery)
        };
    });

    const [activeCategory, setActiveCategory] = useState('frame');
    const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);

    // Calculate performance metrics
    const performanceReport = useMemo(() => {
        return generatePerformanceReport(selectedComponents, compatibilityRules);
    }, [selectedComponents]);

    const categories = [
        { id: 'frame', label: 'Frame', icon: '🛠️' },
        { id: 'motors', label: 'Motors', icon: '⚡' },
        { id: 'stack', label: 'Stack', icon: '🎛️' },
        { id: 'camera', label: 'Camera', icon: '📹' },
        { id: 'battery', label: 'Battery', icon: '🔋' }
    ];

    const handleComponentSelect = (category, component) => {
        const newComponents = {
            ...selectedComponents,
            [category]: component
        };
        setSelectedComponents(newComponents);

        // Notify parent component about the change
        if (onBuildChange) {
            onBuildChange(newComponents);
        }
    };

    const getCompatibilityIcon = (issues) => {
        if (issues.length === 0) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        const hasError = issues.some(i => i.type === 'error');
        return hasError ?
            <AlertTriangle className="w-4 h-4 text-red-500" /> :
            <Info className="w-4 h-4 text-yellow-500" />;
    };

    return (
        <>
            {/* Configurator Toggle Button */}
            <motion.button
                onClick={() => setIsConfiguratorOpen(!isConfiguratorOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300",
                    isDarkMode
                        ? "bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                        : "bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400",
                    "backdrop-blur-sm"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <Settings className="w-6 h-6 text-white" />
            </motion.button>

            {/* Configurator Panel */}
            <AnimatePresence>
                {isConfiguratorOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={cn(
                            "fixed right-0 top-0 bottom-0 w-full md:w-[480px] z-40 overflow-hidden shadow-2xl",
                            isDarkMode ? "bg-slate-900/95" : "bg-white/95",
                            "backdrop-blur-xl border-l",
                            isDarkMode ? "border-slate-700" : "border-slate-200"
                        )}
                    >
                        <div className="h-full flex flex-col">
                            {/* Header */}
                            <div className={cn(
                                "p-6 border-b",
                                isDarkMode ? "border-slate-700" : "border-slate-200"
                            )}>
                                <h2 className="text-2xl font-bold mb-2">
                                    {language === 'fr' ? 'Configurateur de Build' : 'Build Configurator'}
                                </h2>
                                <p className={cn(
                                    "text-sm",
                                    isDarkMode ? "text-slate-400" : "text-slate-600"
                                )}>
                                    {language === 'fr'
                                        ? 'Personnalisez votre drone et visualisez les performances en temps réel'
                                        : 'Customize your drone and view real-time performance metrics'}
                                </p>
                            </div>

                            {/* Performance Summary */}
                            <div className="p-4 grid grid-cols-2 gap-3">
                                <PerformanceCard
                                    icon={<Zap className="w-4 h-4" />}
                                    label="T/W Ratio"
                                    value={`${performanceReport.thrustToWeight.ratio}:1`}
                                    color="blue"
                                    isDarkMode={isDarkMode}
                                />
                                <PerformanceCard
                                    icon={<Clock className="w-4 h-4" />}
                                    label="Flight Time"
                                    value={`${performanceReport.flightTime.freestyle.avg}min`}
                                    color="green"
                                    isDarkMode={isDarkMode}
                                />
                                <PerformanceCard
                                    icon={<DollarSign className="w-4 h-4" />}
                                    label="Total Cost"
                                    value={`${performanceReport.cost.total}€`}
                                    color="purple"
                                    isDarkMode={isDarkMode}
                                />
                                <PerformanceCard
                                    icon={getCompatibilityIcon(performanceReport.compatibility)}
                                    label="Compatibility"
                                    value={performanceReport.compatibility.length === 0 ? 'OK' : `${performanceReport.compatibility.length} issues`}
                                    color={performanceReport.compatibility.length === 0 ? 'green' : 'yellow'}
                                    isDarkMode={isDarkMode}
                                />
                            </div>

                            {/* Compatibility Warnings */}
                            {performanceReport.compatibility.length > 0 && (
                                <div className="px-4 pb-4">
                                    <div className={cn(
                                        "p-3 rounded-lg border",
                                        isDarkMode ? "bg-yellow-900/20 border-yellow-700/50" : "bg-yellow-50 border-yellow-200"
                                    )}>
                                        {performanceReport.compatibility.map((issue, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm mb-1 last:mb-0">
                                                {issue.type === 'error' ?
                                                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> :
                                                    <Info className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                                }
                                                <span className={isDarkMode ? "text-yellow-200" : "text-yellow-800"}>
                                                    {issue.message}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Category Tabs */}
                            <div className={cn(
                                "flex border-b overflow-x-auto",
                                isDarkMode ? "border-slate-700" : "border-slate-200"
                            )}>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={cn(
                                            "px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                                            activeCategory === cat.id
                                                ? isDarkMode
                                                    ? "text-cyan-400 border-b-2 border-cyan-400"
                                                    : "text-blue-600 border-b-2 border-blue-600"
                                                : isDarkMode
                                                    ? "text-slate-400 hover:text-slate-200"
                                                    : "text-slate-600 hover:text-slate-900"
                                        )}
                                    >
                                        <span className="mr-2">{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Component List */}
                            <div className="flex-1 overflow-y-auto">
                                <ComponentList
                                    category={activeCategory}
                                    components={componentCatalog[activeCategory === 'stack' ? 'stacks' : activeCategory === 'camera' ? 'cameras' : activeCategory === 'battery' ? 'batteries' : activeCategory + 's']}
                                    selectedComponent={selectedComponents[activeCategory]}
                                    onSelect={(component) => handleComponentSelect(activeCategory, component)}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Performance Card Component
const PerformanceCard = ({ icon, label, value, color, isDarkMode }) => {
    const colorClasses = {
        blue: isDarkMode ? 'from-blue-600/20 to-cyan-600/20 border-blue-500/30' : 'from-blue-50 to-cyan-50 border-blue-200',
        green: isDarkMode ? 'from-green-600/20 to-emerald-600/20 border-green-500/30' : 'from-green-50 to-emerald-50 border-green-200',
        purple: isDarkMode ? 'from-purple-600/20 to-pink-600/20 border-purple-500/30' : 'from-purple-50 to-pink-50 border-purple-200',
        yellow: isDarkMode ? 'from-yellow-600/20 to-orange-600/20 border-yellow-500/30' : 'from-yellow-50 to-orange-50 border-yellow-200'
    };

    return (
        <div className={cn(
            "p-3 rounded-lg border bg-gradient-to-br",
            colorClasses[color]
        )}>
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                    {label}
                </span>
            </div>
            <div className="text-lg font-bold">
                {value}
            </div>
        </div>
    );
};

// Component List
const ComponentList = ({ components, selectedComponent, onSelect, isDarkMode }) => {
    return (
        <div className="p-4 space-y-3">
            {components.map((component) => (
                <motion.button
                    key={component.id}
                    onClick={() => onSelect(component)}
                    className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all",
                        selectedComponent?.id === component.id
                            ? isDarkMode
                                ? "border-cyan-500 bg-cyan-500/10"
                                : "border-blue-500 bg-blue-50"
                            : isDarkMode
                                ? "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                : "border-slate-200 bg-white hover:border-slate-300",
                        "relative overflow-hidden"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {/* Color indicator */}
                    <div
                        className="absolute top-0 left-0 w-1 h-full"
                        style={{ backgroundColor: component.color }}
                    />

                    <div className="pl-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                                <h3 className="font-semibold text-sm">{component.name}</h3>
                                <p className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                    {component.brand}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-green-500">
                                    {component.price || component.pricePerSet}€
                                </div>
                                <div className={cn("text-xs", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                                    {component.weight}g
                                </div>
                            </div>
                        </div>

                        {/* Key specs */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {component.kv && (
                                <span className={cn("text-xs px-2 py-0.5 rounded", isDarkMode ? "bg-slate-700" : "bg-slate-100")}>
                                    {component.kv}KV
                                </span>
                            )}
                            {component.cells && (
                                <span className={cn("text-xs px-2 py-0.5 rounded", isDarkMode ? "bg-slate-700" : "bg-slate-100")}>
                                    {component.cells}S
                                </span>
                            )}
                            {component.capacity && (
                                <span className={cn("text-xs px-2 py-0.5 rounded", isDarkMode ? "bg-slate-700" : "bg-slate-100")}>
                                    {component.capacity}mAh
                                </span>
                            )}
                            {component.escCurrent && (
                                <span className={cn("text-xs px-2 py-0.5 rounded", isDarkMode ? "bg-slate-700" : "bg-slate-100")}>
                                    {component.escCurrent}A ESC
                                </span>
                            )}
                        </div>

                        {/* In stock indicator */}
                        {component.inStock && (
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs text-green-500">In Stock</span>
                            </div>
                        )}
                    </div>
                </motion.button>
            ))}
        </div>
    );
};

export default Configurator;
