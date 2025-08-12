import React, { useRef, useEffect } from 'react';
import { Innings } from '../types';

interface EventLogProps {
    innings: Innings;
}

const getEventText = (ball: string | number, overIndex: number, ballIndex: number): string => {
    const overAndBall = `${overIndex}.${ballIndex + 1}`;
    if (typeof ball === 'number') {
        return `${overAndBall}: ${ball} run${ball !== 1 ? 's' : ''}`;
    }
    if (ball.includes('W-RO')) {
        const runs = ball.replace('W-RO', '');
        return `${overAndBall}: WICKET (Run Out${runs ? `, ${runs} run${runs > '1' ? 's' : ''}` : ''})`;
    }
    if (ball.includes('W')) {
        return `${overAndBall}: WICKET`;
    }
    if (ball.includes('RET')) {
        return `${overAndBall}: Retired`;
    }
    if (ball.includes('Wd')) {
        const runs = ball.replace('Wd', '');
        return `${overAndBall}: Wide${runs ? ` + ${runs} run${runs > '1' ? 's' : ''}` : ''}`;
    }
    if (ball.includes('Nb')) {
        const runs = ball.replace('Nb', '');
        return `${overAndBall}: No Ball${runs ? ` + ${runs} run${runs > '1' ? 's' : ''}` : ''}`;
    }
    if (ball.includes('B')) {
        const runs = ball.replace('B', '');
        return `${overAndBall}: ${runs} Bye${runs > '1' ? 's' : ''}`;
    }
    if (ball.includes('Lb')) {
        const runs = ball.replace('Lb', '');
        return `${overAndBall}: ${runs} Leg Bye${runs > '1' ? 's' : ''}`;
    }
    return `${overAndBall}: ${ball}`;
};


export const EventLog: React.FC<EventLogProps> = ({ innings }) => {
    const logRef = useRef<HTMLDivElement>(null);
    const allEvents: { text: string; key: string }[] = [];

    innings.timeline.forEach((over, overIndex) => {
        over.forEach((ball, ballIndex) => {
            allEvents.push({
                text: getEventText(ball, overIndex, ballIndex),
                key: `${overIndex}-${ballIndex}`
            });
        });
    });

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = 0;
        }
    }, [allEvents.length]);

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-lg w-full h-64 flex flex-col">
            <h3 className="text-xl font-bold text-primary dark:text-secondary mb-2 flex-shrink-0">Recent Events</h3>
            <div ref={logRef} className="flex-grow overflow-y-auto space-y-1 pr-2">
                {allEvents.slice().reverse().map(event => (
                    <p key={event.key} className="text-sm text-light-text dark:text-dark-text bg-gray-100 dark:bg-gray-700 p-1.5 rounded-md">
                        {event.text}
                    </p>
                ))}
                {allEvents.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No events yet.</p>
                )}
            </div>
        </div>
    );
};
