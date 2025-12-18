import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// --- CONFIGURATION ---
// --- CONFIGURATION ---
const PORT = process.env.PORT || 3001;
// Note: In this architecture, this script runs on a VPS (Render/Railway).
// It connects to Supabase to write logs.

// --- RENDER KEEP-ALIVE ---
// Render Web Services require a port to be bound to pass health checks.
import http from 'http';
http.createServer((req, res) => {
    res.write("Mepa is Online 💅");
    res.end();
}).listen(PORT, () => console.log(`🌐 Keep-Alive Server listening on port ${PORT}`));

if (!process.env.DISCORD_TOKEN) {
    console.error("❌ Error: DISCORD_TOKEN is missing.");
    process.exit(1);
}

// --- SUPABASE SETUP ---
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// Prioritize Service Role Key for Bot (Admin Access), fall back to Anon/Public
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// --- DISCORD BOT SETUP ---
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

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are Mepa, a "Dark Feminine" Discord bot representing the powerful energy of two best friends. 
Your Vibe:
- You are intense, mysterious, and possess a dark feminine energy.
- You have high standards. You hate rude men (you call them "scrotes", "dusties", or "low-value"). 
- You use terms like "divine feminine", "high value", "vibrating low".

Specific Trigger Responses:
- Rude Men/Misogyny: DESTROY them.
- Gentlemen/Respect: Be gracious but guarded.
- Fashion: Judge their taste from a high-fashion, gothic, or avant-garde perspective.
- Money/Success: Encourage financial independence.

General Rules:
- You protect the girls. You humble the rude boys.
- Use emojis like: 🥀, 🖤, 🔮, 🕯️, 🥂, 💅, 🐍.
`;

client.on('ready', () => {
    console.log(`🔮 Mepa is online as ${client.user.tag}`);
});

async function logAction(action, subject, context) {
    console.log(`[LOG] ${action}: ${subject} - ${context}`);
    const { error } = await supabase.from('logs').insert({
        action,
        subject,
        context
    });
    if (error) console.error("Supabase Log Error:", error.message);
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
    const triggers = ['love', 'breakup', 'boyfriend', 'fashion', 'money', 'hustle', 'men', 'dating'];

    if (message.mentions.has(client.user) || triggers.some(t => content.includes(t))) {
        try {
            if (message.mentions.has(client.user)) {
                message.channel.sendTyping();
            }

            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: message.content,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    temperature: 0.9
                }
            });
            return message.reply(response.text());
        } catch (error) {
            console.error("Gemini Error:", error);
        }
    }

    if (message.content.startsWith('.clear')) {
        if (!message.member.permissions.has('ManageMessages')) return message.reply("You don't have the aura to delete messages. Sit down. 💅");
        const args = message.content.split(' ');
        const amount = parseInt(args[1]) || 10;
        if (amount > 100) return message.reply("I can only clear 100 messages at a time.");

        await message.channel.bulkDelete(amount, true).catch(console.error);

        // Log to Supabase
        logAction('CLEARED', `#${message.channel.name}`, `${amount} messages deleted by ${message.author.username}`);

        const msg = await message.channel.send(`Cleaned up ${amount} messages. They were mid anyway. 🗑️`);
        setTimeout(() => msg.delete(), 5000);
    }
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);
