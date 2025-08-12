import React, { useState } from 'react';
import { User } from '../types';
import { CricketBatIcon } from './icons';

interface LoginPageProps {
    onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSimulatedLogin = () => {
        setIsLoading(true);
        // Simulate a network request to Google
        setTimeout(() => {
            // In a real app, you'd get user data from Google's response.
            // Here, we'll create a dynamic mock user.
            const userId = `user-${Math.random().toString(36).substring(2, 10)}`;
            const mockUser: User = {
                id: userId,
                name: 'Alex Doe', // For simplicity, name and email are static
                email: 'alex.doe@example.com',
                picture: `https://api.dicebear.com/8.x/avataaars/svg?seed=${userId}`,
            };
            onLogin(mockUser);
            // No need to setIsLoading(false) as the component will unmount.
        }, 1500); // Simulate 1.5 second delay
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg p-4 text-center">
            <div className="w-full max-w-sm bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 space-y-8">
                <div className="flex flex-col items-center gap-3">
                    <CricketBatIcon className="w-16 h-16 text-primary dark:text-secondary" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-secondary">Cricket Scorer Pro</h1>
                </div>

                <p className="text-light-text dark:text-dark-text">
                    Sign in to save your matches and track player stats across games.
                </p>
                
                <button
                    onClick={handleSimulatedLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-light-text dark:text-dark-text font-semibold py-3 px-4 rounded-lg text-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-wait"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </>
                    ) : (
                        <>
                            <svg className="w-6 h-6" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.02C43.92 38.04 47 31.83 47 24.55z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6.02c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                            </svg>
                            Sign in with Google
                        </>
                    )}
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    (This is a simulated login for demonstration purposes.)
                </p>
            </div>
        </div>
    );
};

export default LoginPage;