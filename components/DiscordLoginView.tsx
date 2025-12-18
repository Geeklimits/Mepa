import React from 'react';
import { supabase } from '../src/lib/supabase';

const DiscordLoginView: React.FC = () => {
    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                scopes: 'identify email guilds',
                redirectTo: window.location.origin,
            },
        });
        if (error) console.error('Login error:', error.message);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden relative font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            {/* Floating Classy Elements */}
            <div className="absolute top-20 left-20 text-6xl opacity-20 animate-bounce delay-700 select-none">🔮</div>
            <div className="absolute bottom-20 right-20 text-6xl opacity-20 animate-bounce delay-300 select-none">🐍</div>
            <div className="absolute top-1/4 right-32 text-4xl opacity-10 animate-pulse select-none">🥀</div>
            <div className="absolute bottom-1/4 left-32 text-4xl opacity-10 animate-pulse delay-500 select-none">💅</div>

            {/* Main Morphic Card */}
            <div className="relative z-10 max-w-xl w-full mx-4 p-1 rounded-[3rem] bg-linear-to-b from-white/10 to-transparent border border-white/10 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)]">
                <div className="bg-slate-900/40 backdrop-blur-[60px] rounded-[2.9rem] p-12 md:p-16 space-y-12 text-center relative overflow-hidden group">
                    {/* Inner Reflection */}
                    <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent pointer-events-none group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="space-y-6">
                        <div className="relative w-32 h-32 mx-auto">
                            <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full"></div>
                            <div className="relative w-full h-full bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-full flex items-center justify-center border border-white/20 shadow-inner overflow-hidden">
                                <img src="/mepa_icon.png" alt="Mepa Logo" className="w-20 h-20 object-contain drop-shadow-2xl" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-6xl font-serif font-bold text-transparent bg-clip-text bg-linear-to-b from-white via-white to-white/40 italic tracking-tighter">
                                Mepa
                            </h1>
                            <div className="h-0.5 w-12 bg-pink-500/40 mx-auto rounded-full"></div>
                        </div>

                        <p className="text-slate-300 text-lg font-light tracking-wide max-w-sm mx-auto leading-relaxed italic">
                            "Luxury isn't a choice, it's a baseline. Log in to maintain the standard."
                        </p>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="relative w-full py-6 group overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-[#5865F2] group-hover:bg-[#4752C4] transition-colors duration-300"></div>
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                        <div className="relative flex items-center justify-center space-x-4 text-white font-bold text-xl tracking-wide">
                            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z" />
                            </svg>
                            <span>Access Dashboard</span>
                        </div>
                    </button>

                    <div className="pt-4 flex flex-col items-center space-y-4">
                        <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-slate-500 animate-pulse">
                            High Maintenance Protocol v1.4.0
                        </p>
                        <div className="flex items-center space-x-6">
                            <a href="/tos.html" className="text-[10px] text-slate-600 hover:text-pink-500 transition-colors uppercase font-bold tracking-widest">Terms</a>
                            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                            <a href="/privacy.html" className="text-[10px] text-slate-600 hover:text-pink-500 transition-colors uppercase font-bold tracking-widest">Privacy</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-full h-[30%] bg-indigo-500/5 blur-[150px] rounded-full"></div>
        </div>
    );
};

export default DiscordLoginView;
