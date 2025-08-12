


import React, { useState, useEffect } from 'react';
import { MatchState, GameState } from '../types';
import Scoreboard from './Scoreboard';
import Summary from './Summary';
import { GoogleGenAI, Type } from '@google/genai';

interface SpectatorViewProps {}

export const SpectatorView: React.FC<SpectatorViewProps> = () => {
    const [match, setMatch] = useState<MatchState | null>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isScorecardModalOpen, setScorecardModalOpen] = useState(false);

    useEffect(() => {
        const decompressAndSetMatch = async () => {
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            const compressedData = params.get('data');

            if (!compressedData) {
                setError("No match data found in the URL. The link may be incomplete or invalid.");
                setIsLoading(false);
                return;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const decodedData = decodeURIComponent(compressedData);
                const prompt = `Decompress the following string and return it as a JSON object under the key "matchData". Provide only the raw JSON. Compressed data: ${decodedData}`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        temperature: 0,
                        thinkingConfig: { thinkingBudget: 0 },
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                matchData: {
                                    type: Type.OBJECT,
                                    description: "The decompressed match state JSON object."
                                }
                            },
                            required: ["matchData"]
                        }
                    }
                });

                if (!response || !response.text) {
                    throw new Error("Received an empty response from the API.");
                }

                const result = JSON.parse(response.text);
                if (!result.matchData) {
                    throw new Error("API response did not contain the expected matchData object.");
                }
                const matchData = result.matchData as MatchState;
                setMatch(matchData);

            } catch (e) {
                console.error("Error decompressing match data:", e);
                setError("Could not load match data from the link. It might be corrupted, invalid, or there was a connection issue.");
            } finally {
                setIsLoading(false);
            }
        };
        
        decompressAndSetMatch();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-4 sm:p-8 flex items-center justify-center">
                <div className="max-w-2xl mx-auto space-y-4 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-secondary mb-6">Shared Match View</h1>
                    <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-primary dark:text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="font-semibold">Loading and decompressing match data...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (match && match.gameState === GameState.FINISHED) {
        return <Summary match={match} isSpectatorView={true} />;
    }

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-4 sm:p-8">
            <div className="max-w-2xl mx-auto space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-center text-primary dark:text-secondary mb-6">Shared Match View</h1>
                {error && !match && (
                    <div className="text-center p-6 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                        <p className="font-semibold text-yellow-700 dark:text-yellow-300">{error}</p>
                    </div>
                )}
                {match ? (
                    <>
                        <Scoreboard match={match} />
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-center text-sm text-blue-800 dark:text-blue-200">
                           This is a shared snapshot of the match. For live updates, the scorer needs to share a new link.
                        </div>
                        <button
                            onClick={() => setScorecardModalOpen(true)}
                            className="w-full h-12 rounded-lg font-bold text-base sm:text-lg bg-indigo-600 text-white transition-colors"
                        >
                            View Full Scorecard
                        </button>
                    </>
                ) : (
                    !error && <div className="text-center font-semibold">Could not load match data.</div>
                )}
            </div>

            {isScorecardModalOpen && match && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-y-auto">
                    <div className="relative">
                        <button onClick={() => setScorecardModalOpen(false)} className="fixed top-4 right-4 z-50 bg-white text-black rounded-full h-10 w-10 flex items-center justify-center font-bold text-xl shadow-lg">
                            &times;
                        </button>
                        <Summary 
                            match={match} 
                            isSpectatorView={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
