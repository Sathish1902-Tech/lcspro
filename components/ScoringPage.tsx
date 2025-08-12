import React, { useState, useCallback, useEffect } from 'react';
import { MatchState, GameState, Team, Player, Innings, DismissalType, Batsman, Bowler } from '../types';
import Scoreboard from './Scoreboard';
import ScoringControls from './ScoringControls';
import WicketModal from './WicketModal';
import RetireModal from './RetireModal';
import Summary from './Summary';
import NextBatsmanModal from './NextBatsmanModal';
import NewBowlerModal from './NewBowlerModal';
import EditPlayerModal from './EditPlayerModal';
import MatchSettingsModal from './MatchSettingsModal';

interface ScoringPageProps {
    match: MatchState;
    setMatch: (match: MatchState) => void;
    onEndInnings: (match: MatchState) => void;
    onCancelMatch: () => void;
}

const ScoringPage: React.FC<ScoringPageProps> = ({ match, setMatch, onEndInnings, onCancelMatch }) => {
    const historyKey = `scorer-history-${match.id}`;

    const [history, setHistory] = useState<MatchState[]>(() => {
        try {
            const savedHistory = sessionStorage.getItem(historyKey);
            if (savedHistory) {
                const parsedHistory = JSON.parse(savedHistory) as MatchState[];
                if (parsedHistory.length > 0) {
                    const lastStateInHistory = parsedHistory[parsedHistory.length - 1];
                    if (lastStateInHistory.id === match.id && lastStateInHistory.currentInnings === match.currentInnings) {
                        return parsedHistory; 
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load history from session storage", error);
        }
        return [match];
    });
    
    useEffect(() => {
        setHistory(currentHistory => {
            if (currentHistory.length === 0) return [match];
            const latestStateInHistory = currentHistory[currentHistory.length - 1];
            if (latestStateInHistory && latestStateInHistory.id === match.id && latestStateInHistory.currentInnings !== match.currentInnings) {
                return [match];
            }
            return currentHistory;
        });
    }, [match.currentInnings, match.id]);


    useEffect(() => {
        try {
            sessionStorage.setItem(historyKey, JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save history to session storage", error);
        }
    }, [history, historyKey]);

    
    // Modal States
    const [isWicketModalOpen, setWicketModalOpen] = useState(false);
    const [isRetireModalOpen, setRetireModalOpen] = useState(false);
    const [isScorecardModalOpen, setScorecardModalOpen] = useState(false);
    const [isNextBatsmanModalOpen, setNextBatsmanModalOpen] = useState(false);
    const [isNewBowlerModalOpen, setNewBowlerModalOpen] = useState(false);
    const [isEditPlayerModalOpen, setEditPlayerModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

    // Data for Modals
    const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
    const [wicketInfo, setWicketInfo] = useState<{ dismissalType: DismissalType, outPlayerId: string, fielderId?: string, runsOnDismissal?: number } | null>(null);
    const [retirementInfo, setRetirementInfo] = useState<{ outPlayerId: string } | null>(null);


    const updateMatchState = useCallback((updater: (draft: MatchState) => void) => {
        setHistory(currentHistory => {
            const latestMatch = currentHistory[currentHistory.length - 1];
            if (!latestMatch) {
                console.error("Cannot update state, history is empty.");
                return currentHistory;
            }
            const newState = JSON.parse(JSON.stringify(latestMatch)) as MatchState;
            updater(newState);
            setMatch(newState);
            return [...currentHistory, newState];
        });
    }, [setMatch]);
    
    // Centralized check for end of match
    useEffect(() => {
        const latestMatchState = history[history.length - 1];
        if (!latestMatchState || latestMatchState.gameState !== GameState.IN_PROGRESS) return;

        const currentInnings = latestMatchState.innings[latestMatchState.currentInnings - 1] as Innings;
        
        // 1. Check for win by target reached
        if (latestMatchState.currentInnings === 2 && latestMatchState.target && currentInnings.score >= latestMatchState.target) {
            onEndInnings(latestMatchState);
            return;
        }

        const isAllOut = currentInnings.wickets >= 10;

        const maxOversForInnings = latestMatchState.currentInnings === 1
            ? latestMatchState.maxOvers
            : (latestMatchState.targetOvers || latestMatchState.maxOvers);
        const oversFinished = currentInnings.overs >= maxOversForInnings;

        if(isAllOut || oversFinished) {
            onEndInnings(latestMatchState);
            return;
        }
    }, [history, onEndInnings]);


    const handleUndo = () => {
        if (history.length <= 1) return;
        const newHistory = history.slice(0, -1);
        setHistory(newHistory);
        setMatch(newHistory.length > 0 ? newHistory[newHistory.length - 1] : match);
    };

    const handleCancelMatch = () => {
        if (window.confirm('Are you sure you want to cancel this match? All progress will be lost and cannot be recovered.')) {
            onCancelMatch();
        }
    };
    
    const swapStrike = (currentInnings: Innings) => {
        const striker = currentInnings.batsmen.find(b => b.id === currentInnings.currentStrikerId);
        const nonStriker = currentInnings.batsmen.find(b => b.id === currentInnings.currentNonStrikerId);
        if (striker) striker.onStrike = false;
        if (nonStriker) nonStriker.onStrike = true;
        [currentInnings.currentStrikerId, currentInnings.currentNonStrikerId] = [currentInnings.currentNonStrikerId, currentInnings.currentStrikerId];
    };

    const handleSwapStrike = () => {
        updateMatchState(draft => {
            const currentInnings = draft.innings[draft.currentInnings - 1] as Innings;
            swapStrike(currentInnings);
        });
    };

    const handleRun = (runs: number) => {
        const latestMatch = history[history.length - 1];
        const currentInnings = latestMatch.innings[latestMatch.currentInnings - 1] as Innings;
        if (currentInnings.balls >= 6) {
            setNewBowlerModalOpen(true);
            return;
        }

        updateMatchState(draft => {
            const currentInnings = draft.innings[draft.currentInnings - 1] as Innings;
            currentInnings.score += runs;
            
            const striker = currentInnings.batsmen.find(b => b.id === currentInnings.currentStrikerId);
            if (striker) {
                striker.runs += runs;
                striker.balls += 1;
                if (runs === 4) striker.fours++;
                if (runs === 6) striker.sixes++;
            }

            const bowler = currentInnings.bowlers.find(b => b.id === currentInnings.currentBowlerId);
            if(bowler) {
                bowler.runsConceded += runs;
                bowler.balls += 1;
            }

            currentInnings.balls += 1;
            currentInnings.timeline[currentInnings.timeline.length - 1].push(runs);

            if (runs % 2 !== 0) {
                swapStrike(currentInnings);
            }
        });
    };
    
    const handleExtra = (type: 'Wd' | 'Nb' | 'B' | 'Lb', runs: number) => {
        const isLegalDelivery = type === 'B' || type === 'Lb';
        if (isLegalDelivery) {
            const latestMatch = history[history.length - 1];
            const currentInnings = latestMatch.innings[latestMatch.currentInnings - 1] as Innings;
            if (currentInnings.balls >= 6) {
                setNewBowlerModalOpen(true);
                return;
            }
        }

        updateMatchState(draft => {
            const currentInnings = draft.innings[draft.currentInnings - 1] as Innings;
            const bowler = currentInnings.bowlers.find(b => b.id === currentInnings.currentBowlerId);
            const striker = currentInnings.batsmen.find(b => b.id === currentInnings.currentStrikerId);

            currentInnings.timeline[currentInnings.timeline.length - 1].push(`${runs > 0 ? runs : ''}${type}`);

            if (type === 'Wd' || type === 'Nb') {
                const totalRuns = 1 + runs;
                currentInnings.score += totalRuns;
                if (bowler) bowler.runsConceded += totalRuns;
                if (type === 'Wd') currentInnings.extras.wides += totalRuns;
                if (type === 'Nb') {
                    currentInnings.extras.noBalls += 1;
                    if (striker) {
                        striker.runs += runs;
                        if (runs === 4) striker.fours++;
                        if (runs === 6) striker.sixes++;
                    }
                }
            } else { // Byes or Leg Byes
                currentInnings.score += runs;
                if (type === 'B') currentInnings.extras.byes += runs;
                if (type === 'Lb') currentInnings.extras.legByes += runs;
                currentInnings.balls += 1;
                if (striker) striker.balls += 1;
                if (bowler) bowler.balls += 1;
            }
            
            if (runs % 2 !== 0) {
                swapStrike(currentInnings);
            }
        });
    };

    const handleDeclareWicket = (dismissalType: DismissalType, outPlayerId: string, fielderId?: string, runsOnDismissal?: number) => {
        setWicketInfo({ dismissalType, outPlayerId, fielderId, runsOnDismissal });
        setWicketModalOpen(false);
        const currentInnings = match.innings[match.currentInnings-1] as Innings;
        if (currentInnings.wickets + 1 < 10) {
            setNextBatsmanModalOpen(true);
        } else {
            handleWicketDismissal(null); // End innings directly
        }
    };
    
    const handleDeclareRetirement = (outPlayerId: string) => {
        setRetirementInfo({ outPlayerId });
        setRetireModalOpen(false);
        const currentInnings = match.innings[match.currentInnings-1] as Innings;
        if (currentInnings.wickets + 1 < 10) {
            setNextBatsmanModalOpen(true);
        } else {
            handleWicketDismissal(null); // End innings directly
        }
    };

    const handleWicketDismissal = (nextBatsmanId: string | null) => {
        updateMatchState(draft => {
            const info = wicketInfo || retirementInfo;
            if (!info) return;

            const dismissalType = wicketInfo ? wicketInfo.dismissalType : DismissalType.RETIRED_OUT;
            const { outPlayerId } = info;
            
            const currentInnings = draft.innings[draft.currentInnings - 1] as Innings;
            currentInnings.wickets += 1;

            const isRetired = dismissalType === DismissalType.RETIRED_OUT;
            const isBallBowled = !isRetired;
            
            const runsOnDismissal = wicketInfo?.runsOnDismissal ?? 0;
            if (dismissalType === DismissalType.RUN_OUT && runsOnDismissal > 0) {
                currentInnings.score += runsOnDismissal;
                const striker = currentInnings.batsmen.find(b => b.id === currentInnings.currentStrikerId);
                if (striker) striker.runs += runsOnDismissal;
                const bowler = currentInnings.bowlers.find(b => b.id === currentInnings.currentBowlerId);
                if(bowler) bowler.runsConceded += runsOnDismissal;
                if (runsOnDismissal % 2 !== 0) swapStrike(currentInnings);
            }

            let timelineEvent: string | number = 'W';
            if (isRetired) timelineEvent = 'RET';
            else if (dismissalType === DismissalType.RUN_OUT) timelineEvent = `${runsOnDismissal > 0 ? runsOnDismissal : ''}W-RO`;
            currentInnings.timeline[currentInnings.timeline.length - 1].push(timelineEvent);

            if (isBallBowled) {
                currentInnings.balls += 1;
                const bowler = currentInnings.bowlers.find(b => b.id === currentInnings.currentBowlerId);
                if (bowler) {
                    bowler.balls += 1;
                    const isBowlerCreditWicket = ![DismissalType.RUN_OUT, DismissalType.RETIRED_OUT, DismissalType.TIMED_OUT].includes(dismissalType);
                    if (isBowlerCreditWicket) bowler.wickets += 1;
                }
                const outBatsman = currentInnings.batsmen.find(b => b.id === outPlayerId);
                if (outBatsman) outBatsman.balls += 1;
            }
            
            const outBatsman = currentInnings.batsmen.find(b => b.id === outPlayerId);
            if(outBatsman) {
                outBatsman.out = true;
                outBatsman.onStrike = false;
                
                const bowler = currentInnings.bowlers.find(b => b.id === currentInnings.currentBowlerId);
                const fieldingTeam = draft.team1.id === currentInnings.bowlingTeamId ? draft.team1 : draft.team2;
                const fielder = wicketInfo?.fielderId ? fieldingTeam.players.find(p => p.id === wicketInfo.fielderId) : undefined;
                
                if (isRetired) {
                    outBatsman.dismissal = { type: dismissalType, bowler: { id: "retired", name: "retired" } };
                } else if (bowler) {
                    outBatsman.dismissal = { type: dismissalType, bowler, fielder };
                }

                if(outBatsman.dismissal) {
                    currentInnings.fallOfWickets.push({score: currentInnings.score, overs: currentInnings.overs, balls: currentInnings.balls, player: JSON.parse(JSON.stringify(outBatsman))});
                }
            }
            
            if(currentInnings.wickets < 10 && nextBatsmanId) {
                const battingTeam = draft.team1.id === currentInnings.battingTeamId ? draft.team1 : draft.team2;
                const nextBatsmanPlayer = battingTeam.players.find(p => p.id === nextBatsmanId);
                if (nextBatsmanPlayer) {
                    const newBatsman: Batsman = { ...nextBatsmanPlayer, runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: true, out: false };
                    currentInnings.batsmen.push(newBatsman);
                    
                    const remainingOnFieldBatsmanId = (outPlayerId === currentInnings.currentStrikerId) ? currentInnings.currentNonStrikerId : currentInnings.currentStrikerId;
                    
                    currentInnings.currentStrikerId = newBatsman.id;
                    currentInnings.currentNonStrikerId = remainingOnFieldBatsmanId;
                    
                    const remainingBatsman = currentInnings.batsmen.find(b => b.id === remainingOnFieldBatsmanId);
                    if (remainingBatsman) remainingBatsman.onStrike = false;
                }
            }
        });
        
        setNextBatsmanModalOpen(false);
        setWicketInfo(null);
        setRetirementInfo(null);
    };

    const handleNewBowler = (bowlerId: string) => {
        updateMatchState(draft => {
            const currentInnings = draft.innings[draft.currentInnings - 1] as Innings;
            
            const lastOverRuns = currentInnings.timeline[currentInnings.timeline.length - 1]
                .reduce((acc: number, ball: string | number): number => {
                    if (typeof ball === 'number') {
                        return acc + ball;
                    }
                    
                    const ballStr = String(ball);
                    
                    // Byes and Leg Byes don't count towards bowler's conceded runs for maiden calculation.
                    if (ballStr.endsWith('B') || ballStr.endsWith('Lb')) {
                        return acc;
                    }
    
                    let runsThisBall = 0;
                    
                    if (ballStr.includes('Nb') || ballStr.includes('Wd')) {
                        // The extra delivery itself counts as one run against the bowler
                        runsThisBall = 1; 
                    }
    
                    // This handles runs off the bat on a no-ball, or runs from a run-out.
                    const runsScored = parseInt(ballStr.replace(/[a-zA-Z-]/g, ''), 10);
                    if (!isNaN(runsScored)) {
                        runsThisBall += runsScored;
                    }
                    
                    return acc + runsThisBall;
                }, 0);
            
            const lastBowler = currentInnings.bowlers.find(b => b.id === currentInnings.currentBowlerId);
            if(lastBowler && lastOverRuns === 0 && currentInnings.balls >= 6) {
                lastBowler.maidens += 1;
            }

            currentInnings.overs += 1;
            currentInnings.balls = 0;
            currentInnings.timeline.push([]);

            let newBowler = currentInnings.bowlers.find(b => b.id === bowlerId);
            if (!newBowler) {
                const bowlingTeam = draft.team1.id === currentInnings.bowlingTeamId ? draft.team1 : draft.team2;
                const bowlerPlayer = bowlingTeam.players.find(p => p.id === bowlerId);
                if (bowlerPlayer) {
                    newBowler = { ...bowlerPlayer, overs: 0, balls: 0, maidens: 0, runsConceded: 0, wickets: 0 };
                    currentInnings.bowlers.push(newBowler);
                }
            }
            currentInnings.currentBowlerId = bowlerId;

            swapStrike(currentInnings);
        });
        setNewBowlerModalOpen(false);
    };
    
    const handleEditPlayer = (player: Player) => {
        setPlayerToEdit(player);
        setEditPlayerModalOpen(true);
    };
    
    const handleSavePlayerName = (playerId: string, newName: string) => {
        updateMatchState(draft => {
            const allTeams = [draft.team1, draft.team2];
            allTeams.forEach(team => {
                const p = team.players.find(p => p.id === playerId);
                if(p) p.name = newName;
            });

            draft.innings.forEach(inning => {
                const fullInning = inning as Innings;
                if(!fullInning.batsmen) return;
                fullInning.batsmen.forEach(b => {
                    if (b.id === playerId) b.name = newName;
                    if (b.dismissal?.bowler.id === playerId) b.dismissal.bowler.name = newName;
                    if (b.dismissal?.fielder?.id === playerId) b.dismissal.fielder.name = newName;
                });
                fullInning.bowlers.forEach(b => {
                    if (b.id === playerId) b.name = newName;
                });
            });
        });
        setEditPlayerModalOpen(false);
        setPlayerToEdit(null);
    };
    
    const handleSaveSettings = (maxOvers: number, target?: number, targetOvers?: number) => {
        updateMatchState(draft => {
            draft.maxOvers = maxOvers;
            if (target !== undefined) draft.target = target;
            if (targetOvers !== undefined) draft.targetOvers = targetOvers;
        });
        setSettingsModalOpen(false);
    };
    
    const currentMatchState = history[history.length - 1] || match;
    const currentInnings = currentMatchState.innings[currentMatchState.currentInnings - 1] as Innings;
    const battingTeam = currentMatchState.team1.id === currentInnings.battingTeamId ? currentMatchState.team1 : currentMatchState.team2;
    const fieldingTeam = currentMatchState.team1.id === currentInnings.bowlingTeamId ? currentMatchState.team1 : currentMatchState.team2;
    const onFieldBatsmen = [
        currentInnings.batsmen.find(b => b.id === currentInnings.currentStrikerId),
        currentInnings.batsmen.find(b => b.id === currentInnings.currentNonStrikerId)
    ].filter((b): b is Batsman => b !== undefined && !b.out);
    
    const currentBowler = currentInnings.bowlers.find(b => b.id === currentInnings.currentBowlerId);

    if (isScorecardModalOpen) {
        return (
            <div className="fixed inset-0 bg-light-bg dark:bg-dark-bg z-50 overflow-y-auto">
                <Summary match={currentMatchState} onGoHome={() => setScorecardModalOpen(false)} isSpectatorView={true} />
                 <button onClick={() => setScorecardModalOpen(false)} className="fixed top-4 right-4 z-50 bg-white text-black rounded-full h-10 w-10 flex items-center justify-center font-bold text-xl shadow-lg">
                    &times;
                </button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-5rem)]">
            <div className="md:w-1/2 lg:w-2/5 p-4 overflow-y-auto">
                <Scoreboard match={currentMatchState} onEditPlayer={handleEditPlayer} />
            </div>
            <div className="md:w-1/2 lg:w-3/5 flex flex-col justify-end p-4">
                <ScoringControls
                    onRun={handleRun}
                    onExtra={handleExtra}
                    onWicket={() => {
                        const latestMatch = history[history.length - 1];
                        const currentInnings = latestMatch.innings[latestMatch.currentInnings - 1] as Innings;
                        if (currentInnings.balls >= 6) {
                            setNewBowlerModalOpen(true);
                            return;
                        }
                        setWicketModalOpen(true);
                    }}
                    onRetire={() => setRetireModalOpen(true)}
                    onSwapStrike={handleSwapStrike}
                    onEditSettings={() => setSettingsModalOpen(true)}
                    onViewScorecard={() => setScorecardModalOpen(true)}
                    onUndo={handleUndo}
                    onCancelMatch={handleCancelMatch}
                    undoDisabled={history.length <= 1}
                />
            </div>

            {currentBowler && <WicketModal
                isOpen={isWicketModalOpen}
                onClose={() => setWicketModalOpen(false)}
                onDeclareWicket={handleDeclareWicket}
                batsmen={onFieldBatsmen}
                bowler={currentBowler}
                fieldingTeam={fieldingTeam.players}
            />}
            
            <RetireModal 
                isOpen={isRetireModalOpen}
                onClose={() => setRetireModalOpen(false)}
                onDeclareRetirement={handleDeclareRetirement}
                batsmen={onFieldBatsmen}
            />

            <NextBatsmanModal 
                isOpen={isNextBatsmanModalOpen}
                onClose={() => {
                    setNextBatsmanModalOpen(false);
                    setWicketInfo(null);
                    setRetirementInfo(null);
                }}
                onSubmit={handleWicketDismissal}
                battingTeam={battingTeam}
                batsmenInMatch={currentInnings.batsmen}
            />

            <NewBowlerModal
                isOpen={isNewBowlerModalOpen}
                onClose={() => setNewBowlerModalOpen(false)}
                onSubmit={handleNewBowler}
                fieldingTeam={fieldingTeam}
                currentBowlerId={currentInnings.currentBowlerId}
            />

            <EditPlayerModal
                isOpen={isEditPlayerModalOpen}
                onClose={() => setEditPlayerModalOpen(false)}
                onSubmit={handleSavePlayerName}
                player={playerToEdit}
            />

            <MatchSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                onSave={handleSaveSettings}
                match={currentMatchState}
            />
        </div>
    );
};

export default ScoringPage;