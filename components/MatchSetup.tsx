
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { ChevronDownIcon } from './icons';

interface MatchSetupProps {
  onMatchStart: (team1Name: string, team1Players: Player[], team2Name: string, team2Players: Player[], overs: number, tossWinner: string, tossDecision: 'BAT' | 'BOWL') => void;
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


const MatchSetup: React.FC<MatchSetupProps> = ({ onMatchStart }) => {
  const [team1Name, setTeam1Name] = useState('Team A');
  const [team2Name, setTeam2Name] = useState('Team B');
  const [overs, setOvers] = useState(20);
  const [tossWinner, setTossWinner] = useState('Team A');
  const [tossDecision, setTossDecision] = useState<'BAT' | 'BOWL'>('BAT');
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);
  
  const [prevTeam1Name, setPrevTeam1Name] = useState(team1Name);
  const [prevTeam2Name, setPrevTeam2Name] = useState(team2Name);

  const generatePlayersForSetup = (teamName: string, teamIdPrefix: string, count: number): Player[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `${teamIdPrefix}${i + 1}`,
      name: `${teamName} ${i + 1}`,
    }));
  };

  useEffect(() => {
    setTeam1Players(currentPlayers => {
        if (currentPlayers.length === 0) {
            return generatePlayersForSetup(team1Name || 'Team A', 't1p', 11);
        }
        const oldDefaultPrefix = prevTeam1Name || 'Team A';
        const newDefaultPrefix = team1Name || 'Team A';
        if (oldDefaultPrefix === newDefaultPrefix) return currentPlayers;

        return currentPlayers.map((player, index) => {
            const oldDefaultName = `${oldDefaultPrefix} ${index + 1}`;
            if (player.name === oldDefaultName) {
                return { ...player, name: `${newDefaultPrefix} ${index + 1}` };
            }
            return player;
        });
    });
    setPrevTeam1Name(team1Name);
  }, [team1Name]);

  useEffect(() => {
      setTeam2Players(currentPlayers => {
          if (currentPlayers.length === 0) {
              return generatePlayersForSetup(team2Name || 'Team B', 't2p', 11);
          }
          const oldDefaultPrefix = prevTeam2Name || 'Team B';
          const newDefaultPrefix = team2Name || 'Team B';
          if (oldDefaultPrefix === newDefaultPrefix) return currentPlayers;

          return currentPlayers.map((player, index) => {
              const oldDefaultName = `${oldDefaultPrefix} ${index + 1}`;
              if (player.name === oldDefaultName) {
                  return { ...player, name: `${newDefaultPrefix} ${index + 1}` };
              }
              return player;
          });
      });
      setPrevTeam2Name(team2Name);
  }, [team2Name]);

  const handlePlayerNameChange = (team: 'team1' | 'team2', index: number, newName: string) => {
    const setter = team === 'team1' ? setTeam1Players : setTeam2Players;
    setter(currentPlayers => {
        const updatedPlayers = [...currentPlayers];
        updatedPlayers[index] = { ...updatedPlayers[index], name: newName };
        return updatedPlayers;
    });
  };

  const handleTeamNameChange = (team: 'team1' | 'team2', newName: string) => {
      if (team === 'team1') {
          if (tossWinner === team1Name) {
              setTossWinner(newName || 'Team A');
          }
          setTeam1Name(newName);
      } else {
          if (tossWinner === team2Name) {
              setTossWinner(newName || 'Team B');
          }
          setTeam2Name(newName);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (team1Name.trim() && team2Name.trim() && overs > 0) {
      onMatchStart(team1Name.trim(), team1Players, team2Name.trim(), team2Players, overs, tossWinner, tossDecision);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-lg bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-primary dark:text-secondary">New Cricket Match</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="team1" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Team 1</label>
              <input type="text" id="team1" value={team1Name} onChange={(e) => handleTeamNameChange('team1', e.target.value)} className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:focus:ring-secondary dark:focus:border-secondary" required />
            </div>
            <div>
              <label htmlFor="team2" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Team 2</label>
              <input type="text" id="team2" value={team2Name} onChange={(e) => handleTeamNameChange('team2', e.target.value)} className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:focus:ring-secondary dark:focus:border-secondary" required />
            </div>
          </div>
          
          <div className="space-y-4">
              <PlayerListEditor teamName={team1Name || 'Team 1'} players={team1Players} onPlayerNameChange={(index, name) => handlePlayerNameChange('team1', index, name)} />
              <PlayerListEditor teamName={team2Name || 'Team 2'} players={team2Players} onPlayerNameChange={(index, name) => handlePlayerNameChange('team2', index, name)} />
          </div>

          <div>
            <label htmlFor="overs" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Overs</label>
            <input type="number" id="overs" value={overs} onChange={(e) => setOvers(parseInt(e.target.value))} min="1" max="100" className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:focus:ring-secondary dark:focus:border-secondary" required />
          </div>

          <fieldset className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <legend className="px-2 text-lg font-semibold text-light-text dark:text-dark-text">Toss</legend>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Who won?</label>
                <select value={tossWinner} onChange={(e) => setTossWinner(e.target.value)} className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:focus:ring-secondary dark:focus:border-secondary">
                  <option value={team1Name || 'Team A'}>{team1Name || 'Team A'}</option>
                  <option value={team2Name || 'Team B'}>{team2Name || 'Team B'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Decision</label>
                <div className="flex space-x-4">
                  <button type="button" onClick={() => setTossDecision('BAT')} className={`w-full py-2 rounded-lg transition-colors ${tossDecision === 'BAT' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Bat</button>
                  <button type="button" onClick={() => setTossDecision('BOWL')} className={`w-full py-2 rounded-lg transition-colors ${tossDecision === 'BOWL' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Bowl</button>
                </div>
              </div>
            </div>
          </fieldset>

          <button type="submit" className="w-full bg-primary hover:bg-blue-800 dark:bg-secondary dark:hover:bg-amber-500 text-white dark:text-dark-bg font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105">
            Start Match
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

export default MatchSetup;
