import React, { useState, useEffect } from 'react';
import { Player, Team, Batsman } from '../types';

interface NextBatsmanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (batsmanId: string | null) => void;
  battingTeam: Team;
  batsmenInMatch: Batsman[];
}

const NextBatsmanModal: React.FC<NextBatsmanModalProps> = ({ isOpen, onClose, onSubmit, battingTeam, batsmenInMatch }) => {
  const [selectedBatsmanId, setSelectedBatsmanId] = useState<string>('');
  
  const batsmenAlreadyInIds = new Set(batsmenInMatch.map(b => b.id));
  const availableBatsmen = battingTeam.players.filter(p => !batsmenAlreadyInIds.has(p.id));

  useEffect(() => {
    if (isOpen && availableBatsmen.length > 0) {
        setSelectedBatsmanId(availableBatsmen[0].id);
    } else if (isOpen) {
        setSelectedBatsmanId('');
    }
  }, [isOpen]);


  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedBatsmanId) {
      onSubmit(selectedBatsmanId);
    } else if (availableBatsmen.length === 0) {
      // If no one is left, we still need to process the wicket to end the innings.
      onSubmit(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary dark:text-secondary">Select Next Batsman</h2>
        {availableBatsmen.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Who's coming in to bat?</label>
              <select value={selectedBatsmanId} onChange={e => setSelectedBatsmanId(e.target.value)} className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg">
                {availableBatsmen.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} className="w-full py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-light-text dark:text-dark-text font-semibold">Cancel</button>
              <button type="submit" className="w-full py-2 rounded-lg bg-primary dark:bg-secondary text-white font-bold">Confirm Batsman</button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-light-text dark:text-dark-text mb-4">No more batsmen available. All out.</p>
            <button onClick={() => onSubmit(null)} className="w-full py-2 rounded-lg bg-primary dark:bg-secondary text-white font-bold">Confirm & End Innings</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NextBatsmanModal;