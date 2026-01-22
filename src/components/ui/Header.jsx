import React from 'react';

const Header = ({ isDarkMode, language, onToggleDarkMode, onToggleLanguage, translations }) => {
    return (
        <header className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-500 ${isDarkMode
                ? 'bg-gray-900/80 border-white/10'
                : 'bg-white/80 border-gray-200'
            } border-b`}>
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo/Title */}
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl">🚁</div>
                        <h1 className="text-xl font-bold tracking-tight">
                            FPV Viewer
                        </h1>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-4">
                        {/* Language Toggle */}
                        <button
                            onClick={onToggleLanguage}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isDarkMode
                                    ? 'bg-white/10 hover:bg-white/20 border border-white/20'
                                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                                }`}
                            aria-label="Toggle language"
                        >
                            {language.toUpperCase()}
                        </button>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={onToggleDarkMode}
                            className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode
                                    ? 'bg-white/10 hover:bg-white/20 border border-white/20'
                                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                                }`}
                            aria-label="Toggle dark mode"
                        >
                            <div className="text-2xl">
                                {isDarkMode ? '☀️' : '🌙'}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
