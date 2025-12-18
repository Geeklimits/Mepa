import React, { useEffect, useState } from 'react';
import { LogEntry } from '../types';
import { supabase } from '../src/lib/supabase';

interface DashboardViewProps {
  logs: LogEntry[]; // Keep prop for fallback/compatibility
}

const DashboardView: React.FC<DashboardViewProps> = ({ logs: initialLogs }) => {
  const [logs, setLogs] = useState<any[]>([]); // Use any[] for demo simplicity as DB shape differs slightly

  // Stats - Static for Demo, but could be dynamic
  const stats = [
    { label: 'Total Members', value: '12,482', change: '+240 this week', icon: '👥' },
    { label: 'Active Today', value: '4,102', change: '🔥 High energy', icon: '✨' },
    { label: 'Banned (Lows)', value: logs.filter(l => l.action === 'BANNED').length.toString(), change: 'Cleaned up the trash', icon: '🗑️' },
    { label: 'Uptime', value: '99.9%', change: 'Better than your last bf', icon: '💅' },
  ];

  useEffect(() => {
    // 1. Initial Fetch
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setLogs(data);
    };
    fetchLogs();

    // 2. Realtime Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'logs' },
        (payload) => {
          setLogs((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getLogBadge = (action: string) => {
    switch (action) {
      case 'BANNED': return 'bg-red-50 text-red-500 border-red-100';
      case 'MUTED': return 'bg-amber-50 text-amber-500 border-amber-100';
      case 'CLEARED': return 'bg-blue-50 text-blue-500 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.change}</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logs Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
              <h3 className="font-bold text-slate-800">Server Activity & Drama</h3>
              <p className="text-xs text-slate-400">Mepa tracks everything you do. 🔮</p>
            </div>
            <span className="text-xs font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-full">{logs.length} events logged</span>
          </div>
          <div className="overflow-x-auto flex-1 max-h-[500px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Context</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No drama yet from Supabase. Connect the bot! 🙄</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getLogBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-sm">{log.subject}</span>
                          <span className="text-[10px] text-slate-400">By System</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-500 text-xs italic truncate max-w-[200px]" title={log.context}>
                          {log.context || "No context"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 text-[10px] font-medium whitespace-nowrap">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col justify-end shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 rotate-12 text-6xl">💸</div>
            <h3 className="text-2xl font-serif font-bold mb-2 italic">Luxury Governance</h3>
            <p className="text-slate-400 text-sm mb-6">Running a server is expensive. Mepa's wisdom is priceless. Keep your vibes high and your bans frequent.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                <span>Server Aura</span>
                <span className="text-pink-400">Immaculate ✨</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full w-[85%]"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">⚡</div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Bot Heartbeat</h4>
              <p className="text-xs text-slate-500">Mepa is judging 4,102 users in real-time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
