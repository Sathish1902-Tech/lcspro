

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MatchState, GameState, Team, Player, Innings, User, Batsman, Bowler, DismissalType, FallOfWicket } from './types';
import MatchSetup from './components/MatchSetup';
import Summary from './components/Summary';
import InningsBreak from './components/InningsBreak';
import { SunIcon, MoonIcon, PlusCircleIcon, TargetIcon, DesktopIcon } from './components/icons';
import ScoringPage from './components/ScoringPage';
import MatchHistory from './components/MatchHistory';
import Header from './components/Header';
import { SpectatorView } from './components/SpectatorView';
import CustomTargetSetup from './components/CustomTargetSetup';
import LoginPage from './components/LoginPage';
import AccountChooser from './components/AccountChooser';
import ConnectDriveModal from './components/ConnectDriveModal';


// Add required libraries to window for TypeScript
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

const CURRENT_USER_KEY = 'cricket-scorer-current-user';
const LOGGED_OUT_USERS_KEY = 'cricket-scorer-logged-out-users';
const BASE_CURRENT_MATCH_KEY = 'cricket-scorer-current-match';
const BASE_MATCH_HISTORY_KEY = 'cricket-scorer-match-history';

export const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loggedOutUsers, setLoggedOutUsers] = useState<User[]>([]);
    const [match, setMatch] = useState<MatchState | null>(null);
    const [view, setView] = useState({ page: 'loading', param: '' });
    const [history, setHistory] = useState<MatchState[]>([]);
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [onlineScorers, setOnlineScorers] = useState(Math.floor(Math.random() * 50) + 120);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
    const [isConnectDriveModalOpen, setIsConnectDriveModalOpen] = useState(false);

    // Effect for simulated online user count
    useEffect(() => {
        const interval = setInterval(() => {
            setOnlineScorers(prev => {
                const change = Math.floor(Math.random() * 7) - 3; // -3 to 3
                const newCount = prev + change;
                return newCount < 100 ? 100 + Math.floor(Math.random() * 5) : newCount; // Ensure it doesn't drop too low
            });
        }, 3500); // Update every 3.5 seconds
    
        return () => clearInterval(interval);
    }, []);

    // Helper functions for user-specific keys
    const getUserKey = (baseKey: string, userId?: string) => (userId || currentUser?.id) ? `${baseKey}-${userId || currentUser?.id}` : null;

    // Handle theme changes
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);
    
    // Drive Sync Simulation
    useEffect(() => {
        if (!currentUser?.driveConnected) return;
        if (match?.gameState === GameState.IN_PROGRESS || match?.gameState === GameState.INNINGS_BREAK) {
          setSyncStatus('syncing');
          const timer = setTimeout(() => {
            setSyncStatus('synced');
          }, 1200);
          return () => clearTimeout(timer);
        } else {
            setSyncStatus('idle');
        }
    }, [match, history, currentUser?.driveConnected]);

    useEffect(() => {
        const root = window.document.documentElement;
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (theme === 'dark' || (theme === 'system' && systemIsDark)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === 'system') {
                if (e.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);
    
    // Automatic Live Match Sync for Spectator View
    useEffect(() => {
        if (match && match.gameState !== GameState.FINISHED && currentUser) {
            const key = getUserKey(BASE_CURRENT_MATCH_KEY);
            if (key) {
                localStorage.setItem(key, JSON.stringify(match));
            }
        }
    }, [match, currentUser]);

    const toggleTheme = () => {
        const newTheme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleLogin = (user: User, isNewUser: boolean = false) => {
        const userToLogin = isNewUser ? { ...user, driveConnected: false } : user;
        
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToLogin));
        setCurrentUser(userToLogin);
        
        const updatedLoggedOutUsers = loggedOutUsers.filter(u => u.id !== userToLogin.id);
        setLoggedOutUsers(updatedLoggedOutUsers);
        localStorage.setItem(LOGGED_OUT_USERS_KEY, JSON.stringify(updatedLoggedOutUsers));
        
        if (!userToLogin.driveConnected) {
            setIsConnectDriveModalOpen(true);
        }
        
        window.location.hash = '#/';
    };
    
    const handleAddNewAccount = () => {
        setView({ page: 'login', param: '' });
    };

    const handleLogout = () => {
        if (!currentUser) return;
        
        const updatedLoggedOutUsers = [currentUser, ...loggedOutUsers.filter(u => u.id !== currentUser.id)];
        setLoggedOutUsers(updatedLoggedOutUsers);
        localStorage.setItem(LOGGED_OUT_USERS_KEY, JSON.stringify(updatedLoggedOutUsers));
        
        setCurrentUser(null);
        setMatch(null);
        localStorage.removeItem(CURRENT_USER_KEY);
        
        window.location.hash = '#/login';
    };
    
    const handleConnectDrive = () => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, driveConnected: true };
        setCurrentUser(updatedUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        setIsConnectDriveModalOpen(false);
    };
    
    useEffect(() => {
        const handleRouteChange = () => {
            const hash = window.location.hash.replace('#/', '');
            const [page, param] = hash.split('?')[0].split('/');

            if (page === 'spectate') {
                setView({ page: 'spectate', param: '' });
                return;
            }

            const savedUserJson = localStorage.getItem(CURRENT_USER_KEY);
            if (savedUserJson) {
                const user = JSON.parse(savedUserJson);
                if (!currentUser || currentUser.id !== user.id) {
                    setCurrentUser(user);
                }
                
                const historyKey = getUserKey(BASE_MATCH_HISTORY_KEY, user.id);
                const savedHistory = historyKey ? localStorage.getItem(historyKey) : null;
                setHistory(savedHistory ? JSON.parse(savedHistory) : []);
                
                if (page === 'summary' && param) return setView({ page: 'summary', param });
                if (page === 'history') return setView({ page: 'history', param: '' });
                if (page === 'setup_full') return setView({ page: 'setup_full', param: '' });
                if (page === 'setup_chase') return setView({ page: 'setup_chase', param: '' });
                if (page === 'login') return setView({ page: 'home', param: '' });

                const currentMatchKey = getUserKey(BASE_CURRENT_MATCH_KEY, user.id);
                const savedMatch = currentMatchKey ? localStorage.getItem(currentMatchKey) : null;
                const currentMatch = savedMatch ? JSON.parse(savedMatch) : null;
                setMatch(currentMatch);
                setView({ page: currentMatch ? 'scoring' : 'home', param: '' });
            } else {
                const savedLoggedOutUsers = localStorage.getItem(LOGGED_OUT_USERS_KEY);
                const users = savedLoggedOutUsers ? JSON.parse(savedLoggedOutUsers) : [];
                setLoggedOutUsers(users);
                setView({ page: users.length > 0 ? 'account_chooser' : 'login', param: '' });
            }
        };
        
        handleRouteChange();
        window.addEventListener('hashchange', handleRouteChange);
        return () => window.removeEventListener('hashchange', handleRouteChange);
    }, [currentUser]);

    const cleanupSessionHistory = () => {
        if (match && match.id) {
            const sessionHistoryKey = `scorer-history-${match.id}`;
            sessionStorage.removeItem(sessionHistoryKey);
        }
    };

    const startNewMatch = () => {
        cleanupSessionHistory();
        const key = getUserKey(BASE_CURRENT_MATCH_KEY);
        if(key) localStorage.removeItem(key);
        setMatch(null);
        window.location.hash = '#/';
    };

    const goToHomePage = () => {
        cleanupSessionHistory();
        const currentMatchKey = getUserKey(BASE_CURRENT_MATCH_KEY);
        if (currentMatchKey) localStorage.removeItem(currentMatchKey);
        setMatch(null);
        setView({ page: 'home', param: '' });
        window.location.hash = '#/';
    };
    
    const handleMatchStart = (team1Name: string, team1Players: Player[], team2Name: string, team2Players: Player[], overs: number, tossWinnerName: string, tossDecision: 'BAT' | 'BOWL') => {
        const team1: Team = { id: 't1', name: team1Name, players: team1Players };
        const team2: Team = { id: 't2', name: team2Name, players: team2Players };
        
        const tossWinnerId = tossWinnerName === team1Name ? 't1' : 't2';
        
        let battingTeamId: string, bowlingTeamId: string;
        if ((tossWinnerId === 't1' && tossDecision === 'BAT') || (tossWinnerId === 't2' && tossDecision === 'BOWL')) {
            battingTeamId = 't1';
            bowlingTeamId = 't2';
        } else {
            battingTeamId = 't2';
            bowlingTeamId = 't1';
        }

        const battingTeam = battingTeamId === 't1' ? team1 : team2;
        const bowlingTeam = bowlingTeamId === 't1' ? team1 : team2;
        
        const firstBatsmen: Batsman[] = [
             { ...battingTeam.players[0], runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: true, out: false },
             { ...battingTeam.players[1], runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: false, out: false }
        ];

        const firstBowler: Bowler = { ...bowlingTeam.players[10], overs: 0, balls: 0, maidens: 0, runsConceded: 0, wickets: 0 };
        
        const firstInnings: Innings = {
            battingTeamId, bowlingTeamId, score: 0, wickets: 0, overs: 0, balls: 0, timeline: [[]],
            batsmen: firstBatsmen, bowlers: [firstBowler], fallOfWickets: [], extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0 },
            currentStrikerId: firstBatsmen[0].id, currentNonStrikerId: firstBatsmen[1].id, currentBowlerId: firstBowler.id
        };

        const newMatch: MatchState = {
            id: `m${Date.now()}`,
            gameState: GameState.IN_PROGRESS,
            team1, team2, maxOvers: overs,
            innings: [firstInnings],
            currentInnings: 1,
            toss: { winnerId: tossWinnerId, decision: tossDecision },
            target: null,
            targetOvers: null,
        };
        
        setMatch(newMatch);
        window.location.hash = '#/';
    };

    const handleChaseStart = (chasingTeamName: string, chasingTeamPlayers: Player[], bowlingTeamName: string, bowlingTeamPlayers: Player[], targetRuns: number, targetOvers: number) => {
        const chasingTeam: Team = { id: 't1', name: chasingTeamName, players: chasingTeamPlayers };
        const bowlingTeam: Team = { id: 't2', name: bowlingTeamName, players: bowlingTeamPlayers };
    
        // Create a minimal placeholder for the first innings for target calculation
        const firstInningsPlaceholder: Innings = {
            battingTeamId: bowlingTeam.id,
            bowlingTeamId: chasingTeam.id,
            score: targetRuns - 1,
            wickets: 10, // Assume all out for simplicity
            overs: targetOvers,
            balls: 0,
            timeline: [], // Empty
            batsmen: [], // Empty
            bowlers: [], // Empty
            fallOfWickets: [], // Empty
            extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0 },
            currentStrikerId: '', currentNonStrikerId: '', currentBowlerId: ''
        };
    
        const secondInningsBatsmen: Batsman[] = [
             { ...chasingTeam.players[0], runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: true, out: false },
             { ...chasingTeam.players[1], runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: false, out: false }
        ];
    
        const secondInningsBowler: Bowler = { ...bowlingTeam.players[10], overs: 0, balls: 0, maidens: 0, runsConceded: 0, wickets: 0 };
    
        const secondInnings: Innings = {
            battingTeamId: chasingTeam.id, bowlingTeamId: bowlingTeam.id,
            score: 0, wickets: 0, overs: 0, balls: 0, timeline: [[]],
            batsmen: secondInningsBatsmen, bowlers: [secondInningsBowler], fallOfWickets: [],
            extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0 },
            currentStrikerId: secondInningsBatsmen[0].id, currentNonStrikerId: secondInningsBatsmen[1].id, currentBowlerId: secondInningsBowler.id,
        };
    
        const newMatch: MatchState = {
            id: `m${Date.now()}`,
            gameState: GameState.IN_PROGRESS,
            team1: chasingTeam, team2: bowlingTeam,
            maxOvers: targetOvers,
            innings: [firstInningsPlaceholder, secondInnings],
            currentInnings: 2,
            toss: { winnerId: bowlingTeam.id, decision: 'BOWL' },
            target: targetRuns, 
            targetOvers: targetOvers,
            isChaseOnly: true, // Flag this as a chase-only match
        };
    
        setMatch(newMatch);
        window.location.hash = '#/';
    };
    
    const handleEndInnings = (state: MatchState) => {
        const newState = JSON.parse(JSON.stringify(state));
        if (newState.currentInnings === 1) {
            newState.gameState = GameState.INNINGS_BREAK;
            const secondInningsTemplate: Partial<Innings> = {
                battingTeamId: (newState.innings[0] as Innings).bowlingTeamId,
                bowlingTeamId: (newState.innings[0] as Innings).battingTeamId,
                score: 0, wickets: 0, overs: 0, balls: 0, timeline: [[]],
                batsmen: [], bowlers: [], fallOfWickets: [],
                extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0 },
            };
            newState.innings.push(secondInningsTemplate);
            newState.currentInnings = 2;
        } else {
            newState.gameState = GameState.FINISHED;
            const historyKey = getUserKey(BASE_MATCH_HISTORY_KEY);
            const currentMatchKey = getUserKey(BASE_CURRENT_MATCH_KEY);
            
            if (historyKey) {
                const newHistory = [newState, ...history];
                setHistory(newHistory);
                localStorage.setItem(historyKey, JSON.stringify(newHistory));
                if (currentUser?.driveConnected) {
                    alert("Match saved to Drive"); // Toast simulation
                }
            }
            if (currentMatchKey) localStorage.removeItem(currentMatchKey);
        }
        
        setMatch(newState);
    };

    const handleSetTargetAndStartInnings = (targetRuns: number, targetOvers: number) => {
        if (!match || match.currentInnings !== 2 || match.gameState !== GameState.INNINGS_BREAK) return;

        const newState = JSON.parse(JSON.stringify(match)) as MatchState;
        newState.gameState = GameState.IN_PROGRESS;
        newState.target = targetRuns;
        newState.targetOvers = targetOvers;

        const secondInnings = newState.innings[1] as Innings;
        const battingTeam = newState.team1.id === secondInnings.battingTeamId ? newState.team1 : newState.team2;
        const bowlingTeam = newState.team1.id === secondInnings.bowlingTeamId ? newState.team1 : newState.team2;

        const firstBatsmen: Batsman[] = [
            { ...battingTeam.players[0], runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: true, out: false },
            { ...battingTeam.players[1], runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: false, out: false }
        ];

        const firstBowler: Bowler = { ...bowlingTeam.players[10], overs: 0, balls: 0, maidens: 0, runsConceded: 0, wickets: 0 };
        
        secondInnings.batsmen = firstBatsmen;
        secondInnings.bowlers = [firstBowler];
        secondInnings.currentStrikerId = firstBatsmen[0].id;
        secondInnings.currentNonStrikerId = firstBatsmen[1].id;
        secondInnings.currentBowlerId = firstBowler.id;
        
        setMatch(newState);
    };

    const handleUndoFinish = () => {
        if (!match || match.gameState !== GameState.FINISHED) return;

        const historyKey = `scorer-history-${match.id}`;
        const savedHistory = sessionStorage.getItem(historyKey);
        if (!savedHistory) return;

        let history: MatchState[] = JSON.parse(savedHistory);
        if (history.length <= 1) return;

        history.pop();
        const prevState = history[history.length - 1];

        sessionStorage.setItem(historyKey, JSON.stringify(history));
        
        setMatch(prevState);
        setView({ page: 'scoring', param: '' });
    };

    const handleSetMatch = (updatedMatch: MatchState) => {
        setMatch(updatedMatch);
        
        // Also update it in history
        const historyKey = getUserKey(BASE_MATCH_HISTORY_KEY);
        if(historyKey) {
            const newHistory = history.map(m => m.id === updatedMatch.id ? updatedMatch : m);
            setHistory(newHistory);
            localStorage.setItem(historyKey, JSON.stringify(newHistory));
        }
    };

    const renderContent = () => {
        switch (view.page) {
            case 'spectate':
                 return <SpectatorView />;
            case 'login':
                 return <LoginPage onLogin={(user) => handleLogin(user, true)} />;
            case 'account_chooser':
                return <AccountChooser users={loggedOutUsers} onLogin={handleLogin} onAddNewAccount={handleAddNewAccount} />;
        }

        if (!currentUser) {
            return <div>Loading...</div>;
        }

        switch (view.page) {
            case 'home':
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg p-4 text-center">
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-primary dark:text-secondary">Cricket Scorer Pro</h1>
                            <p className="text-lg text-light-text dark:text-dark-text max-w-xl">
                                Welcome, {currentUser.name}! What would you like to do?
                            </p>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{onlineScorers} Scorers Online</p>
                        </div>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
                            <a href="#/setup_full" className="group bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center">
                                <PlusCircleIcon className="w-16 h-16 text-primary dark:text-secondary mb-4 transition-transform group-hover:scale-110" />
                                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Set Up Full Match</h2>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Score a complete two-innings match from toss to finish.</p>
                            </a>
                            <a href="#/setup_chase" className="group bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center">
                                <TargetIcon className="w-16 h-16 text-green-600 dark:text-green-400 mb-4 transition-transform group-hover:scale-110" />
                                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Score a Chase</h2>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Jump right into scoring a chase by setting a target.</p>
                            </a>
                        </div>
                    </div>
                );
            case 'setup_full':
                return <MatchSetup onMatchStart={handleMatchStart} />;
            case 'setup_chase':
                return <CustomTargetSetup onChaseStart={handleChaseStart} />;
            case 'scoring':
                if (!match) {
                    return (
                        <div className="text-center p-8">
                            <p>No active match found.</p>
                            <a href="#/" className="text-primary dark:text-secondary font-bold">Go to Home</a>
                        </div>
                    );
                }
                if (match.gameState === GameState.IN_PROGRESS) {
                    return <ScoringPage match={match} setMatch={setMatch} onEndInnings={handleEndInnings} onCancelMatch={goToHomePage} />;
                }
                if (match.gameState === GameState.INNINGS_BREAK) {
                    return <InningsBreak match={match} onSetTargetAndStart={handleSetTargetAndStartInnings} onCancelMatch={goToHomePage} />;
                }
                if (match.gameState === GameState.FINISHED) {
                    return <Summary match={match} onNewMatch={startNewMatch} onGoHome={goToHomePage} onUndoLastBall={handleUndoFinish} setMatch={handleSetMatch} />;
                }
                return <div>Invalid state. <a href="#/">Go Home</a></div>;
            case 'history':
                return <MatchHistory history={history} />;
            case 'summary':
                const matchFromHistory = history.find(m => m.id === view.param);
                if (!matchFromHistory) return <div>Match not found in history. <a href="#/history">Go to History</a></div>;
                return <Summary match={matchFromHistory} onNewMatch={startNewMatch} onGoHome={goToHomePage} />;
            case 'loading':
            default:
                return <div>Loading...</div>;
        }
    };

    return (
        <main>
            {currentUser && view.page !== 'spectate' && <Header match={match} user={currentUser} onLogout={handleLogout} syncStatus={syncStatus} theme={theme} toggleTheme={toggleTheme} />}
            {(!currentUser || view.page === 'spectate') && (
                <button
                    onClick={toggleTheme}
                    className="fixed top-4 right-4 z-50 bg-light-card/80 dark:bg-dark-card/80 p-2 rounded-full shadow-md"
                    aria-label={`Toggle theme (current: ${theme})`}
                >
                    {theme === 'system' && <DesktopIcon className="w-6 h-6 text-primary dark:text-secondary" />}
                    {theme === 'light' && <SunIcon className="w-6 h-6 text-yellow-500" />}
                    {theme === 'dark' && <MoonIcon className="w-6 h-6 text-primary" />}
                </button>
            )}
            <div className={currentUser && view.page !== 'spectate' ? "pt-20" : ""}>
              {renderContent()}
            </div>
            {currentUser && <ConnectDriveModal 
                isOpen={isConnectDriveModalOpen}
                user={currentUser}
                onConnect={handleConnectDrive}
                onCancel={() => setIsConnectDriveModalOpen(false)}
            />}
        </main>
    );
};