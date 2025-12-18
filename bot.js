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
    console.log(`🔗 Invite Link: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`);
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

    // --- REACTION BOT LOGIC ---
    if (triggers.some(t => content.includes(t))) {
        message.react('💅'); // React with sass
        if (content.includes('money')) message.react('💸');
        if (content.includes('love')) message.react('💔');
    }

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

    // --- COMMANDS ---

    // .clear
    if (message.content.startsWith('.clear')) {
        if (!message.member.permissions.has('ManageMessages')) return message.reply("You don't have the aura to delete messages. Sit down. 💅");
        const args = message.content.split(' ');
        const amount = parseInt(args[1]) || 10;
        if (amount > 100) return message.reply("I can only clear 100 messages at a time.");

        await message.channel.bulkDelete(amount, true).catch(console.error);
        logAction('CLEARED', `#${message.channel.name}`, `${amount} messages deleted by ${message.author.username}`);
        const msg = await message.channel.send(`Cleaned up ${amount} messages. They were mid anyway. 🗑️`);
        setTimeout(() => msg.delete(), 5000);
    }

    // .kick @user
    if (message.content.startsWith('.kick')) {
        if (!message.member.permissions.has('KickMembers')) return message.reply("Nice try, but you're not an admin. 💅");
        const memberToKick = message.mentions.members.first();
        if (!memberToKick) return message.reply("Who are we kicking? Tag them.");
        if (!memberToKick.kickable) return message.reply("I can't kick them. They might be too powerful (or invited by me).");

        await memberToKick.kick("Kicked by Mepa command");
        logAction('KICK', memberToKick.user.tag, `Kicked by ${message.author.tag}`);
        message.channel.send(`${memberToKick.user.username} has been removed. The vibe has improved immediately. ✨`);
    }

    // .ban @user
    if (message.content.startsWith('.ban')) {
        if (!message.member.permissions.has('BanMembers')) return message.reply("You can't ban people. That's *my* job (and admins).");
        const memberToBan = message.mentions.members.first();
        if (!memberToBan) return message.reply("Tag the dusty you want to ban.");

        await memberToBan.ban({ reason: "Banned by Mepa" });
        logAction('BAN', memberToBan.user.tag, `Banned by ${message.author.tag}`);
        message.channel.send(`${memberToBan.user.username} is gone forever. Good riddance. 🔨`);
    }

    // .recommend <mood/genre> (Music)
    if (message.content.startsWith('.recommend')) {
        const query = message.content.replace('.recommend', '').trim();
        if (!query) return message.reply("Tell me the vibe. e.g., `.recommend dark feminine rap`");

        // Use Gemini to generate JSON
        try {
            message.channel.sendTyping();
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: `Generate a JSON list of 3 songs matching vibe "${query}". Format: [{"title": "Song", "artist": "Artist", "reason": "Why Mepa likes it"}]. Return ONLY JSON.`,
            });
            const text = response.text().replace(/```json|```/g, '').trim();
            const songs = JSON.parse(text);

            let replyText = `**Mepa's Curated Vibe for "${query}"** 🎧\n`;
            songs.forEach(song => {
                replyText += `- **${song.title}** by ${song.artist}: _${song.reason}_\n`;
            });
            message.reply(replyText);
        } catch (e) {
            console.error(e);
            message.reply("My Spotify is lagging. Look it up yourself. 🙄");
        }
    }

    // Test Welcome Command
    if (message.content.startsWith('.testwelcome')) {
        client.emit('guildMemberAdd', message.member);
        message.reply("Simulating welcome event... check the welcome channel. 🎀");
    }
});

// --- WELCOME EVENT ---
client.on('guildMemberAdd', async (member) => {
    // 1. Find the channel
    const channel = member.guild.channels.cache.find(ch =>
        ch.name.includes('welcome') || ch.name.includes('general') || ch.name.includes('chat')
    );

    if (!channel) return;

    // 2. Create the Embed (High Maintenance Vibe)
    const { EmbedBuilder } = await import('discord.js');

    // Gradient-like effect using a rich "Dark Feminine" Hex color (Deep Rose/Mauve)
    // Discord only allows one solid color for the side bar.
    const embed = new EmbedBuilder()
        .setColor('#D4AF37') // Gold/Luxury Color
        .setTitle('✨ A New Muse Has Arrived')
        .setDescription(`Welcome to the inner circle, **${member.user.username}**. \n\nWe were waiting for someone with actual taste to show up. Don't disappoint us.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setImage('https://i.imgur.com/7u537kF.png') // A placeholder "Luxury/Dark" banner or divide
        .addFields(
            { name: '📅 Member Since', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            { name: '💅 Vibe Check', value: 'Pending...', inline: true }
        )
        .setFooter({ text: 'Mepa | High Standards Only', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    // 3. Send Message
    // Supports basic variables: {user}, {server}
    const welcomeMsg = `Hey ${member}, welcome to ${member.guild.name}. 🍸`;

    channel.send({
        content: welcomeMsg,
        embeds: [embed]
    }).catch(err => console.error("Could not send welcome message:", err));

    // 4. Log to Supabase
    logAction('JOIN', member.user.tag, 'User joined the server.');
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);
