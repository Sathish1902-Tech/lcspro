import React, { useState, useEffect } from 'react';
import { Player, Team } from '../types';

interface NewBowlerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bowlerId: string) => void;
  fieldingTeam: Team;
  currentBowlerId: string;
}

const NewBowlerModal: React.FC<NewBowlerModalProps> = ({ isOpen, onClose, onSubmit, fieldingTeam, currentBowlerId }) => {
  const [selectedBowlerId, setSelectedBowlerId] = useState<string>('');
  
  const availableBowlers = fieldingTeam.players.filter(p => p.id !== currentBowlerId);

  useEffect(() => {
    // This effect should only run when the modal is opened.
    // It sets the default bowler. Subsequent re-renders while the modal is open
    // should not re-trigger this effect and reset the user's selection.
    if (isOpen && availableBowlers.length > 0) {
      setSelectedBowlerId(availableBowlers[0].id);
    }
  }, [isOpen]); // Corrected dependency array

  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedBowlerId) {
      onSubmit(selectedBowlerId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary dark:text-secondary">Select New Bowler</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Over Complete! Who's bowling next?</label>
            <select value={selectedBowlerId} onChange={e => setSelectedBowlerId(e.target.value)} className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg">
              {availableBowlers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button type="submit" className="w-full py-3 rounded-lg bg-primary dark:bg-secondary text-white font-bold">Confirm Bowler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBowlerModal;