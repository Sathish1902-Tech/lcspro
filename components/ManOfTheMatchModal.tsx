import React, { useState, useEffect, useMemo } from 'react';
import { MatchState, Player, Innings, Batsman, Bowler } from '../types';

interface PlayerStats extends Player {
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    wickets: number;
    runsConceded: number;
    oversBowled: string;
}

interface ManOfTheMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (playerId: string) => void;
  match: MatchState;
}

const ManOfTheMatchModal: React.FC<ManOfTheMatchModalProps> = ({ isOpen, onClose, onConfirm, match }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

    const allPlayersStats = useMemo(() => {
        const statsMap = new Map<string, PlayerStats>();
        const allPlayers = [...match.team1.players, ...match.team2.players];

        allPlayers.forEach(p => {
            statsMap.set(p.id, {
                ...p,
                runs: 0,
                ballsFaced: 0,
                fours: 0,
                sixes: 0,
                wickets: 0,
                runsConceded: 0,
                oversBowled: '0.0'
            });
        });
        
        match.innings.forEach(inning => {
            const fullInning = inning as Innings;
            if(!fullInning.batsmen) return;

            fullInning.batsmen.forEach((batsman: Batsman) => {
                const stat = statsMap.get(batsman.id);
                if (stat) {
                    stat.runs += batsman.runs;
                    stat.ballsFaced += batsman.balls;
                    stat.fours += batsman.fours;
                    stat.sixes += batsman.sixes;
                }
            });

            fullInning.bowlers.forEach((bowler: Bowler) => {
                 const stat = statsMap.get(bowler.id);
                 if (stat) {
                    stat.wickets += bowler.wickets;
                    stat.runsConceded += bowler.runsConceded;
                    stat.oversBowled = `${bowler.overs}.${bowler.balls}`;
                 }
            });
        });
        
        return Array.from(statsMap.values()).sort((a,b) => b.runs - a.runs || b.wickets - a.wickets);

    }, [match]);

    useEffect(() => {
        if(isOpen && allPlayersStats.length > 0 && !selectedPlayerId) {
            setSelectedPlayerId(allPlayersStats[0].id);
        }
    }, [isOpen, allPlayersStats, selectedPlayerId]);


    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(selectedPlayerId){
            onConfirm(selectedPlayerId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 w-full max-w-lg space-y-6 max-h-[90vh] flex flex-col">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary dark:text-secondary flex-shrink-0">Man of the Match</h2>
                <form onSubmit={handleSubmit} className="space-y-4 flex-grow overflow-y-auto">
                    <div className="space-y-2 pr-2">
                        {allPlayersStats.map(player => (
                            <label key={player.id} className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${selectedPlayerId === player.id ? 'bg-primary/20 dark:bg-secondary/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                <input
                                    type="radio"
                                    name="motm-player"
                                    value={player.id}
                                    checked={selectedPlayerId === player.id}
                                    onChange={() => setSelectedPlayerId(player.id)}
                                    className="h-5 w-5 text-primary focus:ring-primary dark:text-secondary dark:focus:ring-secondary"
                                />
                                <div className="flex-grow">
                                    <p className="font-bold text-light-text dark:text-dark-text">{player.name}</p>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-3">
                                        {(player.runs > 0 || player.ballsFaced > 0) && <span>Bat: {player.runs}({player.ballsFaced})</span>}
                                        {(player.wickets > 0 || parseFloat(player.oversBowled.replace('.','')) > 0) && <span>Bowl: {player.wickets}/{player.runsConceded} ({player.oversBowled})</span>}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-4 pt-4 flex-shrink-0">
                        <button type="button" onClick={onClose} className="w-full py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-light-text dark:text-dark-text font-semibold">Decide Later</button>
                        <button type="submit" className="w-full py-2 rounded-lg bg-primary dark:bg-secondary text-white font-bold">Confirm Award</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManOfTheMatchModal;