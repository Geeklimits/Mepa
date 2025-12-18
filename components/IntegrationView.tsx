
import React, { useState } from 'react';

const IntegrationView: React.FC = () => {
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID || '1451038378093969559'}&permissions=8&scope=bot%20applications.commands`;

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Mepa is Ready.</h3>
          <p className="text-slate-500 mb-8 max-w-xl">
            The code is deployed. The attitude is loaded. All that's left is to unleash her into your server.
            Handle with care. 💅
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl transition-all font-bold shadow-lg hover:shadow-slate-900/20 transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 3.903 3.903 0 0 0-.461.939 18.239 18.239 0 0 0-7.394 0 3.903 3.903 0 0 0-.461-.939.074.074 0 0 0-.079-.037 19.791 19.791 0 0 0-4.885 1.515.061.061 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
              <span>Invite Mepa to Server</span>
            </a>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-pink-500 fill-current">
            <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.3C93.4,8.6,81.8,21.5,70.8,33.2C59.8,44.9,49.4,55.4,37.3,64.3C25.2,73.2,11.4,80.5,-1.9,83.8C-15.2,87.1,-27.9,86.4,-39.7,80.8C-51.5,75.2,-62.4,64.7,-71.4,52.3C-80.4,39.9,-87.5,25.6,-89.9,10.2C-92.3,-5.2,-90,-21.7,-82.1,-35.3C-74.2,-48.9,-60.7,-59.6,-47.1,-67.2C-33.5,-74.8,-19.8,-79.3,-5.4,-70C9,-60.7,23.5,-37.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-pink-50 p-6 rounded-3xl border border-pink-100">
          <h4 className="font-bold text-pink-700 mb-2">Music & Vibes 🎵</h4>
          <p className="text-sm text-pink-800">Use <code>.recommend mood</code> to get a playlist, or <code>.play</code> to mock the vibe.</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
          <h4 className="font-bold text-purple-700 mb-2">Moderation 🛡️</h4>
          <p className="text-sm text-purple-800">Use <code>.kick @user</code> or <code>.ban @user</code>. Mepa handles the trash.</p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationView;
