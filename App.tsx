
import React, { useState, useEffect } from 'react';
import { BotTab, LogEntry, LogType } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ModerationView from './components/ModerationView';
import MusicView from './components/MusicView';
import RolesView from './components/RolesView';
import PersonalityView from './components/PersonalityView';
import IntegrationView from './components/IntegrationView';
import WelcomeView from './components/WelcomeView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BotTab>(BotTab.DASHBOARD);
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('mepa_logs');
    if (saved) {
      return JSON.parse(saved).map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }));
    }
    return [
      { id: '1', type: 'ban', action: 'Banned', user: 'System', target: 'TrashUser99', timestamp: new Date(Date.now() - 120000), reason: 'Spamming broke energy' },
      { id: '2', type: 'mute', action: 'Muted', user: 'System', target: 'AnnoyingGuest', timestamp: new Date(Date.now() - 900000), reason: 'Being basic' },
      { id: '3', type: 'clear', action: 'Cleared', user: 'System', target: '#general', timestamp: new Date(Date.now() - 3600000), reason: '100 messages deleted' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mepa_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (type: LogType, action: string, target: string, reason?: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      type,
      action,
      user: 'Admin', // In a real app, this would be the logged-in user
      target,
      timestamp: new Date(),
      reason
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case BotTab.DASHBOARD: return <DashboardView logs={logs} />;
      case BotTab.MODERATION: return <ModerationView onLog={addLog} />;
      case BotTab.WELCOME: return <WelcomeView />;
      case BotTab.MUSIC: return <MusicView onLog={addLog} />;
      case BotTab.ROLES: return <RolesView onLog={addLog} />;
      case BotTab.PERSONALITY: return <PersonalityView />;
      case BotTab.INTEGRATION: return <IntegrationView />;
      default: return <DashboardView logs={logs} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header activeTab={activeTab} />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
