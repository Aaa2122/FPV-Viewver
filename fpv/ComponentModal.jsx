import React, { useEffect } from 'react';

const ComponentModal = ({ component, onClose, isDarkMode }) => {
    // Bloquer le scroll du body quand le modal est ouvert
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!component) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            {/* Backdrop avec blur */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            {/* Modal Content avec animation d'entrée */}
            <div
                className={`relative z-10 w-full max-w-2xl rounded-3xl border overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ${isDarkMode
                        ? 'bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-white/10'
                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header avec gradient et icône */}
                <div
                    className="relative p-8 overflow-hidden"
                    style={{
                        background: component.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                >
                    {/* Effet de brillance animé */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl animate-in zoom-in duration-500 delay-100">
                                {component.icon}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white drop-shadow-lg animate-in slide-in-from-left duration-500">
                                    {component.name}
                                </h2>
                                <p className="text-white/80 text-sm mt-1 animate-in slide-in-from-left duration-500 delay-100">
                                    Composant FPV Racing
                                </p>
                            </div>
                        </div>

                        {/* Bouton fermer avec animation */}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 group"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="group-hover:rotate-90 transition-transform duration-300"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content avec animations échelonnées */}
                <div className="p-8 space-y-6">
                    {/* Description */}
                    <div className="animate-in slide-in-from-bottom duration-500 delay-200">
                        <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
                            Description
                        </h3>
                        <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            {component.description}
                        </p>
                    </div>

                    {/* Spécifications avec cartes animées */}
                    {component.specs && Object.keys(component.specs).length > 0 && (
                        <div className="animate-in slide-in-from-bottom duration-500 delay-300">
                            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
                                Spécifications
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(component.specs).map(([key, value], index) => (
                                    <div
                                        key={key}
                                        className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in zoom-in duration-300 ${isDarkMode
                                                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        style={{ animationDelay: `${400 + index * 50}ms` }}
                                    >
                                        <div className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            {key}
                                        </div>
                                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Caractéristiques avec checkmarks animés */}
                    {component.features && component.features.length > 0 && (
                        <div className="animate-in slide-in-from-bottom duration-500 delay-400">
                            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
                                Caractéristiques
                            </h3>
                            <div className="space-y-3">
                                {component.features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 hover:translate-x-2 animate-in slide-in-from-left duration-300 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                                            }`}
                                        style={{ animationDelay: `${500 + index * 50}ms` }}
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-in zoom-in duration-300"
                                            style={{ animationDelay: `${500 + index * 50}ms` }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <span className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer avec bouton d'action */}
                <div className={`p-6 border-t animate-in slide-in-from-bottom duration-500 delay-500 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                    }`}>
                    <button
                        onClick={onClose}
                        className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${isDarkMode
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
                                : 'bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white'
                            }`}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComponentModal;
