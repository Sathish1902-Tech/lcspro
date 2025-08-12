import React, { useState, useEffect } from 'react';
import { Player } from '../types';

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerId: string, newName: string) => void;
  player: Player | null;
}

const EditPlayerModal: React.FC<EditPlayerModalProps> = ({ isOpen, onClose, onSubmit, player }) => {
  const [name, setName] = useState('');
  
  useEffect(() => {
    if (player) {
      setName(player.name);
    }
  }, [player]);

  if (!isOpen || !player) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(name.trim()) {
      onSubmit(player.id, name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary dark:text-secondary">Edit Player Name</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Player Name</label>
            <input 
              type="text" 
              id="playerName" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:focus:ring-secondary dark:focus:border-secondary" 
              required 
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="w-full py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-light-text dark:text-dark-text font-semibold">Cancel</button>
            <button type="submit" className="w-full py-2 rounded-lg bg-primary dark:bg-secondary text-white font-bold">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlayerModal;