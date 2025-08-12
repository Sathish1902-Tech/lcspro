import React, { useState, useEffect } from 'react';
import { DismissalType, Player } from '../types';

interface WicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeclareWicket: (dismissalType: DismissalType, outPlayerId: string, fielderId?: string, runsOnDismissal?: number) => void;
  batsmen: Player[];
  bowler: Player;
  fieldingTeam: Player[];
}

const WicketModal: React.FC<WicketModalProps> = ({ isOpen, onClose, onDeclareWicket, batsmen, bowler, fieldingTeam }) => {
  const [dismissalType, setDismissalType] = useState<DismissalType>(DismissalType.BOWLED);
  const [outPlayerId, setOutPlayerId] = useState<string>('');
  const [fielderId, setFielderId] = useState<string>('');
  const [runsOnDismissal, setRunsOnDismissal] = useState(0);

  const standardDismissals = Object.values(DismissalType).filter(
    type => type !== DismissalType.RETIRED_OUT && type !== DismissalType.TIMED_OUT
  );
  
  useEffect(() => {
    if (batsmen.length > 0) {
      setOutPlayerId(batsmen[0].id);
    }
    setRunsOnDismissal(0); // Reset on open
  }, [isOpen, batsmen]);

  if (!isOpen) return null;

  const needsFielder = [DismissalType.CAUGHT, DismissalType.RUN_OUT, DismissalType.STUMPED].includes(dismissalType);
  const isRunOut = dismissalType === DismissalType.RUN_OUT;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(outPlayerId) {
      onDeclareWicket(dismissalType, outPlayerId, needsFielder ? fielderId : undefined, isRunOut ? runsOnDismissal : undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-red-500">Wicket Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Batsman Out</label>
            <select value={outPlayerId} onChange={e => setOutPlayerId(e.target.value)} className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg">
              {batsmen.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">How Out?</label>
            <select value={dismissalType} onChange={e => setDismissalType(e.target.value as DismissalType)} className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg">
              {standardDismissals.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          {needsFielder && (
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Fielder</label>
              <select value={fielderId} onChange={e => setFielderId(e.target.value)} className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg">
                <option value="">Select Fielder...</option>
                 {fieldingTeam.filter(p => p.id !== bowler?.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {isRunOut && (
             <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Runs Completed Before Wicket</label>
              <input type="number" value={runsOnDismissal} onChange={e => setRunsOnDismissal(parseInt(e.target.value) || 0)} min="0" className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg"/>
            </div>
          )}
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="w-full py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-light-text dark:text-dark-text font-semibold">Cancel</button>
            <button type="submit" className="w-full py-2 rounded-lg bg-red-500 text-white font-bold">Declare Wicket</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WicketModal;