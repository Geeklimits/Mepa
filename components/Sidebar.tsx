
import React, { useState } from 'react';
import { BotTab, DiscordServer } from '../types';

interface SidebarProps {
  activeTab: BotTab;
  setActiveTab: (tab: BotTab) => void;
  servers: DiscordServer[];
  selectedServer: DiscordServer;
  onSelectServer: (server: DiscordServer) => void;
}

const Sidebar: React.FC<SidebarProps> = React.memo(({
  activeTab,
  setActiveTab,
  servers,
  selectedServer,
  onSelectServer
}) => {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const navItems = [
    { id: BotTab.DASHBOARD, label: 'Overview', icon: '✨' },
    { id: BotTab.MODERATION, label: 'Moderation', icon: '🛡️' },
    { id: BotTab.WELCOME, label: 'Welcome', icon: '🎀' },
    { id: BotTab.MUSIC, label: 'Music Player', icon: '🎵' },
    { id: BotTab.ROLES, label: 'Reaction Roles', icon: '🎭' },
    { id: BotTab.PERSONALITY, label: 'Chat Mepa', icon: '🔮' },
    { id: BotTab.INTEGRATION, label: 'Bot Code', icon: '💻' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-50 overflow-hidden">
      {/* Brand & Server Switcher */}
      <div className="p-6 border-b border-slate-100 bg-white space-y-4 shrink-0">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-slate-100 shrink-0 bg-slate-50">
            <img src="/mepa_icon.png" alt="Mepa Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-serif font-bold text-slate-900 italic tracking-tight">
            mepa <span className="text-purple-500 text-[10px] block not-italic font-sans font-bold uppercase tracking-[0.2em] mt-0.5">high maintenance</span>
          </h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="w-full h-12 flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all group"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 shadow-sm border border-white">
                {selectedServer.icon ? (
                  <img
                    src={`https://cdn.discordapp.com/icons/${selectedServer.id}/${selectedServer.icon}.png`}
                    alt={selectedServer.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">{selectedServer.name[0]}</div>
                )}
              </div>
              <span className="text-sm font-bold text-slate-700 truncate">{selectedServer.name}</span>
            </div>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>

          {isSwitcherOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-100">
              <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                {servers.map(server => (
                  <button
                    key={server.id}
                    onClick={() => {
                      onSelectServer(server);
                      setIsSwitcherOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-2 rounded-xl transition-all ${server.id === selectedServer.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      {server.icon ? (
                        <img
                          src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                          alt={server.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">{server.name[0]}</div>
                      )}
                    </div>
                    <span className="text-xs font-bold truncate">{server.name}</span>
                  </button>
                ))}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 transition-all font-sans"
                >
                  Switch Server
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto bg-white scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${activeTab === item.id
              ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 active:scale-95'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-100 bg-white space-y-4 shrink-0">
        <div className="flex items-center space-x-3 bg-indigo-50 p-3 rounded-2xl border border-indigo-100/50">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-indigo-100 shadow-sm overflow-hidden shrink-0">
            <img src="/mepa_icon.png" alt="Mepa" className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest truncate">Live Connection</p>
            <p className="text-sm font-semibold text-slate-700 truncate">Mepa Bot Active</p>
          </div>
        </div>

        <div className="flex justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <a href="/tos.html" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors">Terms</a>
          <span>•</span>
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors">Privacy</a>
          <span>•</span>
          <span className="text-slate-300">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;
