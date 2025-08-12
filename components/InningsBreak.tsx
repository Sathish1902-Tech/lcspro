import React, { useState } from 'react';
import { MatchState, Innings, Team } from '../types';

interface InningsBreakProps {
  match: MatchState;
  onSetTargetAndStart: (targetRuns: number, targetOvers: number) => void;
  onCancelMatch: () => void;
}

const InningsBreak: React.FC<InningsBreakProps> = ({ match, onSetTargetAndStart, onCancelMatch }) => {
  const firstInnings = match.innings[0] as Innings;
  const battingTeam = match.team1.id === firstInnings.battingTeamId ? match.team1 : match.team2;
  const chasingTeam = match.team1.id !== firstInnings.battingTeamId ? match.team1 : match.team2;

  const defaultTargetRuns = firstInnings.score + 1;
  const defaultTargetOvers = match.maxOvers;

  const [showModal, setShowModal] = useState(false);
  const [customTargetRuns, setCustomTargetRuns] = useState(defaultTargetRuns);
  const [customTargetOvers, setCustomTargetOvers] = useState(defaultTargetOvers);

  const handleStartDefault = () => {
    onSetTargetAndStart(defaultTargetRuns, defaultTargetOvers);
  };
  
  const handleCancelMatch = () => {
    if (window.confirm('Are you sure you want to cancel this match? All progress will be lost and cannot be recovered.')) {
        onCancelMatch();
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSetTargetAndStart(customTargetRuns, customTargetOvers);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-lg bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 text-center space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-secondary">Innings Break</h1>
        
        <div className="text-lg">
          <p className="font-semibold text-light-text dark:text-dark-text">{battingTeam.name}'s Innings</p>
          <p className="text-4xl sm:text-5xl font-extrabold my-2">{firstInnings.score} - {firstInnings.wickets}</p>
          <p className="text-gray-600 dark:text-gray-400">in {firstInnings.overs}.{firstInnings.balls} overs</p>
        </div>

        <div className="border-t border-b border-gray-300 dark:border-gray-700 py-6 space-y-2">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text">{chasingTeam.name}'s Chase</h2>
            <p className="text-light-text dark:text-dark-text">Default Target: <span className="font-bold">{defaultTargetRuns}</span> runs in <span className="font-bold">{defaultTargetOvers}</span> overs.</p>
        </div>

        <div className="space-y-4">
            <button
              onClick={handleStartDefault}
              className="w-full bg-primary hover:bg-blue-800 dark:bg-secondary dark:hover:bg-amber-500 text-white dark:text-dark-bg font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
            >
              Start 2nd Innings
            </button>
            <button
                onClick={() => setShowModal(true)}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 text-light-text dark:text-dark-text font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
            >
                Set Custom Target
            </button>
            <button
                onClick={handleCancelMatch}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105"
            >
                Cancel Match
            </button>
        </div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCustomSubmit} className="w-full max-w-md bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-primary dark:text-secondary">Set Custom Target</h2>
            <div>
              <label htmlFor="targetRuns" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Target Runs</label>
              <input 
                type="number" 
                id="targetRuns" 
                value={customTargetRuns} 
                onChange={(e) => setCustomTargetRuns(parseInt(e.target.value, 10) || 0)}
                className="w-full text-center px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg text-2xl font-bold focus:ring-primary focus:border-primary dark:focus:ring-secondary dark:focus:border-secondary" 
                required 
                min="1"
              />
            </div>
            <div>
              <label htmlFor="targetOvers" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">In Overs</label>
              <input 
                type="number" 
                id="targetOvers" 
                value={customTargetOvers} 
                onChange={(e) => setCustomTargetOvers(parseInt(e.target.value, 10) || 0)}
                step="1"
                min="1"
                className="w-full text-center px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg text-2xl font-bold focus:ring-primary focus:border-primary dark:focus:ring-secondary dark:focus:border-secondary" 
                required 
              />
            </div>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Preview: {chasingTeam.name} need {customTargetRuns} runs in {customTargetOvers} overs.
            </p>
            <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="w-full py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-light-text dark:text-dark-text font-semibold">Cancel</button>
                <button type="submit" className="w-full py-2 rounded-lg bg-primary dark:bg-secondary text-white font-bold">Confirm Target</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InningsBreak;