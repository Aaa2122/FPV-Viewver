import React, { useState } from 'react';
import DroneViewer3D from './DroneViewer3D';
import FadeIn from '../ui/FadeIn';

const FPVSection = ({ isDarkMode, language, fpvData }) => {
    const [selectedComponent, setSelectedComponent] = useState(null);

    const handleComponentSelect = (component) => {
        setSelectedComponent(component);
    };

    const handleCloseComponent = () => {
        setSelectedComponent(null);
    };

    const t = language === 'fr' ? fpvData.fr : fpvData.en;

    return (
        <section id="fpv" className="py-32 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <FadeIn>
                    <div className="text-center mb-16">
                        <h2 className={`text-5xl md:text-6xl font-bold mb-6 tracking-tight transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                            {t.title}
                        </h2>
                        <p className={`text-xl max-w-3xl mx-auto transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {t.subtitle}
                        </p>
                    </div>
                </FadeIn>

                {/* Drone 3D Viewer */}
                <FadeIn delay={200} className="mb-16 relative">
                    <DroneViewer3D
                        isDarkMode={isDarkMode}
                        selectedComponent={selectedComponent}
                        onComponentSelect={handleComponentSelect}
                        onCloseComponent={handleCloseComponent}
                    />
                </FadeIn>

                {/* Vidéo FPV (Placeholder) */}
                <FadeIn delay={400}>
                    {fpvData.video ? (
                        <div className={`rounded-3xl overflow-hidden border transition-colors duration-500 ${isDarkMode ? 'border-white/10' : 'border-gray-200'
                            }`}>
                            <div className="aspect-video">
                                <iframe
                                    src={fpvData.video}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={`rounded-3xl overflow-hidden border transition-colors duration-500 ${isDarkMode
                            ? 'bg-white/5 border-white/10 backdrop-blur-sm'
                            : 'bg-gray-100 border-gray-200'
                            }`}>
                            <div className="aspect-video flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🎥</div>
                                    <p className={`text-xl font-medium transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        {t.videoPlaceholder}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </FadeIn>
            </div>
        </section>
    );
};

export default FPVSection;
