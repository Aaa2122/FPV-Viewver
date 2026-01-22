import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Languages, Info, Github } from 'lucide-react';
import { cn } from '../../lib/utils';

const Header = ({ isDarkMode, language, onToggleDarkMode, onToggleLanguage }) => {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                isDarkMode
                    ? "bg-black/20 backdrop-blur-md border-b border-white/5"
                    : "bg-white/50 backdrop-blur-md border-b border-black/5"
            )}
        >
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo/Brand */}
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <div className={cn(
                            "absolute inset-0 rounded-full blur-md opacity-50",
                            isDarkMode ? "bg-blue-500" : "bg-blue-400"
                        )} />
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={cn("relative w-6 h-6", isDarkMode ? "text-white" : "text-slate-900")}
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className={cn(
                            "text-sm font-bold tracking-widest uppercase",
                            isDarkMode ? "text-white" : "text-slate-900"
                        )}>
                            FPV Viewer
                        </span>
                        <span className={cn(
                            "text-[10px] font-mono tracking-wider",
                            isDarkMode ? "text-white/50" : "text-slate-500"
                        )}>
                            INTERACTIVE SCHEMATIC
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Language Toggle */}
                    <button
                        onClick={onToggleLanguage}
                        className={cn(
                            "p-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-mono group",
                            isDarkMode
                                ? "text-gray-400 hover:text-white hover:bg-white/10"
                                : "text-gray-600 hover:text-black hover:bg-black/5"
                        )}
                    >
                        <Languages className="w-4 h-4" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline">
                            {language.toUpperCase()}
                        </span>
                    </button>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={onToggleDarkMode}
                        className={cn(
                            "p-2 rounded-lg transition-all duration-200",
                            isDarkMode
                                ? "text-gray-400 hover:text-yellow-300 hover:bg-white/10"
                                : "text-gray-600 hover:text-purple-600 hover:bg-black/5"
                        )}
                    >
                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    <div className={cn(
                        "w-px h-6 mx-2",
                        isDarkMode ? "bg-white/10" : "bg-black/10"
                    )} />

                    {/* GitHub Link (Optional/Placeholder) */}
                    <a
                        href="#"
                        className={cn(
                            "p-2 rounded-lg transition-all duration-200",
                            isDarkMode
                                ? "text-gray-400 hover:text-white hover:bg-white/10"
                                : "text-gray-600 hover:text-black hover:bg-black/5"
                        )}
                    >
                        <Github className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
