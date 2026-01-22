import React from 'react';

const Controls = ({ isDarkMode, language, translations, selectedComponent, onResetCamera }) => {
    const instructions = language === 'fr'
        ? [
            '🖱️ Clic gauche + drag : Rotation',
            '⚙️ Molette : Zoom',
            '👆 Clic sur hotspot : Détails du composant',
            '🎯 Survol drone : Animation des hélices'
        ]
        : [
            '🖱️ Left click + drag: Rotate',
            '⚙️ Mouse wheel: Zoom',
            '👆 Click hotspot: Component details',
            '🎯 Hover drone: Propeller animation'
        ];

    return (
        <div className={`rounded-3xl p-8 transition-all duration-500 ${isDarkMode
                ? 'bg-white/5 border border-white/10 backdrop-blur-sm'
                : 'bg-gray-100 border border-gray-200'
            }`}>
            <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                {language === 'fr' ? '📖 Instructions' : '📖 Instructions'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {instructions.map((instruction, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg transition-colors duration-300 ${isDarkMode
                                ? 'bg-white/5 border border-white/5'
                                : 'bg-white border border-gray-200'
                            }`}
                    >
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            {instruction}
                        </p>
                    </div>
                ))}
            </div>

            {/* Reset Camera Button */}
            {selectedComponent && (
                <button
                    onClick={onResetCamera}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                >
                    {language === 'fr' ? '🔄 Réinitialiser la vue' : '🔄 Reset View'}
                </button>
            )}

            {/* Tips */}
            <div className={`mt-6 p-4 rounded-lg ${isDarkMode
                    ? 'bg-blue-500/10 border border-blue-500/20'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                    💡 {language === 'fr'
                        ? 'Astuce : Survolez les points blancs pour afficher les noms des composants !'
                        : 'Tip: Hover over white dots to display component names!'}
                </p>
            </div>
        </div>
    );
};

export default Controls;
