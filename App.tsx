
import React, { useState, useEffect } from 'react';
import { BotTab, LogEntry, LogType, DiscordServer, DiscordProfile } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ModerationView from './components/ModerationView';
import MusicView from './components/MusicView';
import RolesView from './components/RolesView';
import PersonalityView from './components/PersonalityView';
import IntegrationView from './components/IntegrationView';
import WelcomeView from './components/WelcomeView';
import DiscordLoginView from './components/DiscordLoginView';
import ServerSelectionView from './components/ServerSelectionView';
import { supabase } from './src/lib/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BotTab>(BotTab.DASHBOARD);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<DiscordProfile | null>(null);
  const [servers, setServers] = useState<DiscordServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<DiscordServer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    let isMounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      setSession(session);
      if (session) {
        await fetchDiscordData(session);
      } else {
        setIsLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      // Only fetch if session actually changed to a logged-in state
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        if (session) fetchDiscordData(session);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setServers([]);
        setSelectedServer(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchDiscordData = async (session: any) => {
    if (!session?.provider_token) {
      console.warn("No provider token found in session.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch Profile
      setProfile({
        id: session.user.id,
        username: session.user.user_metadata.full_name || session.user.user_metadata.name,
        avatar: session.user.user_metadata.avatar_url,
        email: session.user.email
      });

      // Fetch Guilds
      const response = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${session.provider_token}` }
      });

      if (response.status === 429) {
        const err = "Rate limited by Discord. Mepa is annoyed. 🙄 Try again in a minute.";
        setError(err);
        console.error(err);
        return;
      }

      setError(null);
      const guilds = await response.json();

      // Safety check: Discord might return an error object instead of an array
      if (!Array.isArray(guilds)) {
        console.error("Guilds response is not an array:", guilds);
        setServers([]);
        return;
      }

      // Filter for Admin permissions (0x8)
      const adminServers = guilds.filter((g: any) => (parseInt(g.permissions) & 0x8) === 0x8);

      // Simulate bot presence for now
      const mappedServers = adminServers.map((s: any) => ({
        ...s,
        hasBot: s.id === '1319041280387420180' // Placeholder ID
      }));

      setServers(mappedServers);
    } catch (e) {
      console.error("Discord Fetch Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('mepa_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (type: LogType, action: string, target: string, reason?: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      type,
      action,
      user: profile?.username || 'Admin',
      target,
      timestamp: new Date(),
      reason
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const renderContent = () => {
    if (isLoading) return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );

    if (!session) return <DiscordLoginView />;
    if (!selectedServer) return <ServerSelectionView servers={servers} onSelect={setSelectedServer} error={error} />;

    switch (activeTab) {
      case BotTab.DASHBOARD: return <DashboardView logs={logs} selectedServer={selectedServer} />;
      case BotTab.MODERATION: return <ModerationView onLog={addLog} />;
      case BotTab.WELCOME: return <WelcomeView />;
      case BotTab.MUSIC: return <MusicView onLog={addLog} />;
      case BotTab.ROLES: return <RolesView onLog={addLog} />;
      case BotTab.PERSONALITY: return <PersonalityView />;
      case BotTab.INTEGRATION: return <IntegrationView />;
      default: return <DashboardView logs={logs} selectedServer={selectedServer} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {session && selectedServer && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          servers={servers}
          selectedServer={selectedServer}
          onSelectServer={setSelectedServer}
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {session && selectedServer && <Header activeTab={activeTab} profile={profile} onLogout={() => supabase.auth.signOut()} />}

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
