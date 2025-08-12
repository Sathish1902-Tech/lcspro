import React, { useState, useRef, useEffect } from 'react';
import { MatchState, Innings, Batsman, Bowler, Team, DismissalType, Player, GameState } from '../types';
import ManOfTheMatchModal from './ManOfTheMatchModal';


interface SummaryProps {
    match: MatchState;
    onNewMatch?: () => void;
    onGoHome?: () => void;
    isSpectatorView?: boolean;
    onUndoLastBall?: () => void;
    setMatch?: (match: MatchState) => void;
}

const calculateStrikeRate = (runs: number, balls: number) => {
    if (balls === 0) return '0.00';
    return ((runs / balls) * 100).toFixed(2);
};

const calculateEconomy = (runs: number, overs: number, balls: number) => {
    if (overs === 0 && balls === 0) return '0.00';
    const totalBalls = overs * 6 + balls;
    return ((runs / totalBalls) * 6).toFixed(2);
};

const calculateOverTotal = (over: (string | number)[]): number => {
    let totalRuns = 0;
    for (const ball of over) {
        if (typeof ball === 'number') {
            totalRuns += ball;
            continue;
        }

        const ballStr = String(ball);
        let runs = 0;

        if (ballStr.includes('Wd') || ballStr.includes('Nb')) {
            runs += 1; // The extra itself is 1 run
        }
        
        // Extract numeric part for additional runs
        const numericPart = parseInt(ballStr.replace(/[^0-9]/g, ''));
        if (!isNaN(numericPart)) {
            runs += numericPart;
        }
        
        totalRuns += runs;
    }
    return totalRuns;
};

const getDismissalText = (batsman: Batsman) => {
    if (!batsman.out) return 'not out';
    const { dismissal } = batsman;
    if (!dismissal) return 'out'; 
    switch (dismissal.type) {
        case DismissalType.BOWLED:
            return `b ${dismissal.bowler.name}`;
        case DismissalType.CAUGHT:
            return `c ${dismissal.fielder?.name || '?'} b ${dismissal.bowler.name}`;
        case DismissalType.STUMPED:
            return `st ${dismissal.fielder?.name || '?'} b ${dismissal.bowler.name}`;
        case DismissalType.LBW:
            return `lbw b ${dismissal.bowler.name}`;
        case DismissalType.RUN_OUT:
            return `run out (${dismissal.fielder?.name || '?'})`;
        case DismissalType.RETIRED_OUT:
            return 'retired out';
        case DismissalType.HIT_WICKET:
             return `hit wicket b ${dismissal.bowler.name}`;
        default:
            return dismissal.type;
    }
};

const BallDisplay: React.FC<{ball: string | number}> = ({ ball }) => (
    <span className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full font-bold text-xs sm:text-sm
      ${String(ball).includes('W') ? 'bg-red-500 text-white' : ''}
      ${['4', '6'].includes(String(ball)) ? 'bg-primary dark:bg-secondary text-white' : ''}
      ${!String(ball).includes('W') && !['4', '6'].includes(String(ball)) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}>
      {ball}
    </span>
);


