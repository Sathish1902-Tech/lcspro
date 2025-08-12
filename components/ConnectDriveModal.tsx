import React from 'react';
import { User } from '../types';
import { GoogleIcon } from './icons';

interface ConnectDriveModalProps {
  isOpen: boolean;
  user: User;
  onConnect: () => void;
  onCancel: () => void;
}

const ConnectDriveModal: React.FC<ConnectDriveModalProps> = ({ isOpen, user, onConnect, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl p-8 w-full max-w-md space-y-6 text-center">
        <GoogleIcon className="w-12 h-12 mx-auto" />
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Cricket Scorer Pro wants access to your Google Account</h2>
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
          <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
          <div className="text-left">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This will allow Cricket Scorer Pro to:
        </p>
        <ul className="text-sm text-left list-disc list-inside bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <li>See, create, and delete all of your Google Drive files</li>
        </ul>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          (This is a simulation. No real permissions are granted.)
        </p>
        <div className="flex gap-4 pt-4">
          <button onClick={onCancel} className="w-full py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-light-text dark:text-dark-text font-semibold">Cancel</button>
          <button onClick={onConnect} className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold">Allow</button>
        </div>
      </div>
    </div>
  );
};

export default ConnectDriveModal;
