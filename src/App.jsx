import React, { useState, useEffect } from 'react';
import Header from './components/ui/Header';
import Controls from './components/ui/Controls';
import DroneViewer3D from './components/DroneViewer3D';
import ComponentModal from './components/ComponentModal';
import FadeIn from './components/ui/FadeIn';
import { fpvData } from './data/fpvData';

function App() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [language, setLanguage] = useState('fr');
    const [selectedComponent, setSelectedComponent] = useState(null);

    // Apply dark mode class to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const handleComponentSelect = (component) => {
        setSelectedComponent(component);
    };

    const handleCloseComponent = () => {
        setSelectedComponent(null);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const toggleLanguage = () => {
        setLanguage(language === 'fr' ? 'en' : 'fr');
    };

    const t = language === 'fr' ? fpvData.fr : fpvData.en;

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDarkMode
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'
                : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
            }`}>
            <Header
                isDarkMode={isDarkMode}
                language={language}
                onToggleDarkMode={toggleDarkMode}
                onToggleLanguage={toggleLanguage}
                translations={t}
            />

            <main className="container mx-auto px-6 py-8">
                {/* Title Section */}
                <FadeIn>
                    <div className="text-center mb-12">
                        <h1 className={`text-5xl md:text-7xl font-bold mb-6 tracking-tight transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                            {t.title}
                        </h1>
                        <p className={`text-xl md:text-2xl max-w-3xl mx-auto transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {t.subtitle}
                        </p>
                    </div>
                </FadeIn>

                {/* 3D Viewer */}
                <FadeIn delay={200}>
                    <div className="mb-12">
                        <DroneViewer3D
                            isDarkMode={isDarkMode}
                            selectedComponent={selectedComponent}
                            onComponentSelect={handleComponentSelect}
                            onCloseComponent={handleCloseComponent}
                        />
                    </div>
                </FadeIn>

                {/* Controls */}
                <FadeIn delay={400}>
                    <Controls
                        isDarkMode={isDarkMode}
                        language={language}
                        translations={t}
                        selectedComponent={selectedComponent}
                        onResetCamera={handleCloseComponent}
                    />
                </FadeIn>
            </main>

            {/* Component Details Modal */}
            {selectedComponent && (
                <ComponentModal
                    component={selectedComponent}
                    isDarkMode={isDarkMode}
                    onClose={handleCloseComponent}
                />
            )}
        </div>
    );
}

export default App;
