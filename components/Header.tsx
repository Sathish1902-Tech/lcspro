

import React, { useState, useRef, useEffect } from 'react';
import { MatchState, GameState, User } from '../types';
import { CricketBatIcon, CloudIcon, CloudCheckIcon, MenuIcon, XIcon, SunIcon, MoonIcon, DesktopIcon } from './icons';
import { GoogleGenAI, Type } from '@google/genai';

interface HeaderProps {
    match: MatchState | null;
    user: User;
    onLogout: () => void;
    syncStatus: 'idle' | 'syncing' | 'synced';
    theme: 'light' | 'dark' | 'system';
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ match, user, onLogout, syncStatus, theme, toggleTheme }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const handleShare = async () => {
        if (!match || isSharing) return;
        setIsSharing(true);

        try {
            // API_KEY is assumed to be present in the environment
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Compress the following JSON object into a very compact, URL-safe string. The goal is to make it as short as possible for a URL. JSON: ${JSON.stringify(match)}`,
                config: {
                    temperature: 0,
                    thinkingConfig: { thinkingBudget: 0 },
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            data: {
                                type: Type.STRING,
                                description: "The highly compressed, URL-safe string representation of the original JSON data."
                            }
                        },
                        required: ["data"]
                    }
                }
            });

            if (!response || !response.text) {
                 throw new Error("Received an empty response from the API.");
            }

            const result = JSON.parse(response.text);
            const compressedData = result.data;

            if (!compressedData) {
                throw new Error("API response did not contain compressed data.");
            }
            
            const encodedData = encodeURIComponent(compressedData);
            const url = `${window.location.origin}${window.location.pathname}#/spectate?data=${encodedData}`;

            navigator.clipboard.writeText(url).then(() => {
                alert('Spectator link copied to clipboard!');
            }, (err) => {
                console.error('Could not copy text: ', err);
                alert('Failed to copy link. Please try again.');
            });

        } catch (error) {
            console.error("Error creating share link:", error);
            alert("Could not create a share link. Please check your internet connection and try again.");
        } finally {
            setIsSharing(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderSyncStatus = () => {
        if (!user.driveConnected || syncStatus === 'idle') return null;

        return (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                {syncStatus === 'syncing' && <CloudIcon className="w-5 h-5 animate-pulse" />}
                {syncStatus === 'synced' && <CloudCheckIcon className="w-5 h-5 text-green-500" />}
                <span>
                    {syncStatus === 'syncing' && 'Syncing...'}
                    {syncStatus === 'synced' && 'Synced'}
                </span>
            </div>
        );
    };

    const ThemeToggleButton = ({className = ''}: {className?: string}) => (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
            aria-label={`Toggle theme (current: ${theme})`}
        >
            {theme === 'system' && <DesktopIcon className="w-6 h-6 text-primary dark:text-secondary" />}
            {theme === 'light' && <SunIcon className="w-6 h-6 text-yellow-500" />}
            {theme === 'dark' && <MoonIcon className="w-6 h-6 text-primary" />}
        </button>
    );

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-40 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm shadow-md`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <a href="#/" className="flex items-center gap-2 text-primary dark:text-secondary font-bold text-xl">
                            <CricketBatIcon className="w-8 h-8"/>
                            <span className="hidden sm:inline">Cricket Scorer</span>
                        </a>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-4">
                            {match && match.gameState !== GameState.FINISHED && (
                                <a href="#/" className="text-sm font-medium text-light-text dark:text-dark-text hover:text-primary dark:hover:text-secondary">
                                    Live Match
                                </a>
                            )}
                            <a href="#/history" className="text-sm font-medium text-light-text dark:text-dark-text hover:text-primary dark:hover:text-secondary">
                                Match History
                            </a>
                            {match && match.gameState === GameState.IN_PROGRESS && (
                                <button 
                                    onClick={handleShare}
                                    disabled={isSharing}
                                    className="px-3 py-1.5 text-sm font-semibold rounded-md bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300 disabled:cursor-wait"
                                >
                                    {isSharing ? 'Generating...' : 'Share Match'}
                                </button>
                            )}
                            {renderSyncStatus()}
                            <ThemeToggleButton />
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={() => setDropdownOpen(o => !o)} className="flex items-center gap-2">
                                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card rounded-md shadow-lg py-1 z-20 border dark:border-gray-600">
                                        <div className="px-4 py-2 text-sm text-light-text dark:text-dark-text border-b dark:border-gray-600">
                                            <p className="font-bold">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={onLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </nav>

                        {/* Mobile Navigation Button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMenuOpen(o => !o)} aria-label="Open menu" className="p-2 rounded-full hover:bg-gray-500/10 dark:hover:bg-gray-400/10 transition-colors">
                                <MenuIcon className="w-7 h-7 text-light-text dark:text-dark-text"/>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Panel (Moved outside header) */}
            <div className={`fixed inset-0 z-50 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out bg-light-card dark:bg-dark-card md:hidden`}>
                <div className="flex justify-between items-center h-16 px-4 sm:px-6 border-b dark:border-gray-700">
                     <a href="#/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-primary dark:text-secondary font-bold text-xl">
                        <CricketBatIcon className="w-8 h-8"/>
                    </a>
                    <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <XIcon className="w-7 h-7 text-light-text dark:text-dark-text"/>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <nav className="flex flex-col items-start space-y-4 text-xl">
                        {match && match.gameState !== GameState.FINISHED && (
                             <a href="#/" onClick={() => setIsMenuOpen(false)} className="font-medium text-light-text dark:text-dark-text hover:text-primary dark:hover:text-secondary">
                                Live Match
                            </a>
                        )}
                        <a href="#/history" onClick={() => setIsMenuOpen(false)} className="font-medium text-light-text dark:text-dark-text hover:text-primary dark:hover:text-secondary">
                            Match History
                        </a>
                        {match && match.gameState === GameState.IN_PROGRESS && (
                            <button 
                                onClick={() => { handleShare(); setIsMenuOpen(false); }}
                                disabled={isSharing}
                                className="px-3 py-1.5 text-base font-semibold rounded-md bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300 disabled:cursor-wait"
                            >
                                {isSharing ? 'Generating...' : 'Share Match'}
                            </button>
                        )}
                    </nav>
                    <div className="border-t dark:border-gray-600 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-bold text-light-text dark:text-dark-text">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                             <ThemeToggleButton />
                        </div>
                        {renderSyncStatus()}
                        <button
                            onClick={onLogout}
                            className="w-full text-left px-4 py-3 text-lg font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;