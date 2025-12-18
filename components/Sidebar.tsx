
import React from 'react';
import { BotTab } from '../types';

interface SidebarProps {
  activeTab: BotTab;
  setActiveTab: (tab: BotTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: BotTab.DASHBOARD, label: 'Overview', icon: '✨' },
    { id: BotTab.MODERATION, label: 'Moderation', icon: '🛡️' },
    { id: BotTab.MUSIC, label: 'Music Player', icon: '🎵' },
    { id: BotTab.ROLES, label: 'Reaction Roles', icon: '🎭' },
    { id: BotTab.PERSONALITY, label: 'Chat Mepa', icon: '🔮' },
    { id: BotTab.INTEGRATION, label: 'Bot Code', icon: '💻' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-50">
      <div className="p-8 border-b border-slate-100 bg-white">
        <h1 className="text-2xl font-serif font-bold text-slate-900 italic tracking-tight">
          mepa <span className="text-purple-500 text-xs block not-italic font-sans font-bold uppercase tracking-[0.2em] mt-1">the high maintenance bot</span>
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto bg-white">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${activeTab === item.id
              ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-100 bg-white">
        <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-[1.25rem]">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-purple-100 shadow-sm overflow-hidden shrink-0">
            <img src="https://picsum.photos/seed/mepa_dark/100" alt="Mepa" className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest truncate">Live Connection</p>
            <p className="text-sm font-semibold text-slate-700 truncate">Mepa #666</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
