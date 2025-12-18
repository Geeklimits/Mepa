import React, { useState } from 'react';

const WelcomeView: React.FC = () => {
    const [channel, setChannel] = useState('#Welcome');
    const [message, setMessage] = useState('Hey {user}, Welcome to the strip club! Head to General-Chat to find your soulmate.');
    const [embedColor, setEmbedColor] = useState('#D4AF37');

    return (
        <div className="space-y-8 pb-12">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Welcome Settings 🎀</h3>

                {/* Channel Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">CHANNEL <span className="text-red-500">*</span></label>
                    <select
                        value={channel}
                        onChange={(e) => setChannel(e.target.value)}
                        className="w-full bg-slate-900 text-white rounded-xl p-3 border border-slate-700 focus:ring-2 focus:ring-pink-500 outline-none"
                    >
                        <option>#Welcome</option>
                        <option>#General</option>
                        <option>#Announcements</option>
                    </select>
                </div>

                {/* Message Input */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">MESSAGE</label>
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <img src="https://picsum.photos/seed/mepa_dark/30" alt="Avatar" className="w-6 h-6 rounded-full" />
                            <span className="text-pink-400 font-bold text-sm">Mepa</span>
                            <span className="text-xs bg-blue-600 text-white px-1 rounded">APP</span>
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-transparent text-slate-200 text-sm focus:outline-none resize-none h-20"
                        />
                    </div>
                </div>

                {/* Embed Config */}
                <div className="mb-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-slate-700">Send an embed with this message</span>
                        <div className="w-10 h-6 bg-slate-300 rounded-full cursor-pointer relative">
                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">COLOR</label>
                            <div className="flex space-x-2">
                                {['#D4AF37', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#F97316'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setEmbedColor(color)}
                                        className={`w-6 h-6 rounded-full border-2 ${embedColor === color ? 'border-white ring-2 ring-slate-900' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">THUMBNAIL</label>
                            <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                                🖼️
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                    Save Changes 💾
                </button>

            </div>

            {/* Preview Section */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-1 rounded-[2rem]">
                <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
                    <h4 className="text-lg font-bold mb-4">Preview</h4>
                    <div className="bg-slate-800 p-4 rounded-xl border-l-4" style={{ borderColor: embedColor }}>
                        <h5 className="font-bold text-lg text-white">Welcome {`{user}`}!</h5>
                        <p className="text-slate-300 text-sm mt-1">We were waiting for someone with actual taste to show up. Don't disappoint us.</p>
                        <div className="mt-3 h-32 w-full bg-slate-700 rounded-lg flex items-center justify-center text-slate-500">
                            [Image Banner Placeholder]
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeView;
