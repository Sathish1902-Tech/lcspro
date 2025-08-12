import React from 'react';
import { MatchState } from '../types';

interface MatchHistoryProps {
    history: MatchState[];
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">No Match History</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Completed matches will appear here.</p>
                     <a
                        href="#/"
                        className="mt-6 inline-block bg-primary hover:bg-blue-800 dark:bg-secondary dark:hover:bg-amber-500 text-white dark:text-dark-bg font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
                    >
                        Start a New Match
                    </a>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                 <h1 className="text-3xl sm:text-4xl font-bold text-center text-primary dark:text-secondary mb-8">Match History</h1>
                {history.map(match => (
                    <div key={match.id} className="bg-light-card dark:bg-dark-card rounded-xl shadow-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                           <div>
                             <h3 className="text-lg sm:text-xl font-bold">{match.team1.name} vs {match.team2.name}</h3>
                             <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(parseInt(match.id.substring(1))).toLocaleDateString()}
                             </p>
                           </div>
                            <a href={`#/summary/${match.id}`} className="mt-4 sm:mt-0 px-4 py-2 text-sm font-semibold rounded-md bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary hover:bg-primary/20 dark:hover:bg-secondary/30">
                                View Scorecard
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatchHistory;