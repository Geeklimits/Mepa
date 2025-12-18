
import React, { useState } from 'react';
import { DiscordServer } from '../types';

interface ServerSelectionViewProps {
    servers: DiscordServer[];
    onSelect: (server: DiscordServer) => void;
    error?: string | null;
}

const ServerSelectionView: React.FC<ServerSelectionViewProps> = ({ servers, onSelect, error }) => {
    const [search, setSearch] = useState('');

    const filteredServers = servers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#111827] text-white p-8 md:p-16">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="space-y-4">
                    <h1 className="text-5xl font-bold tracking-tight">Select a server</h1>
                    <p className="text-slate-400 text-lg">You have access to {servers.length} servers.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="text-3xl">🙄</div>
                        <div className="flex-1">
                            <h4 className="font-bold text-red-500 uppercase text-xs tracking-widest mb-1">Mepa is Annoyed</h4>
                            <p className="text-sm text-red-100">{error}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search servers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#1F2937] border-none rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                    <button className="px-8 py-4 bg-[#1F2937] hover:bg-[#374151] rounded-xl flex items-center space-x-3 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span>Refresh</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServers.map((server) => (
                        <div
                            key={server.id}
                            className="bg-[#1F2937] rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-white/10"
                            onClick={() => onSelect(server)}
                        >
                            <div className="h-24 bg-linear-to-tr from-indigo-500 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="p-8 pt-0 -mt-12 flex flex-col items-center text-center space-y-4">
                                <div className="w-24 h-24 rounded-full bg-[#111827] flex items-center justify-center text-4xl shadow-2xl border-4 border-[#1F2937] overflow-hidden">
                                    {server.icon ? (
                                        <img src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`} alt={server.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{server.name[0]}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{server.name}</h3>
                                    <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm mt-1">
                                        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                        <span>{server.approximate_member_count || '???'} Members</span>
                                    </div>
                                </div>

                                <div className="w-full pt-4">
                                    {server.hasBot ? (
                                        <button className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">
                                            Open
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(`https://discord.com/api/oauth2/authorize?client_id=1319041280387420180&permissions=8&scope=bot%20applications.commands`, '_blank');
                                            }}
                                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 active:scale-95"
                                        >
                                            Add Mepa
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServerSelectionView;
