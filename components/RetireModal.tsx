import React, { useState, useEffect } from 'react';
import { Player } from '../types';

interface RetireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeclareRetirement: (outPlayerId: string) => void;
  batsmen: Player[];
}

const RetireModal: React.FC<RetireModalProps> = ({ isOpen, onClose, onDeclareRetirement, batsmen }) => {
  const [outPlayerId, setOutPlayerId] = useState<string>('');
  
  useEffect(() => {
    if (isOpen && batsmen.length > 0) {
      setOutPlayerId(batsmen[0].id);
    }
  }, [isOpen, batsmen]);

  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(outPlayerId) {
      onDeclareRetirement(outPlayerId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-yellow-500">Retire Batsman</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Select Batsman to Retire</label>
            <select value={outPlayerId} onChange={e => setOutPlayerId(e.target.value)} className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg">
              {batsmen.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="w-full py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-light-text dark:text-dark-text font-semibold">Cancel</button>
            <button type="submit" className="w-full py-2 rounded-lg bg-yellow-500 text-white font-bold">Confirm Retirement</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RetireModal;