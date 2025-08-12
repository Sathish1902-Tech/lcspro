import React, { useState, useEffect } from 'react';
import { MatchState, Innings } from '../types';

interface MatchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (maxOvers: number, target?: number, targetOvers?: number) => void;
  match: MatchState;
}

const MatchSettingsModal: React.FC<MatchSettingsModalProps> = ({ isOpen, onClose, onSave, match }) => {
  const [maxOvers, setMaxOvers] = useState(match.maxOvers);
  const [target, setTarget] = useState(match.target || 0);
  const [targetOvers, setTargetOvers] = useState(match.targetOvers || match.maxOvers);
  
  useEffect(() => {
    if (isOpen) {
        setMaxOvers(match.maxOvers);
        setTarget(match.target || 0);
        setTargetOvers(match.targetOvers || match.maxOvers);
    }
  }, [isOpen, match]);

  if (!isOpen) return null;
  
  const currentInnings = match.innings[match.currentInnings - 1] as Innings;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(maxOvers, match.currentInnings === 2 ? target : undefined, match.currentInnings === 2 ? targetOvers : undefined);
  };
  
  const oversAlreadyBowled = currentInnings.overs + (currentInnings.balls > 0 ? 1 : 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary dark:text-secondary">Match Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="maxOvers" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Maximum Overs</label>
            <input 
              type="number" 
              id="maxOvers" 
              value={maxOvers} 
              onChange={(e) => setMaxOvers(parseInt(e.target.value))} 
              className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg"
              min={oversAlreadyBowled}
              required 
            />
            <p className="text-xs text-gray-500 mt-1">Cannot be less than overs already bowled in an innings ({oversAlreadyBowled - 1} overs completed).</p>
          </div>
          
          {match.currentInnings === 2 && (
            <>
                <div>
                    <label htmlFor="targetRuns" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Target Runs</label>
                    <input 
                    type="number" 
                    id="targetRuns" 
                    value={target} 
                    onChange={(e) => setTarget(parseInt(e.target.value))} 
                    className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg"
                    min="1"
                    required 
                    />
                </div>
                <div>
                    <label htmlFor="targetOvers" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Target Overs</label>
                    <input 
                    type="number" 
                    id="targetOvers" 
                    value={targetOvers} 
                    onChange={(e) => setTargetOvers(parseInt(e.target.value))} 
                    className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg"
                    min={oversAlreadyBowled}
                    required 
                    />
                </div>
            </>
          )}
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="w-full py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-light-text dark:text-dark-text font-semibold">Cancel</button>
            <button type="submit" className="w-full py-2 rounded-lg bg-primary dark:bg-secondary text-white font-bold">Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchSettingsModal;