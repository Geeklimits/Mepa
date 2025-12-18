
import React from 'react';
import { BotTab, DiscordProfile } from '../types';

interface HeaderProps {
  activeTab: BotTab;
  profile: DiscordProfile | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, profile, onLogout }) => {
  const getTitle = () => {
    switch (activeTab) {
      case BotTab.DASHBOARD: return 'Server Overview';
      case BotTab.MODERATION: return 'Moderation Command Center';
      case BotTab.WELCOME: return 'Luxury Audio Stream';
      case BotTab.MUSIC: return 'Reaction Role Manager';
      case BotTab.ROLES: return 'Reaction Role Manager';
      case BotTab.PERSONALITY: return 'Talk to Mepa';
      default: return 'Mepa';
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 relative z-50">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-slate-800 tracking-tight">{getTitle()}</h2>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-600">Dark & Divine</span>
        </div>

        {profile && (
          <div className="flex items-center space-x-4 group cursor-pointer relative">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none">{profile.username}</p>
              <button
                onClick={onLogout}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-slate-100 overflow-hidden shadow-sm group-hover:border-pink-200 transition-colors">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                  {profile.username[0]}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
