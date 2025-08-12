import React from 'react';
import { User } from '../types';
import { UserPlusIcon, GoogleIcon } from './icons';

interface AccountChooserProps {
  users: User[];
  onLogin: (user: User) => void;
  onAddNewAccount: () => void;
}

const AccountChooser: React.FC<AccountChooserProps> = ({ users, onLogin, onAddNewAccount }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-sm bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
            <GoogleIcon className="w-12 h-12 mx-auto" />
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Choose an account</h1>
            <p className="text-sm text-gray-500">to continue to Cricket Scorer Pro</p>
        </div>
        
        <div className="space-y-2">
            {users.map(user => (
                <button
                    key={user.id}
                    onClick={() => onLogin(user)}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div className="text-left">
                        <p className="font-semibold text-light-text dark:text-dark-text">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </button>
            ))}
        </div>

        <div className="border-t dark:border-gray-600 pt-4">
            <button
                onClick={onAddNewAccount}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                    <UserPlusIcon className="w-6 h-6 text-light-text dark:text-dark-text" />
                </div>
                <p className="font-semibold text-light-text dark:text-dark-text">Use another account</p>
            </button>
        </div>
      </div>
    </div>
  );
};

export default AccountChooser;
