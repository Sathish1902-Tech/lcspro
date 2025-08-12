import React, { useState, useRef, useEffect } from 'react';
import { WicketIcon, MenuIcon } from './icons';

interface ScoringControlsProps {
    onRun: (runs: number) => void;
    onExtra: (type: 'Wd' | 'Nb' | 'B' | 'Lb', runs: number) => void;
    onWicket: () => void;
    onRetire: () => void;
    onSwapStrike: () => void;
    onEditSettings: () => void;
    onViewScorecard: () => void;
    onUndo: () => void;
    onCancelMatch: () => void;
    undoDisabled: boolean;
}

const ScoringButton: React.FC<{ onClick?: () => void; children: React.ReactNode; className?: string; disabled?: boolean; type?: 'button' | 'submit' | 'reset'; }> = ({ onClick, children, className, disabled, type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`rounded-lg font-bold text-base h-12 sm:h-14 transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-dark-bg focus:ring-primary dark:focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

const ScoringControls: React.FC<ScoringControlsProps> = ({ onRun, onExtra, onWicket, onRetire, onSwapStrike, onEditSettings, onViewScorecard, onUndo, onCancelMatch, undoDisabled }) => {
    const [extraMode, setExtraMode] = useState<'Wd' | 'Nb' | 'B' | 'Lb' | null>(null);
    const [actionsOpen, setActionsOpen] = useState(false);
    const actionsMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
                setActionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRunClick = (runs: number) => {
        if (extraMode) {
            onExtra(extraMode, runs);
            setExtraMode(null);
        } else {
            onRun(runs);
        }
    };
    
    if (extraMode) {
        return (
            <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-lg w-full space-y-4 animate-fade-in">
                <h3 className="text-xl font-bold text-center text-primary dark:text-secondary">
                    Runs from {extraMode === 'Wd' ? 'Wide' : extraMode === 'Nb' ? 'No Ball' : extraMode === 'B' ? 'Byes' : 'Leg Byes'}?
                </h3>
                <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3, 4, 5, 6].map(runs => (
                        <ScoringButton key={runs} onClick={() => handleRunClick(runs)} className="bg-gray-200 dark:bg-gray-600 text-light-text dark:text-dark-text hover:bg-primary/20 dark:hover:bg-secondary/20">
                            {runs}
                        </ScoringButton>
                    ))}
                    <button onClick={() => setExtraMode(null)} className="col-span-4 rounded-lg font-bold text-lg h-12 bg-gray-400 dark:bg-gray-500 text-white transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    const ActionMenuItem: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode; isDestructive?: boolean; }> = ({ onClick, disabled, children, isDestructive }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                isDestructive
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50'
                : 'text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );

    return (
        <div className="bg-light-card dark:bg-dark-card p-3 sm:p-4 rounded-t-xl sm:rounded-xl shadow-lg w-full space-y-3">
             <div className="grid grid-cols-4 gap-2">
                <button onClick={() => setExtraMode('Wd')} className="h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold text-sm transition-colors hover:bg-blue-200 dark:hover:bg-blue-900">Wide</button>
                <button onClick={() => setExtraMode('Nb')} className="h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold text-sm transition-colors hover:bg-blue-200 dark:hover:bg-blue-900">No Ball</button>
                <button onClick={() => setExtraMode('B')} className="h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold text-sm transition-colors hover:bg-blue-200 dark:hover:bg-blue-900">Bye</button>
                <button onClick={() => setExtraMode('Lb')} className="h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold text-sm transition-colors hover:bg-blue-200 dark:hover:bg-blue-900">Leg Bye</button>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
                {[0, 1, 2, 3, 4, 6].map(runs => (
                    <ScoringButton key={runs} onClick={() => handleRunClick(runs)} className="bg-gray-200 dark:bg-gray-600 text-light-text dark:text-dark-text hover:bg-primary/20 dark:hover:bg-secondary/20">
                        {runs}
                    </ScoringButton>
                ))}
                 <ScoringButton onClick={() => handleRunClick(5)} className="bg-gray-200 dark:bg-gray-600 text-light-text dark:text-dark-text hover:bg-primary/20 dark:hover:bg-secondary/20">5</ScoringButton>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <ScoringButton onClick={onWicket} className="col-span-2 bg-red-500 text-white flex items-center justify-center gap-2 hover:bg-red-600">
                    <WicketIcon className="w-5 h-5"/> WICKET
                </ScoringButton>

                <div className="relative col-span-1" ref={actionsMenuRef}>
                    <ScoringButton onClick={() => setActionsOpen(o => !o)} className="bg-gray-500 text-white w-full flex items-center justify-center gap-2 hover:bg-gray-600">
                        <MenuIcon className="w-5 h-5"/> Actions
                    </ScoringButton>
                    {actionsOpen && (
                        <div className="absolute bottom-full right-0 mb-2 w-56 bg-light-card dark:bg-dark-card rounded-md shadow-lg py-1 z-20 border dark:border-gray-600">
                            <ActionMenuItem onClick={() => { onViewScorecard(); setActionsOpen(false); }}>View Scorecard</ActionMenuItem>
                            <ActionMenuItem onClick={() => { onUndo(); setActionsOpen(false); }} disabled={undoDisabled}>Undo</ActionMenuItem>
                            <ActionMenuItem onClick={() => { onSwapStrike(); setActionsOpen(false); }}>Switch Batsman</ActionMenuItem>
                            <ActionMenuItem onClick={() => { onRetire(); setActionsOpen(false); }}>Retire Batsman</ActionMenuItem>
                            <ActionMenuItem onClick={() => { onEditSettings(); setActionsOpen(false); }}>Match Settings</ActionMenuItem>
                            <div className="border-t dark:border-gray-700 my-1"></div>
                            <ActionMenuItem onClick={() => { onCancelMatch(); setActionsOpen(false); }} isDestructive>Cancel Match</ActionMenuItem>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScoringControls;