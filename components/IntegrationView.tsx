
import React, { useState } from 'react';

const IntegrationView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const botCode = `
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const ai = new GoogleGenAI({ apiKey: 'YOUR_GEMINI_API_KEY' });

client.on('ready', () => {
  console.log(\`Logged in as \${client.user.tag}! PERIOD. 💅\`);
});

// Moderation & Sassy Responses
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Sassy Keyword Triggers
  const content = message.content.toLowerCase();
  if (content.includes('love') || content.includes('breakup') || content.includes('boyfriend')) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message.content,
      config: { systemInstruction: 'Respond as Mepa, a dark feminine 30yo Gen-Z girl.' }
    });
    return message.reply(response.text);
  }

  // Commands
  if (message.content.startsWith('.clear')) {
    const args = message.content.split(' ');
    const amount = parseInt(args[1]) || 100;
    await message.channel.bulkDelete(amount, true);
    message.channel.send(\`Cleaned up \${amount} messages. They were mid anyway. 🗑️\`);
  }

  if (message.content.startsWith('.play')) {
    message.reply("I'm not a DJ, but fine. Searching... (Add your voice lib here) 🎵");
  }
});

client.login('YOUR_DISCORD_BOT_TOKEN');
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(botCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Get the Bot Code</h3>
            <p className="text-slate-500 mt-1">Copy this into a \`bot.js\` file and run it with Node.js to bring Mepa to life.</p>
          </div>
          <button
            onClick={copyToClipboard}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
          >
            {copied ? 'Copied! ✨' : 'Copy Code 💻'}
          </button>
        </div>

        <div className="relative group">
          <pre className="bg-slate-900 text-pink-50 p-8 rounded-3xl overflow-x-auto text-sm font-mono leading-relaxed max-h-[500px]">
            {botCode}
          </pre>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none rounded-3xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-pink-50 p-6 rounded-3xl border border-pink-100">
          <h4 className="font-bold text-pink-700 mb-2">1. Install Dependencies</h4>
          <code className="text-xs bg-white p-2 block rounded-lg border border-pink-200">
            npm install discord.js @google/genai
          </code>
        </div>
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <h4 className="font-bold text-blue-700 mb-2">2. Get Tokens</h4>
          <p className="text-xs text-blue-600">Grab your token from Discord Developer Portal and your API key from Google AI Studio.</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
          <h4 className="font-bold text-purple-700 mb-2">3. Start Mepa</h4>
          <code className="text-xs bg-white p-2 block rounded-lg border border-purple-200">
            node bot.js
          </code>
        </div>
        <div className="mt-8 pt-8 border-t border-purple-100">
          <h4 className="font-bold text-slate-800 mb-4">Web Dashboard Authentication</h4>
          <p className="text-sm text-slate-600 mb-4">To enable the dashboard login, ensure your backend (bot.js) is running.</p>
          <a hreg="http://localhost:3001/api/auth/discord" className="inline-flex items-center space-x-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-xl transition-all font-medium shadow-md hover:shadow-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 3.903 3.903 0 0 0-.461.939 18.239 18.239 0 0 0-7.394 0 3.903 3.903 0 0 0-.461-.939.074.074 0 0 0-.079-.037 19.791 19.791 0 0 0-4.885 1.515.061.061 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.18 0-2.156-1.085-2.156-2.419 0-1.333.956-2.418 2.156-2.418 1.21 0 2.176 1.085 2.156 2.418 0 1.334-.956 2.419-2.156 2.419zm7.975 0c-1.18 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.176 1.085 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z" /></svg>
            <span>Log In with Discord</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default IntegrationView;
