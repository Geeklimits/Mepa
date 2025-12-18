import React, { useState } from 'react';

const WelcomeView: React.FC = () => {
    // Load from localStorage or defaults
    const [channel, setChannel] = useState(() => localStorage.getItem('mepa_welcome_channel') || '#Welcome');
    const [message, setMessage] = useState(() => localStorage.getItem('mepa_welcome_message') || 'Hey {user}, Welcome to {server}! 🍸');
    const [bgUrl, setBgUrl] = useState(() => localStorage.getItem('mepa_welcome_bg') || 'https://i.pinimg.com/originals/a0/0d/16/a00d165f6795f9c5ad9ba5aa19762696.gif');

    // New State for Advanced Customization
    const [titleText, setTitleText] = useState(() => localStorage.getItem('mepa_welcome_title') || 'Welcome');
    const [titleColor, setTitleColor] = useState(() => localStorage.getItem('mepa_welcome_color') || '#ffffff');
    const [isGradient, setIsGradient] = useState(() => localStorage.getItem('mepa_welcome_is_gradient') === 'true');
    const [gradientPreset, setGradientPreset] = useState(() => localStorage.getItem('mepa_welcome_gradient') || 'from-yellow-300 via-yellow-500 to-yellow-600');

    const insertVariable = (variable: string) => {
        setMessage(prev => prev + ` ${variable}`);
    };

    const handleSave = () => {
        localStorage.setItem('mepa_welcome_channel', channel);
        localStorage.setItem('mepa_welcome_message', message);
        localStorage.setItem('mepa_welcome_bg', bgUrl);
        localStorage.setItem('mepa_welcome_title', titleText);
        localStorage.setItem('mepa_welcome_color', titleColor);
        localStorage.setItem('mepa_welcome_is_gradient', String(isGradient));
        localStorage.setItem('mepa_welcome_gradient', gradientPreset);

        alert("Configuration Saved! 💾 (Note: For the actual bot to see local uploads, you'll need to host them. Dashboard preview saved.)");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBgUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const gradientOptions = [
        { label: 'Gold Luxury', value: 'from-yellow-200 via-yellow-400 to-yellow-700' },
        { label: 'Rose Gold', value: 'from-pink-300 via-rose-400 to-rose-600' },
        { label: 'Midnight Purple', value: 'from-purple-400 via-indigo-500 to-blue-600' },
        { label: 'Emerald City', value: 'from-green-300 via-emerald-500 to-teal-700' },
        { label: 'Silver Lining', value: 'from-slate-200 via-slate-400 to-slate-600' },
        { label: 'Neon Cyber', value: 'from-pink-500 via-red-500 to-yellow-500' },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
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

                        {/* Title Customization */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Card Title</label>
                                <input
                                    type="text"
                                    value={titleText}
                                    onChange={(e) => setTitleText(e.target.value)}
                                    className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none font-medium text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Style</label>
                                <div className="flex bg-slate-100 rounded-xl p-1">
                                    <button
                                        onClick={() => setIsGradient(false)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isGradient ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}
                                    >
                                        Solid
                                    </button>
                                    <button
                                        onClick={() => setIsGradient(true)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isGradient ? 'bg-white shadow text-pink-500' : 'text-slate-400'}`}
                                    >
                                        Gradient
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                {isGradient ? 'Select Gradient' : 'Text Color'}
                            </label>

                            {isGradient ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {gradientOptions.map((g) => (
                                        <button
                                            key={g.label}
                                            onClick={() => setGradientPreset(g.value)}
                                            className={`h-12 rounded-xl bg-linear-to-r ${g.value} border-2 transition-all hover:scale-105 ${gradientPreset === g.value ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-2' : 'border-transparent'}`}
                                            title={g.label}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="color"
                                        value={titleColor}
                                        onChange={(e) => setTitleColor(e.target.value)}
                                        className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                                    />
                                    <span className="text-sm font-mono text-slate-500">{titleColor}</span>
                                </div>
                            )}
                        </div>

                        {/* Custom Background Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Background Image</label>
                            <input
                                type="text"
                                value={bgUrl}
                                onChange={(e) => setBgUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none font-medium text-sm mb-2"
                            />
                            <div className="flex items-center space-x-2">
                                <label className="flex-1 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-center border border-slate-200">
                                    <span>📂 Upload from Device</span>
                                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                </label>
                            </div>
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

                        <button
                            onClick={handleSave}
                            className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                        >
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

                            {/* THE CARD PREVIEW */}
                            <div className="relative w-full aspect-2/1 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/50 group">
                                <img
                                    src={bgUrl || 'https://via.placeholder.com/600x300'}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    alt="Welcome Background"
                                />
                                <div className="absolute inset-0 bg-black/30"></div>

                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                    <div className="relative mb-4">
                                        <div className="w-24 h-24 rounded-full border-4 border-white/90 shadow-2xl overflow-hidden relative z-10">
                                            <img src="https://picsum.photos/seed/user_avatar/200" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-slate-900 rounded-full z-20"></div>
                                    </div>

                                    <div className="mt-2 text-center w-full">
                                        <h2
                                            className={`text-4xl font-black uppercase tracking-wider drop-shadow-xl font-serif mb-1 ${isGradient ? `text-transparent bg-clip-text bg-linear-to-r ${gradientPreset}` : ''}`}
                                            style={!isGradient ? { color: titleColor } : {}}
                                        >
                                            {titleText || 'WELCOME'}
                                        </h2>
                                        <p className="text-lg font-medium text-white/90 drop-shadow-md">@NewUser</p>
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
