import React, { useState, useEffect } from 'react';
import Header from './components/ui/Header';
import Controls from './components/ui/Controls';
import DroneViewer3D from './components/DroneViewer3D';
import Configurator from './components/Configurator';
import { fpvData } from './data/fpvData';
import { cn } from './lib/utils';

function App() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [language, setLanguage] = useState('fr');
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [currentBuild, setCurrentBuild] = useState(null);

    // Apply dark mode class to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            document.body.style.backgroundColor = '#020617'; // slate-950
        } else {
            document.documentElement.classList.remove('dark');
            document.body.style.backgroundColor = '#f8fafc'; // slate-50
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    const toggleLanguage = () => setLanguage(language === 'fr' ? 'en' : 'fr');

    const handleBuildChange = (newBuild) => {
        setCurrentBuild(newBuild);
        // Future: Update 3D model based on build changes
    };

    const t = language === 'fr' ? fpvData.fr : fpvData.en;

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-700 font-sans selection:bg-cyan-500/30",
            isDarkMode ? "text-white" : "text-slate-900"
        )}>
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className={cn(
                    "absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 transition-colors duration-700",
                    isDarkMode ? "bg-blue-600" : "bg-blue-300"
                )} />
                <div className={cn(
                    "absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 transition-colors duration-700",
                    isDarkMode ? "bg-cyan-600" : "bg-purple-300"
                )} />
            </div>

            <Header
                isDarkMode={isDarkMode}
                language={language}
                onToggleDarkMode={toggleDarkMode}
                onToggleLanguage={toggleLanguage}
                translations={t}
            />

            <main className="relative pt-24 pb-8 h-screen overflow-hidden flex flex-col">
                <div className="container mx-auto px-6 h-full flex flex-col">
                    {/* Main Title - Absolute position or well placed to not interfere with 3D */}
                    <div className="absolute top-28 left-6 z-10 pointer-events-none">
                        <h1 className={cn(
                            "text-6xl md:text-8xl font-black tracking-tighter uppercase transparent-text-stroke transition-opacity duration-500",
                            isDarkMode ? "text-white/5" : "text-black/5"
                        )}>
                            {t.title}
                        </h1>
                    </div>

                    <div className="flex-1 relative z-0">
                        <DroneViewer3D
                            isDarkMode={isDarkMode}
                            selectedComponent={selectedComponent}
                            onComponentSelect={setSelectedComponent}
                            onCloseComponent={() => setSelectedComponent(null)}
                        />
                    </div>
                </div>

                <Controls
                    isDarkMode={isDarkMode}
                    language={language}
                    translations={t}
                    selectedComponent={selectedComponent}
                    onResetCamera={() => setSelectedComponent(null)}
                />

                <Configurator
                    isDarkMode={isDarkMode}
                    language={language}
                    onBuildChange={handleBuildChange}
                />
            </main>
        </div>
    );
}

export default App;
