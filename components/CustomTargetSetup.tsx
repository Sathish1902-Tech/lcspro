import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { ChevronDownIcon } from './icons';

interface CustomTargetSetupProps {
  onChaseStart: (chasingTeamName: string, chasingTeamPlayers: Player[], bowlingTeamName: string, bowlingTeamPlayers: Player[], target: number, overs: number) => void;
}

const PlayerListEditor: React.FC<{ teamName: string; players: Player[]; onPlayerNameChange: (index: number, newName: string) => void; }> = ({ teamName, players, onPlayerNameChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-light-text dark:text-dark-text"
                aria-expanded={isOpen}
                aria-controls={`player-list-${teamName.replace(/\s+/g, '-')}`}
            >
                Edit {teamName} Players
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div id={`player-list-${teamName.replace(/\s+/g, '-')}`} className="p-4 border-t border-gray-300 dark:border-gray-600 space-y-3 max-h-60 overflow-y-auto">
                    {players.map((player, index) => (
                        <div key={player.id} className="flex items-center gap-2">
                            <label htmlFor={`player-${player.id}`} className="w-8 text-sm text-gray-500 dark:text-gray-400">{index + 1}.</label>
                            <input
                                id={`player-${player.id}`}
                                type="text"
                                value={player.name}
                                onChange={(e) => onPlayerNameChange(index, e.target.value)}
                                className="w-full px-3 py-1.5 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:focus:ring-secondary dark:focus:border-secondary"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CustomTargetSetup: React.FC<CustomTargetSetupProps> = ({ onChaseStart }) => {
  const [chasingTeamName, setChasingTeamName] = useState('Chasing Team');
  const [bowlingTeamName, setBowlingTeamName] = useState('Bowling Team');
  const [target, setTarget] = useState(151);
  const [overs, setOvers] = useState(20);
  const [chasingTeamPlayers, setChasingTeamPlayers] = useState<Player[]>([]);
  const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState<Player[]>([]);

  const generatePlayersForSetup = (teamName: string, teamIdPrefix: string, count: number): Player[] => {
    const players: Player[] = [];
    for (let i = 0; i < count; i++) {
        players.push({ id: `${teamIdPrefix}${i + 1}`, name: `${teamName} ${i + 1}` });
    }
    return players;
  };

  useEffect(() => {
    setChasingTeamPlayers(generatePlayersForSetup(chasingTeamName || 'Chasing Team', 't1p', 11));
  }, [chasingTeamName]);

  useEffect(() => {
    setBowlingTeamPlayers(generatePlayersForSetup(bowlingTeamName || 'Bowling Team', 't2p', 11));
  }, [bowlingTeamName]);

  const handlePlayerNameChange = (team: 'chasing' | 'bowling', index: number, newName: string) => {
    const setter = team === 'chasing' ? setChasingTeamPlayers : setBowlingTeamPlayers;
    setter(currentPlayers => {
        const updatedPlayers = [...currentPlayers];
        updatedPlayers[index] = { ...updatedPlayers[index], name: newName };
        return updatedPlayers;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chasingTeamName.trim() && bowlingTeamName.trim() && target > 0 && overs > 0) {
      onChaseStart(chasingTeamName.trim(), chasingTeamPlayers, bowlingTeamName.trim(), bowlingTeamPlayers, target, overs);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-lg bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-primary dark:text-secondary">Score a Chase</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="chasingTeam" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Chasing Team</label>
              <input type="text" id="chasingTeam" value={chasingTeamName} onChange={(e) => setChasingTeamName(e.target.value)} className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg" required />
            </div>
            <div>
              <label htmlFor="bowlingTeam" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Bowling Team</label>
              <input type="text" id="bowlingTeam" value={bowlingTeamName} onChange={(e) => setBowlingTeamName(e.target.value)} className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg" required />
            </div>
          </div>
          
          <div className="space-y-4">
              <PlayerListEditor teamName={chasingTeamName || 'Chasing Team'} players={chasingTeamPlayers} onPlayerNameChange={(index, name) => handlePlayerNameChange('chasing', index, name)} />
              <PlayerListEditor teamName={bowlingTeamName || 'Bowling Team'} players={bowlingTeamPlayers} onPlayerNameChange={(index, name) => handlePlayerNameChange('bowling', index, name)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Target</label>
              <input type="number" id="target" value={target} onChange={(e) => setTarget(parseInt(e.target.value))} min="1" className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg" required />
            </div>
            <div>
              <label htmlFor="overs" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Overs</label>
              <input type="number" id="overs" value={overs} onChange={(e) => setOvers(parseInt(e.target.value))} min="1" max="100" className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg" required />
            </div>
          </div>

          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              {chasingTeamName} needs {target} runs in {overs} overs to win.
          </p>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105">
            Start Chase
          </button>
           <div className="text-center pt-4">
                <a href="#/" className="text-sm text-primary dark:text-secondary hover:underline">
                    &larr; Back to Home
                </a>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CustomTargetSetup;