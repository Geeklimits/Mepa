
import React from 'react';
import { BotTab } from '../types';

interface HeaderProps {
  activeTab: BotTab;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const getTitle = () => {
    switch (activeTab) {
      case BotTab.DASHBOARD: return 'Server Overview';
      case BotTab.MODERATION: return 'Moderation Command Center';
      case BotTab.MUSIC: return 'Luxury Audio Stream';
      case BotTab.ROLES: return 'Reaction Role Manager';
      case BotTab.PERSONALITY: return 'Talk to Mepa';
      default: return 'Mepa';
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-slate-800 tracking-tight">{getTitle()}</h2>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-600">Dark & Divine</span>
        </div>
        <button className="p-2 hover:bg-pink-50 rounded-full transition-colors text-slate-400 hover:text-pink-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