const InningsCard: React.FC<{ innings: Innings; team: Team; showDetails: boolean }> = ({ innings, team, showDetails }) => {
    const totalExtras = Object.values(innings.extras).reduce((a, b) => a + b, 0);
    return (
        <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-lg p-6 space-y-6">
            <div className="flex justify-between items-baseline">
                <h3 className="text-xl sm:text-2xl font-bold text-primary dark:text-secondary">{team.name}</h3>
                <p className="text-lg sm:text-xl font-bold">{innings.score} - {innings.wickets} ({innings.overs}.{innings.balls})</p>
            </div>

            {/* Batting Scorecard */}
            <div>
                <h4 className="font-semibold text-lg mb-2">Batting</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="p-2">Batsman</th>
                                <th className="p-2">Dismissal</th>
                                <th className="p-2 text-right">R</th>
                                <th className="p-2 text-right">B</th>
                                <th className="p-2 text-right">4s</th>
                                <th className="p-2 text-right">6s</th>
                                <th className="p-2 text-right">SR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {innings.batsmen.map(b => (
                                <tr key={b.id} className="border-b dark:border-gray-700">
                                    <td className="p-2 font-medium">{b.name}{!b.out ? '*' : ''}</td>
                                    <td className="p-2 text-xs text-gray-600 dark:text-gray-400">
                                        {getDismissalText(b)}
                                    </td>
                                    <td className="p-2 text-right font-bold">{b.runs}</td>
                                    <td className="p-2 text-right">{b.balls}</td>
                                    <td className="p-2 text-right">{b.fours}</td>
                                    <td className="p-2 text-right">{b.sixes}</td>
                                    <td className="p-2 text-right">{calculateStrikeRate(b.runs, b.balls)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bowling Scorecard */}
            <div>
                <h4 className="font-semibold text-lg mb-2">Bowling</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                         <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="p-2">Bowler</th>
                                <th className="p-2 text-right">O</th>
                                <th className="p-2 text-right">M</th>
                                <th className="p-2 text-right">R</th>
                                <th className="p-2 text-right">W</th>
                                <th className="p-2 text-right">Econ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {innings.bowlers.map(b => (
                                <tr key={b.id} className="border-b dark:border-gray-700">
                                    <td className="p-2 font-medium">{b.name}</td>
                                    <td className="p-2 text-right">{b.overs}.{b.balls}</td>
                                    <td className="p-2 text-right">{b.maidens}</td>
                                    <td className="p-2 text-right">{b.runsConceded}</td>
                                    <td className="p-2 text-right">{b.wickets}</td>
                                    <td className="p-2 text-right">{calculateEconomy(b.runsConceded, b.overs, b.balls)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Extras */}
            <div className="text-sm">
                <p><span className="font-semibold">Extras:</span> {totalExtras} (Wd {innings.extras.wides}, Nb {innings.extras.noBalls}, B {innings.extras.byes}, Lb {innings.extras.legByes})</p>
            </div>
            
            {showDetails && (
                <>
                    {/* Fall of Wickets */}
                    {innings.fallOfWickets.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-lg mb-2">Fall of Wickets</h4>
                            <div className="text-sm space-y-1">
                                {innings.fallOfWickets.map((fow, index) => (
                                    <p key={index}>
                                        <span className="font-semibold">{index + 1}-{fow.score}</span> ({fow.player.name}, {fow.overs}.{fow.balls})
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Over by Over */}
                    {innings.timeline.length > 0 && innings.timeline.some(over => over.length > 0) && (
                        <div>
                            <h4 className="font-semibold text-lg mb-2">Over by Over</h4>
                            <div className="space-y-2">
                                {innings.timeline.map((over, index) => {
                                    if (over.length === 0) return null;
                                    const overTotal = calculateOverTotal(over);
                                    return (
                                        <div key={index} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                                            <span className="font-semibold text-sm">Over {index + 1}</span>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {over.map((ball, ballIndex) => (
                                                    <BallDisplay key={ballIndex} ball={ball} />
                                                ))}
                                            </div>
                                            <span className="font-bold text-sm text-primary dark:text-secondary">= {overTotal} Run{overTotal !== 1 ? 's' : ''}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};


export default function Summary({ match, onNewMatch, onGoHome, isSpectatorView = false, onUndoLastBall, setMatch }: SummaryProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadMessage, setDownloadMessage] = useState('Downloading...');
    const [isMotmModalOpen, setIsMotmModalOpen] = useState(false);
    const [isPdfLibReady, setIsPdfLibReady] = useState(false);

    useEffect(() => {
        if (match.gameState === GameState.FINISHED && !match.manOfTheMatchId && setMatch && !isSpectatorView) {
            const timer = setTimeout(() => {
                setIsMotmModalOpen(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [match.gameState, match.manOfTheMatchId, setMatch, isSpectatorView]);

    useEffect(() => {
        const checkLibs = () => {
            if (typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF !== 'undefined' && typeof window.jspdf.jsPDF.prototype.autoTable !== 'undefined') {
                setIsPdfLibReady(true);
                return true;
            }
            return false;
        };

        if (checkLibs()) {
            return;
        }

        const interval = setInterval(() => {
            if (checkLibs()) {
                clearInterval(interval);
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);

    const getMatchResult = () => {
        if (match.gameState !== GameState.FINISHED) return "Match in progress";

        const firstInnings = match.innings[0] as Innings;
        const secondInnings = match.innings.length > 1 ? match.innings[1] as Innings : null;
        
        const firstInningsTeam = match.team1.id === firstInnings.battingTeamId ? match.team1 : match.team2;
        const secondInningsTeam = secondInnings ? (match.team1.id === secondInnings.battingTeamId ? match.team1 : match.team2) : null;
        
        if (!secondInnings || !match.target) {
             return `${firstInningsTeam.name} won by default (match format).`;
        }

        if (secondInnings.score >= match.target) {
            const wicketsRemaining = 10 - secondInnings.wickets;
            return `${secondInningsTeam!.name} won by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`;
        } else if (secondInnings.score < firstInnings.score) {
            const runsMargin = firstInnings.score - secondInnings.score;
            return `${firstInningsTeam.name} won by ${runsMargin} run${runsMargin !== 1 ? 's' : ''}`;
        } else {
            return "Match Tied";
        }
    };

    const handleConfirmMotm = (playerId: string) => {
        if (!setMatch) return;
        const updatedMatch = { ...match, manOfTheMatchId: playerId };
        setMatch(updatedMatch);
        setIsMotmModalOpen(false);
    };

    const getPlayerName = (playerId: string): string => {
        const allPlayers = [...match.team1.players, ...match.team2.players];
        const player = allPlayers.find(p => p.id === playerId);
        return player?.name || 'Unknown Player';
    };

    const handleDownloadPdf = () => {
        if (isDownloading || !isPdfLibReady) return;

        setIsDownloading(true);
        setDownloadMessage('Generating PDF...');
    
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' }) as any;
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            const margin = 40;

            // Define colors based on theme
            const isDark = document.documentElement.classList.contains('dark');
            const primaryColor = isDark ? '#f59e0b' : '#1e3a8a';
            const textColor = isDark ? '#f9fafb' : '#111827';
            const subtleTextColor = isDark ? '#9ca3af' : '#6b7280';
            const tableHeadBg = primaryColor;
            const tableHeadText = '#ffffff';

            let currentY = margin;

            const addFooter = () => {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(subtleTextColor);
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.text(`Page ${i} of ${pageCount}`, margin, pageH - margin / 2);
                    doc.text('Generated by Cricket Scorer Pro', pageW / 2, pageH - margin / 2, { align: 'center' });
                }
            };

            // Header
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.setTextColor(primaryColor);
            doc.text('Match Scorecard', pageW / 2, currentY, { align: 'center' });
            currentY += 20;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(14);
            doc.setTextColor(textColor);
            doc.text(`${match.team1.name} vs ${match.team2.name}`, pageW / 2, currentY, { align: 'center' });
            currentY += 15;
            
            doc.setFontSize(10);
            doc.setTextColor(subtleTextColor);
            doc.text(`Match Date: ${new Date(parseInt(match.id.substring(1))).toLocaleDateString()}`, pageW / 2, currentY, { align: 'center' });
            currentY += 30;

            // Result Box
            doc.setFillColor(isDark ? '#1f2937' : '#f3f4f6');
            doc.roundedRect(margin, currentY, pageW - margin * 2, 60, 5, 5, 'F');
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(primaryColor);
            doc.text('Result:', margin + 15, currentY + 25);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(textColor);
            doc.text(getMatchResult(), margin + 65, currentY + 25);

            if (match.manOfTheMatchId) {
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(primaryColor);
                doc.text('Man of the Match:', margin + 15, currentY + 45);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(textColor);
                doc.text(getPlayerName(match.manOfTheMatchId), margin + 120, currentY + 45);
            }
            currentY += 80;

            const tableOptions = (startY: number) => ({
                startY,
                theme: 'striped' as const,
                headStyles: { fillColor: tableHeadBg, textColor: tableHeadText, fontStyle: 'bold' },
                styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, textColor: textColor },
                alternateRowStyles: { fillColor: isDark ? [55, 65, 81] : [249, 250, 251] },
                margin: { left: margin, right: margin }
            });

            for (const inning of match.innings) {
                const fullInning = inning as Innings;
                if (!fullInning.battingTeamId || fullInning.batsmen.length === 0) continue;
                
                const team = match.team1.id === fullInning.battingTeamId ? match.team1 : match.team2;
                
                if (currentY > pageH - 250) {
                    doc.addPage();
                    currentY = margin;
                }

                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(primaryColor);
                doc.text(`${team.name} Innings`, margin, currentY);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                doc.setTextColor(textColor);
                doc.text(`${fullInning.score}/${fullInning.wickets} (${fullInning.overs}.${fullInning.balls} Overs)`, pageW - margin, currentY, { align: 'right' });
                currentY += 25;

                // Batting Table
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text('Batting', margin, currentY);
                currentY += 15;
                const battingHead = [['Batsman', 'Dismissal', 'R', 'B', '4s', '6s', 'SR']];
                const battingBody = fullInning.batsmen.map(b => [
                    { content: b.name + (!b.out ? '*' : ''), styles: { fontStyle: 'bold' } },
                    { content: getDismissalText(b), styles: { fontSize: 7, textColor: subtleTextColor } },
                    b.runs, b.balls, b.fours, b.sixes, calculateStrikeRate(b.runs, b.balls)
                ]);
                doc.autoTable({ ...tableOptions(currentY), head: battingHead, body: battingBody });
                currentY = doc.lastAutoTable.finalY + 20;

                // Bowling Table
                if (fullInning.bowlers.length > 0) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(11);
                    doc.text('Bowling', margin, currentY);
                    currentY += 15;
                    const bowlingHead = [['Bowler', 'O', 'M', 'R', 'W', 'Econ']];
                    const bowlingBody = fullInning.bowlers.map(b => [
                        { content: b.name, styles: { fontStyle: 'bold' } },
                        `${b.overs}.${b.balls}`, b.maidens, b.runsConceded, b.wickets, calculateEconomy(b.runsConceded, b.overs, b.balls)
                    ]);
                    doc.autoTable({ ...tableOptions(currentY), head: bowlingHead, body: bowlingBody });
                    currentY = doc.lastAutoTable.finalY + 10;
                }

                const totalExtras = Object.values(fullInning.extras).reduce((a, b) => a + b, 0);
                doc.setFontSize(9);
                doc.setTextColor(subtleTextColor);
                doc.text(`Extras: ${totalExtras} (wd: ${fullInning.extras.wides}, nb: ${fullInning.extras.noBalls}, b: ${fullInning.extras.byes}, lb: ${fullInning.extras.legByes})`, margin, currentY);
                currentY += 15;
                
                if (fullInning.fallOfWickets.length > 0) {
                    const fowString = `Fall of Wickets: ${fullInning.fallOfWickets.map((fow, i) => `${i+1}-${fow.score} (${fow.player.name}, ${fow.overs}.${fow.balls})`).join('; ')}`;
                    const splitFow = doc.splitTextToSize(fowString, pageW - margin * 2);
                    doc.text(splitFow, margin, currentY);
                    currentY += splitFow.length * 10 + 25;
                }
            }
            
            addFooter();
            doc.save(`scorecard-${match.team1.name}-vs-${match.team2.name}-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Sorry, an error occurred while generating the PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    const firstInnings = match.innings[0] as Innings;
    const secondInnings = match.innings.length > 1 ? match.innings[1] as Innings : null;
    const firstInningsTeam = match.team1.id === firstInnings.battingTeamId ? match.team1 : match.team2;
    const secondInningsTeam = secondInnings ? (match.team1.id === secondInnings.battingTeamId ? match.team1 : match.team2) : null;
    
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-light-text dark:text-dark-text">Match Summary</h1>
                    <p className="text-xl sm:text-2xl font-bold text-primary dark:text-secondary">{getMatchResult()}</p>
                    {match.manOfTheMatchId && (
                        <p className="text-lg font-semibold text-light-text dark:text-dark-text mt-2">
                            Man of the Match: <span className="text-amber-500 font-bold">{getPlayerName(match.manOfTheMatchId)}</span>
                        </p>
                    )}
                </div>
                
                {!(match.isChaseOnly) && <InningsCard innings={firstInnings} team={firstInningsTeam} showDetails={showDetails} />}
                {secondInnings && secondInnings.batsmen.length > 0 && secondInningsTeam && <InningsCard innings={secondInnings} team={secondInningsTeam} showDetails={showDetails} />}

                 <div id="summary-buttons" className="flex flex-col sm:flex-row gap-4 justify-center pt-4 flex-wrap">
                    {!isSpectatorView && onUndoLastBall && (
                         <button onClick={onUndoLastBall} className="px-6 py-3 rounded-lg bg-yellow-500 text-white font-bold transition-transform transform hover:scale-105">Undo Last Ball</button>
                    )}
                    {!isSpectatorView && setMatch && !match.manOfTheMatchId && (
                        <button onClick={() => setIsMotmModalOpen(true)} className="px-6 py-3 rounded-lg bg-amber-500 text-white font-bold transition-transform transform hover:scale-105">
                            Select Man of the Match
                        </button>
                    )}
                    <button onClick={() => setShowDetails(!showDetails)} className="px-6 py-3 rounded-lg bg-gray-600 text-white font-bold transition-transform transform hover:scale-105">
                        {showDetails ? 'Hide Detailed Scorecard' : 'View Detailed Scorecard'}
                    </button>
                    <button onClick={handleDownloadPdf} disabled={isDownloading || !isPdfLibReady} className="px-6 py-3 rounded-lg bg-green-600 text-white font-bold transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-wait">
                        {isDownloading ? 'Generating PDF...' : !isPdfLibReady ? 'Preparing PDF...' : 'Download as PDF'}
                    </button>
                    {!isSpectatorView && onNewMatch && (
                        <button onClick={onNewMatch} className="px-6 py-3 rounded-lg bg-primary dark:bg-secondary text-white dark:text-dark-bg font-bold transition-transform transform hover:scale-105">Start New Match</button>
                    )}
                    {!isSpectatorView && onGoHome && (
                         <button onClick={onGoHome} className="px-6 py-3 rounded-lg bg-gray-300 dark:bg-gray-700 text-light-text dark:text-dark-text font-bold transition-transform transform hover:scale-105">Go to Home</button>
                    )}
                </div>
            </div>
            {setMatch && (
                <ManOfTheMatchModal
                    isOpen={isMotmModalOpen}
                    onClose={() => setIsMotmModalOpen(false)}
                    onConfirm={handleConfirmMotm}
                    match={match}
                />
            )}
        </div>
    );
};