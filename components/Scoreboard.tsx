import React, { useState } from 'react';
import { MatchState, Innings, Batsman, Bowler, Team, Player } from '../types';
import { CricketBatIcon, CricketBallIcon, PencilIcon, ChevronDownIcon } from './icons';

interface ScoreboardProps {
  match: MatchState;
  onEditPlayer?: (player: Player) => void;
}

const formatOvers = (overs: number, balls: number) => `${overs}.${balls}`;

const calculateStrikeRate = (runs: number, balls: number) => {
  if (balls === 0) return '0.00';
  return ((runs / balls) * 100).toFixed(2);
};

const calculateEconomy = (runs: number, overs: number, balls: number) => {
  if (overs === 0 && balls === 0) return '0.00';
  const totalBalls = overs * 6 + balls;
  return ((runs / totalBalls) * 6).toFixed(2);
};

const Scoreboard: React.FC<ScoreboardProps> = ({ match, onEditPlayer }) => {
  const [isExtrasOpen, setIsExtrasOpen] = useState(false);
  const currentInnings = match.innings[match.currentInnings - 1] as Innings;
  const battingTeam = match.team1.id === currentInnings.battingTeamId ? match.team1 : match.team2;
  const bowlingTeam = match.team1.id === currentInnings.bowlingTeamId ? match.team1 : match.team2;

  const striker = currentInnings.batsmen.find(b => b.id === currentInnings.currentStrikerId);
  const nonStriker = currentInnings.batsmen.find(b => b.id === currentInnings.currentNonStrikerId);
  const bowler = currentInnings.bowlers.find(b => b.id === currentInnings.currentBowlerId);

  const partnership = {
    runs: (striker?.runs || 0) + (nonStriker?.runs || 0),
    balls: (striker?.balls || 0) + (nonStriker?.balls || 0),
  };
  
  const crr = calculateEconomy(currentInnings.score, currentInnings.overs, currentInnings.balls);
  const rrr = match.target 
    ? ((match.target - currentInnings.score) / (((match.targetOvers || match.maxOvers) * 6 - (currentInnings.overs * 6 + currentInnings.balls)) / 6)).toFixed(2) 
    : 'N/A';

  const totalOversSoFar = currentInnings.overs + currentInnings.balls / 6;
  let projectedScore: number | null = null;
  // Project score after a reasonable number of overs (e.g., 5) for better accuracy
  if (totalOversSoFar >= 5 && match.currentInnings === 1 && match.maxOvers > totalOversSoFar) {
      const crrNumber = parseFloat(crr);
      const remainingOvers = match.maxOvers - totalOversSoFar;
      projectedScore = Math.round(currentInnings.score + remainingOvers * crrNumber);
  }

  const thisOver = currentInnings.timeline[currentInnings.timeline.length - 1] || [];
  const prevOver = currentInnings.overs > 0 ? currentInnings.timeline[currentInnings.timeline.length - 2] : undefined;
  
  const totalExtras = Object.values(currentInnings.extras).reduce((a, b) => a + b, 0);

  const renderTargetInfo = () => {
    if (!match.target || match.currentInnings !== 2) return null;

    const runsNeeded = match.target - currentInnings.score;
    const totalBalls = (match.targetOvers || match.maxOvers) * 6;
    const ballsBowled = currentInnings.overs * 6 + currentInnings.balls;
    const ballsRemaining = totalBalls - ballsBowled;

    if (runsNeeded <= 0 || ballsRemaining <= 0 || currentInnings.wickets === 10) {
      return null; // The main game state will handle showing the result.
    }
    
    return (
      <div className="bg-primary/10 dark:bg-secondary/10 p-3 rounded-lg mt-4">
        <p className="text-md sm:text-lg font-semibold text-light-text dark:text-dark-text">
          Need <span className="text-primary dark:text-secondary font-bold text-xl">{runsNeeded}</span> runs in <span className="text-primary dark:text-secondary font-bold text-xl">{ballsRemaining}</span> balls
        </p>
      </div>
    );
  };

  const BallDisplay: React.FC<{ball: string | number}> = ({ ball }) => (
    <span className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm
      ${String(ball).includes('W') ? 'bg-red-500 text-white' : ''}
      ${['4', '6'].includes(String(ball)) ? 'bg-primary dark:bg-secondary text-white' : ''}
      ${!String(ball).includes('W') && !['4', '6'].includes(String(ball)) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}>
      {ball}
    </span>
  );

  return (
    <div className="bg-light-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg w-full space-y-4">
      
      {/* Team Scores */}
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{bowlingTeam.name} vs {battingTeam.name}</p>
        <div className="flex justify-center items-center gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text">{battingTeam.name}</h2>
          <div className="text-4xl sm:text-5xl font-extrabold text-primary dark:text-secondary">
            {currentInnings.score}-{currentInnings.wickets}
            <span className="text-2xl sm:text-3xl font-semibold text-gray-600 dark:text-gray-300 ml-2">({formatOvers(currentInnings.overs, currentInnings.balls)})</span>
          </div>
        </div>
        {match.target && <p className="text-md font-semibold text-light-text dark:text-dark-text mt-1">Target: {match.target}</p>}
        {renderTargetInfo()}
      </div>

      {/* Extras */}
      {totalExtras > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setIsExtrasOpen(!isExtrasOpen)}
            className="w-full flex justify-between items-center text-left py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-semibold text-light-text dark:text-dark-text">Extras</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary dark:text-secondary">{totalExtras}</span>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExtrasOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {isExtrasOpen && (
            <div className="pt-2 pl-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
              <span>Wides: {currentInnings.extras.wides}</span>
              <span>No Balls: {currentInnings.extras.noBalls}</span>
              <span>Byes: {currentInnings.extras.byes}</span>
              <span>Leg Byes: {currentInnings.extras.legByes}</span>
            </div>
          )}
        </div>
      )}

      {/* Batsmen */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary dark:text-secondary"><CricketBatIcon className="w-5 h-5"/> Batsmen</h3>
        <div className="space-y-1 text-sm sm:text-base">
          <div className="grid grid-cols-7 gap-2 font-semibold text-gray-600 dark:text-gray-400">
            <span className="col-span-2">Name</span><span>R</span><span>B</span><span>4s</span><span>6s</span><span>SR</span>
          </div>
          {striker && <BatsmanRow batsman={striker} onEdit={onEditPlayer ? () => onEditPlayer(striker) : undefined} />}
          {nonStriker && <BatsmanRow batsman={nonStriker} onEdit={onEditPlayer ? () => onEditPlayer(nonStriker) : undefined} />}
        </div>
        <p className="text-xs sm:text-sm mt-2">Partnership: {partnership.runs} ({partnership.balls})</p>
      </div>
      
      {/* Bowler */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary dark:text-secondary"><CricketBallIcon className="w-5 h-5"/> Bowler</h3>
        <div className="space-y-1 text-sm sm:text-base">
          <div className="grid grid-cols-6 gap-2 font-semibold text-gray-600 dark:text-gray-400">
            <span className="col-span-2">Name</span><span>O</span><span>M</span><span>R</span><span>W</span>
          </div>
          {bowler && <BowlerRow bowler={bowler} onEdit={onEditPlayer ? () => onEditPlayer(bowler) : undefined} />}
        </div>
      </div>

      {/* Match Stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">CRR</p>
          <p className="font-bold text-lg">{crr}</p>
        </div>
        {match.currentInnings === 2 && match.target ? (
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">RRR</p>
                <p className="font-bold text-lg">{+rrr > 0 && isFinite(+rrr) ? rrr : '-'}</p>
            </div>
        ) : projectedScore ? (
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Projected Score</p>
                <p className="font-bold text-lg">~{projectedScore}</p>
            </div>
        ) : <div /> /* Placeholder to keep grid alignment */ }
      </div>

      {/* Overs Display */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-wrap gap-x-6 gap-y-2">
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">This Over</p>
            <div className="flex gap-1.5 flex-wrap">
              {thisOver.map((ball, index) => <BallDisplay key={index} ball={ball} />)}
            </div>
        </div>
        {prevOver && (
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prev Over</p>
                <div className="flex gap-1.5 flex-wrap">
                  {prevOver.map((ball, index) => <BallDisplay key={index} ball={ball} />)}
                </div>
            </div>
        )}
      </div>

    </div>
  );
};

const BatsmanRow: React.FC<{ batsman: Batsman; onEdit?: () => void; }> = ({ batsman, onEdit }) => (
  <div className={`grid grid-cols-7 gap-2 p-1 rounded ${batsman.onStrike ? 'bg-primary/10 dark:bg-secondary/10' : ''}`}>
    <span className="col-span-2 font-semibold flex items-center">
      {batsman.name}
      {onEdit && <button onClick={onEdit} className="ml-2 p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
        <PencilIcon className="w-3 h-3 text-gray-500"/>
      </button>}
      {batsman.onStrike && <CricketBatIcon className="w-4 h-4 ml-1 text-primary dark:text-secondary" />}
    </span>
    <span className="text-center">{batsman.runs}</span>
    <span className="text-center">{batsman.balls}</span>
    <span className="text-center">{batsman.fours}</span>
    <span className="text-center">{batsman.sixes}</span>
    <span className="text-center">{calculateStrikeRate(batsman.runs, batsman.balls)}</span>
  </div>
);

const BowlerRow: React.FC<{ bowler: Bowler; onEdit?: () => void; }> = ({ bowler, onEdit }) => (
  <div className="grid grid-cols-6 gap-2 p-1 rounded">
    <span className="col-span-2 font-semibold flex items-center">
        {bowler.name}
        {onEdit && <button onClick={onEdit} className="ml-2 p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <PencilIcon className="w-3 h-3 text-gray-500"/>
        </button>}
    </span>
    <span>{formatOvers(bowler.overs, bowler.balls)}</span>
    <span>{bowler.maidens}</span>
    <span>{bowler.runsConceded}</span>
    <span>{bowler.wickets}</span>
  </div>
);

export default Scoreboard;