import React, { useState } from 'react';

const WelcomeView: React.FC = () => {
    const [channel, setChannel] = useState('#Welcome');
    const [message, setMessage] = useState('Hey {user}, Welcome to {server}! 🍸');
    const [bgUrl, setBgUrl] = useState('https://i.pinimg.com/originals/a0/0d/16/a00d165f6795f9c5ad9ba5aa19762696.gif'); // Aesthetic default
    const [embedColor, setEmbedColor] = useState('#D4AF37');

    const insertVariable = (variable: string) => {
        setMessage(prev => prev + ` ${variable}`);
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Welcome Settings 🎀</h3>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* LEFT COLUMN: Controls */}
                    <div className="space-y-6">
                        {/* Channel Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Channel</label>
                            <select
                                value={channel}
                                onChange={(e) => setChannel(e.target.value)}
                                className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none font-medium"
                            >
                                <option>#Welcome</option>
                                <option>#General</option>
                                <option>#Lobby</option>
                            </select>
                        </div>

                        {/* Custom Background Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Background Image URL</label>
                            <input 
                                type="text" 
                                value={bgUrl}
                                onChange={(e) => setBgUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none font-medium text-sm"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Paste a direct link to an image/gif (Pinterest, Imgur, etc.)</p>
                        </div>

                        {/* Message Input & Variables */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                                <div className="flex space-x-2">
                                    {['{user}', '{server}', '{memberCount}'].map(v => (
                                        <button 
                                            key={v}
                                            onClick={() => insertVariable(v)}
                                            className="text-[10px] bg-pink-100 text-pink-600 px-2 py-1 rounded-md font-bold hover:bg-pink-200"
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-slate-50 text-slate-800 rounded-xl p-4 border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none h-32 text-sm leading-relaxed resize-none"
                            />
                        </div>

                        {/* Save Button */}
                        <button className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">
                            Save Configuration 💾
                        </button>
                    </div>

                    {/* RIGHT COLUMN: Live Preview */}
                    <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
                        <div className="absolute top-0 right-0 p-6 opacity-20 text-6xl font-serif italic pointer-events-none">Preview</div>
                        
                        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-6">
                            
                            {/* Discord Message Mockup */}
                            <div className="flex items-start space-x-3 opacity-80 scale-90 origin-left">
                                <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-lg">💅</div>
                                <div>
                                    <div className="flex items-baseline space-x-2">
                                        <span className="font-bold text-pink-400">Mepa</span>
                                        <span className="text-[10px] bg-[#5865F2] px-1 rounded text-white">BOT</span>
                                        <span className="text-xs text-slate-400">Today at 4:20 PM</span>
                                    </div>
                                    <p className="text-sm text-slate-300 mt-1">{message.replace('{user}', '@User').replace('{server}', 'The Coven')}</p>
                                </div>
                            </div>

                            {/* THE CARD PREVIEW (Canvas Simulation) */}
                            <div className="relative w-full aspect-[2/1] bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/50 group">
                                {/* Background Image */}
                                <img 
                                    src={bgUrl || 'https://via.placeholder.com/600x300'} 
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    alt="Welcome Background"
                                />
                                <div className="absolute inset-0 bg-black/30"></div>

                                {/* Content Overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-4 border-white/90 shadow-2xl overflow-hidden relative z-10">
                                            <img src="https://picsum.photos/seed/user_avatar/200" className="w-full h-full object-cover" />
                                        </div>
                                        {/* Status Indicator */}
                                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-slate-900 rounded-full z-20"></div>
                                    </div>

                                    <div className="mt-4 text-center">
                                        <h2 className="text-3xl font-black text-white uppercase tracking-wider drop-shadow-lg font-serif">Welcome</h2>
                                        <p className="text-xl font-medium text-pink-200 drop-shadow-md">@NewUser</p>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-center text-xs text-slate-500 mt-4 italic">
                                "This creates a visual card generated on-the-fly when a user joins."
                            </p>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default WelcomeView;
