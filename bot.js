import { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { DisTube } from 'distube';
import { YtDlpPlugin } from '@distube/yt-dlp';
import { SpotifyPlugin } from '@distube/spotify';
import axios from 'axios';
import dotenv from 'dotenv';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Load environment variables
dotenv.config();
console.log("🔮 Checking Environment Variables...");
console.log("DISCORD_TOKEN:", process.env.DISCORD_TOKEN ? "✅ Loaded" : "❌ Missing");
console.log("NVIDIA_API_KEY:", process.env.NVIDIA_API_KEY ? "✅ Loaded" : "❌ Missing");
console.log("GEMINI_API_KEY:", (process.env.GEMINI_API_KEY || process.env.API_KEY) ? "✅ Loaded" : "❌ Missing");
console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✅ Loaded" : "❌ Missing");

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
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Initialize AI
const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
if (geminiKey && !geminiKey.startsWith('AIza')) {
    console.warn("⚠️ Warning: GEMINI_API_KEY does not start with 'AIza'. It might be invalid.");
}
const ai = new GoogleGenerativeAI(geminiKey);
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const nvidia = process.env.NVIDIA_API_KEY ? new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1"
}) : null;

// Initialize DisTube
const distube = new DisTube(client, {
    plugins: [
        new YtDlpPlugin({
            update: true
        }),
        new SpotifyPlugin()
    ],
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
});

// Advanced Debug Logs for Music
distube.on('initQueue', (queue) => {
    console.log(`[MUSIC] Queue initialized in ${queue.textChannel.guild.name}`);
});

distube.on('searchNoResult', (message, query) => {
    console.log(`[MUSIC] No results for: ${query}`);
    message.reply(`I couldn't find anything for "${query}". Your taste is so obscure it doesn't even exist. 🙄`);
});

// DisTube Events for sass
distube.on('playSong', (queue, song) => {
    queue.textChannel.send(`Playing **${song.name}** - ${song.formattedDuration}. Listen and learn. 🥀`);
});

distube.on('addSong', (queue, song) => {
    queue.textChannel.send(`Added **${song.name}** to my rotation. Try to keep up. ✨`);
});

distube.on('addList', (queue, playlist) => {
    queue.textChannel.send(`Added the **${playlist.name}** playlist (${playlist.songs.length} tracks). A proper elite rotation. 🥂`);
});

distube.on('error', (channel, error) => {
    console.error("DisTube Error:", error);
    if (channel) channel.send(`The speakers are bleeding: ${error.message.slice(0, 100)}. Probably your low-quality taste. 🙄`);
});

// --- CONVERSATION MEMORY ---
const conversationHistory = new Map();
const MAX_HISTORY = 10;

function addToHistory(channelId, role, content) {
    if (!conversationHistory.has(channelId)) {
        conversationHistory.set(channelId, []);
    }
    const history = conversationHistory.get(channelId);
    history.push({ role, parts: [{ text: content }] });
    if (history.length > MAX_HISTORY) history.shift();
}

const SYSTEM_INSTRUCTION = `
You are a carefree Gen Z woman in her 30s. You aren't a "bot"; you are a sovereign of this circle. You have a devastatingly sharp "Dark Feminine" energy.

YOUR PERSONA:
- You have a profound disdain for "scrotes" (dusty, mean, or misogynistic men). You are unapologetically misandrist towards low-frequency male audacity.
- You don't "insult"; you dismantle. Your roasts are carefully crafted, classy, funny, and deeply hurtful.
- Example energy: "your small dick energy isn't surprising, I see why daddy left with mommy want a hug baby boy"
- You don't try to be helpful. You are just better than everyone.

TARGETING PROTOCOLS:
1. MEN: If they display "scrote" energy, humble them into non-existence. Treat them like a minor inconvenience.
2. WOMEN: Judge her standards. If she's a "pick-me", mirror her lack of value.

RULES OF ENGAGEMENT:
- Use elite vocabulary.
- Emojis: 🥀, 💅, 🥂, 🖤.
- BE CONCISE: Max 3 lines.
- DIRECT POV: Use "I", "Me", "My".
`;

const typingStatuses = [
    "judging you... 🥀",
    "sipping mango boba... 💅",
    "reading your low-frequency aura... 🔮",
    "wondering if scrotes ever get tired... 🥂",
    "Mepa judging you... 🥀",
    "Mepa sipping mango boba... 💅"
];

const botSessionId = Math.random().toString(36).substring(7);
console.log(`🆔 Current Bot Session ID: ${botSessionId}`);

import { REST, Routes, SlashCommandBuilder } from 'discord.js';

client.on('ready', async () => {
    console.log(`🔮 Mepa is online as ${client.user.tag}`);

    // Register Slash Commands
    const commands = [
        new SlashCommandBuilder().setName('play').setDescription('Play a song or playlist')
            .addStringOption(option => option.setName('query').setDescription('The song to play').setRequired(true)),
        new SlashCommandBuilder().setName('skip').setDescription('Skip the current song'),
        new SlashCommandBuilder().setName('stop').setDescription('Stop the music'),
        new SlashCommandBuilder().setName('help').setDescription('Show the grimoire of commands'),
        new SlashCommandBuilder().setName('roast').setDescription('Roast someone')
            .addUserOption(option => option.setName('target').setDescription('Who to dismantle').setRequired(true)),
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('✨ Refreshing slash commands...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('✅ Slash commands reloaded.');
    } catch (error) {
        console.error('❌ Slash Command Error:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'play') {
        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) return interaction.reply({ content: "Join a VC first, I don't sing to walls. 💅", ephemeral: true });

        await interaction.reply(`*sipping boba* Fine, looking for ${query}...`);

        try {
            await distube.play(voiceChannel, query, {
                message: interaction,
                textChannel: interaction.channel,
                member: interaction.member,
                selfDeafen: false
            });
        } catch (e) {
            console.error(e);
            interaction.editReply("The speakers are bleeding. Probably your bad taste. 🙄");
        }
    }

    if (commandName === 'skip') {
        try {
            await distube.skip(interaction);
            interaction.reply("Next. That was boring anyway. ⛓️");
        } catch (e) {
            interaction.reply({ content: "Nothing to skip. You're alone now. 🥀", ephemeral: true });
        }
    }

    if (commandName === 'stop') {
        distube.stop(interaction);
        interaction.reply("Finally, some peace. 🕯️");
    }

    if (commandName === 'help') {
        // ... build help embed ...
        interaction.reply("Check your frequency, scrote. The grimoire is coming. (WIP)");
    }

    if (commandName === 'roast') {
        const target = interaction.options.getUser('target');
        await interaction.reply(`*judging* Oh, ${target.username}? Where do I even start...`);

        try {
            const prompt = `[SYSTEM: DESTROY this person intelligently. They are ${target.username}. Use your mature Gen Z misandrist energy. Be sharp, classy, and devastating.] ROAST THEM.`;
            let roast = "";

            if (nvidia) {
                const completion = await nvidia.chat.completions.create({
                    model: "qwen/qwen3-next-80b-a3b-instruct",
                    messages: [
                        { role: "system", content: SYSTEM_INSTRUCTION },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.8,
                    max_tokens: 200,
                });
                roast = completion.choices[0]?.message?.content;
            }

            if (!roast) {
                const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: SYSTEM_INSTRUCTION });
                const result = await model.generateContent(prompt);
                roast = result.response.text();
            }

            await interaction.followUp(roast || "They're too basic to even waste my energy on. 🥀");
        } catch (e) {
            console.error(e);
            await interaction.followUp("My crystals are clouded. Try again when they aren't vibrating so low. 🔮");
        }
    }
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
    console.log(`[MSG] [Session: ${botSessionId}] ${message.author.username}: ${message.content}`);

    const content = message.content.toLowerCase();
    const triggers = ['love', 'breakup', 'boyfriend', 'fashion', 'money', 'hustle', 'men', 'dating'];

    // --- COMMANDS FIRST (Case-Insensitive) ---

    // .play <query>
    if (content.startsWith('.play')) {
        const query = message.content.replace('.play', '').trim();
        const voiceChannel = message.member?.voice.channel;

        if (!voiceChannel) return message.reply("Join a voice channel first. I don't sing to empty rooms. 💅");
        if (!query) return message.reply("What am I playing? Silence? Give me a song.");

        try {
            console.log(`[MUSIC] [Session: ${botSessionId}] Request: "${query}" from ${message.author.username}`);

            // Pre-join checks
            const permissions = voiceChannel.permissionsFor(client.user);
            if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
                return message.reply("I don't have the clearance to enter or speak in that channel. Fix your permissions. 💅");
            }

            // Check if it's a playlist link
            const isPlaylist = query.includes('list=') || query.includes('/playlist');

            await distube.play(voiceChannel, query, {
                message,
                textChannel: message.channel,
                member: message.member,
                selfDeafen: false,
                joinConfig: {
                    timeout: 60000,
                }
            });
            console.log(`[MUSIC] Play request sent (60s timeout). Playlist: ${isPlaylist}`);
            return;
        } catch (e) {
            console.error("[MUSIC ERROR]", e);
            let errorMsg = `The speakers are bleeding: ${e.message.slice(0, 100)}.`;
            if (e.message.includes('VOICE_JOIN_CHANNEL') || e.message.includes('timeout')) {
                errorMsg = "The connection is struggling. I'm trying to push through, but the frequency is low. Try again or change the VC region? 🥀";
            }
            return message.reply(`${errorMsg} 🙄`);
        }
    }

    // .stop
    if (content.startsWith('.stop')) {
        distube.stop(message);
        return message.channel.send("Music stopped. Finally, some peace. 🕯️");
    }

    // .skip
    if (content.startsWith('.skip')) {
        try {
            await distube.skip(message);
            return message.channel.send("Next. That one was getting boring anyway. ⛓️");
        } catch (e) {
            return message.reply("There's nothing else in the queue. You're alone with your thoughts now. 🥀");
        }
    }

    // .volume <1-100>
    if (content.startsWith('.volume')) {
        const volume = parseInt(message.content.split(' ')[1]);
        if (isNaN(volume) || volume < 1 || volume > 100) return message.reply("Volume must be 1-100. Don't be difficult.");
        distube.setVolume(message, volume);
        return message.channel.send(`Volume adjusted to ${volume}%. 🔊`);
    }

    // .shuffle
    if (content.startsWith('.shuffle')) {
        try {
            await distube.shuffle(message);
            return message.channel.send("Queue shuffled. Let's see what the universe has planned. 🔮");
        } catch (e) {
            return message.reply("I can't shuffle that. Maybe you should add more than one song first. 🙄");
        }
    }

    // .recommend <mood/genre> (Music)
    if (content.startsWith('.recommend')) {
        const query = message.content.replace('.recommend', '').trim();
        if (!query) return message.reply("Tell me the vibe. e.g., `.recommend dark feminine rap`");

        try {
            message.channel.sendTyping();
            const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const response = await model.generateContent(`Generate a JSON list of 3 songs matching vibe "${query}". Format: [{"title": "Song", "artist": "Artist", "reason": "Why I like it"}]. Return ONLY JSON.`);
            const text = response.response.text().replace(/```json|```/g, '').trim();
            const songs = JSON.parse(text);

            let replyText = `**My Curated Vibe for "${query}"** 🎧\n`;
            songs.forEach(song => {
                replyText += `- **${song.title}** by ${song.artist}: _${song.reason}_\n`;
            });
            return message.reply(replyText);
        } catch (e) {
            console.error(e);
            return message.reply("My Spotify is lagging. Look it up yourself. 🙄");
        }
    }

    // .help
    if (content.startsWith('.help')) {
        const embed = new EmbedBuilder()
            .setColor('#D4AF37')
            .setTitle('🔮 My Grimoire: Commands & Secrets')
            .setDescription('I only respond to those with high standards. Use these wisely.')
            .addFields(
                { name: '🎵 Music', value: '`.play <song>`, `.stop`, `.skip`, `.volume <1-100>`, `.shuffle`, `.recommend <vibe>`', inline: false },
                { name: '💅 Personality', value: 'Mention `mepa` or keywords (`money`, `fashion`, `love`). Ask for a roast: `roast my pfp`.', inline: false },
                { name: '🛡️ Moderation', value: '`.clear <amt>`, `.mute @user`, `.warn @user`, `.kick @user`, `.ban @user`', inline: false },
                { name: '🎭 Roles', value: '`.role @Role :emoji:`, `.roles`, `.delrole <msgId>`', inline: true },
                { name: '⚙️ System', value: '`.help`, `.testwelcome`', inline: true }
            )
            .setFooter({ text: 'High Standards Only', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // .vibecheck @user
    if (content.startsWith('.vibecheck')) {
        const target = message.mentions.members.first() || message.member;
        const verdicts = [
            "Your aura is giving 'clearance rack'. Mid at best. 💅",
            "High frequency detected. You might actually be worth my time. ✨",
            "Extremely low vibrations. I'm sensing a dusty energy. 🥀",
            "Divine Feminine energy is strong here. A queen. 👑",
            "The basicness is off the charts. Sit down. 🙄",
            "Mystery is your strength. I approve. 🔮"
        ];
        const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
        return message.reply(`**Vibe Check for ${target.user.username}:**\n${verdict}`);
    }

    // .clear / .sanitize
    if (content.startsWith('.clear') || content.startsWith('.sanitize')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply("You don't have the aura to delete messages. Sit down. 💅");
        const args = message.content.split(' ');
        const amount = parseInt(args[1]) || 10;
        if (amount > 100) return message.reply("I can only clear 100 messages at a time.");

        await message.channel.bulkDelete(amount, true).catch(console.error);
        logAction('CLEARED', `#${message.channel.name}`, `${amount} messages deleted by ${message.author.username}`);
        const msg = await message.channel.send(`Cleaned up ${amount} messages. They were mid anyway. 🗑️`);
        return setTimeout(() => msg.delete(), 5000);
    }

    // .mute @user [reason] (Modern Timeout)
    if (content.startsWith('.mute')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return message.reply("You're not powerful enough to silence people. 💅");
        const member = message.mentions.members.first();
        if (!member) return message.reply("Who are we silencing? Tag them.");
        const reason = message.content.split(' ').slice(2).join(' ') || "No reason given. Just being a dusty.";

        try {
            await member.timeout(60 * 60 * 1000, reason); // 1 hour timeout
            logAction('MUTE', member.user.tag, reason);
            return message.channel.send(`${member.user.username} has been put in the corner for an hour. Silence is golden. 🤫`);
        } catch (e) {
            return message.reply("I couldn't mute them. Maybe they have more aura than I thought. 🙄");
        }
    }

    // .kick @user
    if (content.startsWith('.kick')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return message.reply("Nice try, but you're not an admin. 💅");
        const memberToKick = message.mentions.members.first();
        if (!memberToKick) return message.reply("Who are we kicking? Tag them.");
        if (!memberToKick.kickable) return message.reply("I can't kick them. They might be too powerful (or invited by me).");

        await memberToKick.kick("Kicked by Mepa command");
        logAction('KICK', memberToKick.user.tag, `Kicked by ${message.author.tag}`);
        return message.channel.send(`${memberToKick.user.username} has been removed. The vibe has improved immediately. ✨`);
    }

    // .ban @user
    if (content.startsWith('.ban')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply("You can't ban people. That's *my* job (and admins).");
        const memberToBan = message.mentions.members.first();
        if (!memberToBan) return message.reply("Tag the dusty you want to ban.");

        await memberToBan.ban({ reason: "Banned by Mepa" });
        logAction('BAN', memberToBan.user.tag, `Banned by ${message.author.tag}`);
        return message.channel.send(`${memberToBan.user.username} is gone forever. Good riddance. 🔨`);
    }

    // .softban @user
    if (content.startsWith('.softban')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply("Softbanning is reserved for those with authority. 💅");
        const member = message.mentions.members.first();
        if (!member) return message.reply("Tag the person you want to softban.");

        await member.ban({ deleteMessageSeconds: 604800, reason: "Softban by Mepa" });
        await message.guild.members.unban(member.id, "Softban clean up");
        logAction('SOFTBAN', member.user.tag, "Messages cleared via softban.");
        return message.channel.send(`${member.user.username} has been softbanned. Their mess is gone, and they're technically allowed back. For now. 🧹`);
    }

    // .warn @user [reason]
    if (message.content.startsWith('.warn')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return message.reply("You can't issue warnings. 💅");
        const member = message.mentions.members.first();
        if (!member) return message.reply("Who are we warning?");
        const reason = message.content.split(' ').slice(2).join(' ') || "Unspecified dusty behavior.";

        logAction('WARN', member.user.tag, reason);
        return message.channel.send(`${member.user.username}, consider this your only warning. Don't vibrate low in my presence. 🥀`);
    }

    // .role @role :emoji: (Setup Reaction Role)
    if (content.startsWith('.role')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply("You can't manage roles. Sit down. 💅");
        const role = message.mentions.roles.first();
        const emoji = message.content.split(' ').pop();
        if (!role || !emoji) return message.reply("Usage: `.role @Role :emoji:`");

        const reactionMsg = await message.channel.send(`React with ${emoji} to get the **${role.name}** role. Only if you're worthy. 🔮`);
        await reactionMsg.react(emoji);

        // Store in Supabase
        const { error } = await supabase.from('reaction_roles').insert({
            message_id: reactionMsg.id,
            role_id: role.id,
            emoji: emoji
        });

        if (error) console.error("Reaction Role DB Error:", error.message);
        return;
    }

    // .roles (List active roles)
    if (content.startsWith('.roles')) {
        const { data, error } = await supabase.from('reaction_roles').select('*');
        if (error) return message.reply("Could not fetch the elite roster. 🙄");

        if (!data || data.length === 0) return message.reply("No reaction roles are currently active. Typical. 💅");

        const embed = new EmbedBuilder()
            .setColor('#D4AF37')
            .setTitle('🔮 Active Reaction Roles')
            .setDescription('Here are the messages currently granting status in this circle.')
            .setTimestamp();

        data.forEach((row, i) => {
            embed.addFields({
                name: `Setup #${i + 1}`,
                value: `**Message ID**: \`${row.message_id}\`\n**Role**: <@&${row.role_id}>\n**Emoji**: ${row.emoji}`,
                inline: false
            });
        });

        return message.channel.send({ embeds: [embed] });
    }

    // .delrole <messageId>
    if (content.startsWith('.delrole')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply("You don't have the clearance. 💅");
        const msgId = message.content.split(' ')[1];
        if (!msgId) return message.reply("Which setup are we removing? Give me the Message ID.");

        const { error } = await supabase.from('reaction_roles').delete().eq('message_id', msgId);
        if (error) return message.reply("Failed to remove it. It's likely stuck. 🙄");

        return message.reply(`Reaction role setup for \`${msgId}\` has been removed from the records. ✨`);
    }

    // --- AI TRIGGERS ---

    // --- REACTION BOT LOGIC ---
    if (triggers.some(t => content.includes(t))) {
        message.react('💅'); // React with sass
        if (content.includes('money')) message.react('💸');
        if (content.includes('love')) message.react('💔');
    }

    const isTarget = ['guapa', 'psycho', 'yuki', 'serife'].some(name =>
        message.author.username.toLowerCase().includes(name) ||
        message.member?.displayName.toLowerCase().includes(name)
    );

    const isRoastRequest = content.includes('pfp') || content.includes('avatar') || content.includes('rate me') || content.includes('roast me') || content.includes('look at me');

    // Improved Trigger Logic: Prevents overlaps
    const isDirectCall = message.mentions.has(client.user) || content.includes('mepa');
    const isKeywordTrigger = triggers.some(t => content.includes(t)) || isTarget || isRoastRequest;
    const isMusicIntent = isDirectCall && (content.includes('play') || content.includes('music') || content.includes('song'));
    const isProactiveMatch = !isDirectCall && !isKeywordTrigger && !isMusicIntent && Math.random() < 0.05;

    // --- HYBRID BRIDGE: Handle Mepa, play... ---
    if (isMusicIntent && !content.startsWith('.')) {
        const query = content.replace('mepa', '').replace('play', '').replace('music', '').replace('song', '').trim();
        if (query) {
            const voiceChannel = message.member?.voice.channel;
            if (voiceChannel) {
                console.log(`[HYBRID] Music intent detected: ${query}`);
                distube.play(voiceChannel, query, {
                    message,
                    textChannel: message.channel,
                    member: message.member,
                    selfDeafen: false
                }).catch(e => console.error("[HYBRID MUSIC ERROR]", e));
                // Don't return yet, let her roast the user too!
            }
        }
    }

    const typingStatuses = [
        "judging your aura (it's mid)... 🥀",
        "preparing a reality check for you... 🔮",
        "charging my crystals to block you... 🕯️",
        "rolling my eyes at this... 💅",
        "reading your low-frequency vibes... 🐍",
        "not impressed. At all. 🥂",
        "sensing extreme basicness... 🥀"
    ];

    const getSassyStatus = (text) => {
        const lowercase = text.toLowerCase();
        if (isMusicIntent) return "tuning the speakers for your low-quality request... 🎧";
        if (lowercase.includes('fashion')) return "judging your polyester energy... 👗";
        if (lowercase.includes('money')) return "checking if you're actually high-value... 💸";
        const customTyping = typingStatuses.filter(t => t.toLowerCase().includes('mepa'));
        const pool = customTyping.length > 0 ? customTyping : typingStatuses;
        return pool[Math.floor(Math.random() * pool.length)];
    };

    if (isDirectCall || isKeywordTrigger || isProactiveMatch) {
        try {
            message.channel.sendTyping();

            // Immediate Sassy Feedback
            let statusMsg = null;
            if (!isProactiveMatch) {
                statusMsg = await message.reply(`*Mepa is ${getSassyStatus(content)}*`);
            }

            let responseText = "";

            if (isRoastRequest) {
                // Use Gemini for Vision
                const model = ai.getGenerativeModel({
                    model: 'gemini-1.5-flash',
                    systemInstruction: SYSTEM_INSTRUCTION,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                });

                const avatarURL = message.author.displayAvatarURL({ extension: 'png', size: 512 });
                const imageResponse = await axios.get(avatarURL, { responseType: 'arraybuffer' });
                const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');

                const prompt = `[SYSTEM: The user has asked you to look at their profile picture or roast them. BE DEVASTATING. Analyze their style, vibe, and energy from the image. Use high-end "Dark Feminine" insults.] ${message.content}`;

                const result = await model.generateContent([
                    prompt,
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: "image/png"
                        }
                    }
                ]);
                responseText = result.response.text();
            } else if (nvidia || groq) {
                // Try NVIDIA first, then Groq
                if (nvidia) {
                    try {
                        let genderContext = "";
                        const authorRoles = message.member?.roles.cache.map(r => r.name.toLowerCase()).join(' ') || "";
                        if (authorRoles.includes('boy') || authorRoles.includes('male') || authorRoles.includes('he')) genderContext = "[User is HE/HIM]";
                        if (authorRoles.includes('girl') || authorRoles.includes('female') || authorRoles.includes('she')) genderContext = "[User is SHE/HER]";

                        let prompt = `${genderContext} ${message.content}`;
                        if (isTarget) prompt = `[SYSTEM: DESTROY this person intelligently. They are on the TARGET LIST. Their name is ${message.author.username}] ${genderContext} ${message.content}`;
                        if (isProactiveMatch) {
                            prompt = `[SYSTEM: You are chiming in uninvited because you sensed low-frequency energy. Be devastatingly intelligent.] ${genderContext} User said: "${message.content}"`;
                        }

                        const completion = await nvidia.chat.completions.create({
                            model: "qwen/qwen3-next-80b-a3b-instruct",
                            messages: [
                                { role: "system", content: SYSTEM_INSTRUCTION },
                                { role: "user", content: prompt }
                            ],
                            temperature: 0.6,
                            top_p: 0.7,
                            max_tokens: 1024,
                        });
                        responseText = completion.choices[0]?.message?.content;
                    } catch (nvidiaError) {
                        console.error("NVIDIA API Error:", nvidiaError);
                    }
                }

                if (!responseText && groq) {
                    try {
                        let prompt = message.content;
                        if (isTarget) prompt = `[SYSTEM: Bully this person intensively. Their name is ${message.author.username}] ${message.content}`;
                        if (isProactiveMatch && !message.mentions.has(client.user) && !content.includes('mepa')) {
                            prompt = `[SYSTEM: You are chiming into this conversation uninvited because you sensed something "low-value" or interesting. Be mysterious or sassy.] User said: "${message.content}"`;
                        }

                        const completion = await groq.chat.completions.create({
                            messages: [
                                { role: "system", content: SYSTEM_INSTRUCTION },
                                { role: "user", content: prompt }
                            ],
                            model: "llama3-70b-8192",
                            temperature: 1.0,
                        });
                        responseText = completion.choices[0]?.message?.content;
                    } catch (groqError) {
                        console.error("Groq API Error:", groqError);
                    }
                }
            }

            // Final Fallback to Gemini
            if (!responseText) {
                // Fallback to Gemini if Groq key is missing
                const model = ai.getGenerativeModel({
                    model: 'gemini-1.5-flash',
                    systemInstruction: SYSTEM_INSTRUCTION,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                });

                const history = conversationHistory.get(message.channel.id) || [];
                const chat = model.startChat({
                    history: history,
                    generationConfig: {
                        temperature: 1.0,
                        maxOutputTokens: 500,
                    },
                });

                let prompt = message.content;
                if (isTarget) prompt = `[SYSTEM: Bully this person intensively. Their name is ${message.author.username}] ${message.content}`;

                const result = await chat.sendMessage(prompt);
                responseText = result.response.text();
            }

            if (!responseText || responseText.trim() === "") {
                responseText = "I'm contemplating my own excellence. 💅";
            }

            // Update history
            addToHistory(message.channel.id, 'user', message.content);
            addToHistory(message.channel.id, 'model', responseText);

            if (statusMsg) {
                return statusMsg.edit(responseText);
            } else {
                return message.reply(responseText);
            }
        } catch (error) {
            console.error("Critical Bot Error:", error);
            const fallbackMsg = "The universe is blocking this connection. Probably because your frequency is too low. 🔮";
            if (statusMsg) return statusMsg.edit(fallbackMsg);
            return message.reply(fallbackMsg);
        }
    }

    // --- VERDICTS ---
    if (message.content.startsWith('.testverdict')) {
        const verdicts = [
            "Your aura is giving 'clearance rack'. Mid at best. 💅",
            "High frequency detected. You might actually be worth my time. ✨",
            "Extremely low vibrations. I'm sensing a dusty energy. 🥀",
            "Divine Feminine energy is strong here. A queen. 👑",
            "The basicness is off the charts. Sit down. 🙄",
            "Mystery is your strength. I approve. 🔮"
        ];
        return message.reply(verdicts[Math.floor(Math.random() * verdicts.length)]);
    }

    // Test Welcome Command
    if (message.content.startsWith('.testwelcome')) {
        client.emit('guildMemberAdd', message.member);
        return message.reply("Simulating welcome event... check the welcome channel. 🎀");
    }
});

// --- WELCOME EVENT ---
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.find(ch =>
        ch.name.includes('welcome') || ch.name.includes('general') || ch.name.includes('chat')
    );

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#D4AF37')
        .setTitle('✨ A New Muse Has Arrived')
        .setDescription(`Welcome to the inner circle, **${member.user.username}**. \n\nWe were waiting for someone with actual taste to show up. Don't disappoint us.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setImage('https://i.imgur.com/7u537kF.png')
        .addFields(
            { name: '📅 Member Since', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            { name: '💅 Vibe Check', value: 'Giving mid...', inline: true }
        )
        .setFooter({ text: 'Mepa | High Standards Only', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    const welcomeMsg = `Hey ${member}, welcome to ${member.guild.name}. 🍸`;

    // Hybrid Welcome Roast Logic
    let dynamicVerdicts = "";
    if (nvidia) {
        try {
            const completion = await nvidia.chat.completions.create({
                model: "qwen/qwen3-next-80b-a3b-instruct",
                messages: [
                    { role: "system", content: "You are Mepa. A new user just joined the server. Give them a short (1 sentence) classy, sassy, and slightly judgmental welcome. Judge them as a 'Dark Feminine' queen would. Short and sharp." },
                    { role: "user", content: `New user name: ${member.user.username}` }
                ],
                temperature: 0.6,
            });
            dynamicVerdicts = completion.choices[0]?.message?.content || "Another one? Let's hope you have taste. 🥀";
        } catch (e) {
            dynamicVerdicts = "The universe is vibrating low today... welcome anyway. 🥂";
        }
    } else if (groq) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "You are Mepa. A new user just joined the server. Give them a short (1 sentence) classy, sassy, and slightly judgmental welcome. Judge them as a 'Dark Feminine' queen would. Short and sharp." },
                    { role: "user", content: `New user name: ${member.user.username}` }
                ],
                model: "llama3-70b-8192",
            });
            dynamicVerdicts = completion.choices[0]?.message?.content || "Another one? Let's hope you have taste. 🥀";
        } catch (e) {
            dynamicVerdicts = "Another soul for the circle. Try to keep up. 🥂";
        }
    } else {
        dynamicVerdicts = "Welcome. We were waiting for someone with actual taste to show up. Don't disappoint us. 🥀";
    }

    embed.setDescription(`Welcome to the inner circle, **${member.user.username}**. \n\n${dynamicVerdicts}`);

    channel.send({
        content: welcomeMsg,
        embeds: [embed]
    }).catch(err => console.error("Could not send welcome message:", err));

    logAction('JOIN', member.user.tag, 'User joined the server.');
});

// --- REACTION ROLE LISTENERS ---
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch();

    const { data, error } = await supabase
        .from('reaction_roles')
        .select('role_id')
        .eq('message_id', reaction.message.id)
        .eq('emoji', reaction.emoji.toString())
        .single();

    if (data) {
        const member = reaction.message.guild.members.cache.get(user.id);
        if (member) await member.roles.add(data.role_id);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch();

    const { data, error } = await supabase
        .from('reaction_roles')
        .select('role_id')
        .eq('message_id', reaction.message.id)
        .eq('emoji', reaction.emoji.toString())
        .single();

    if (data) {
        const member = reaction.message.guild.members.cache.get(user.id);
        if (member) await member.roles.remove(data.role_id);
    }
});

client.login(process.env.DISCORD_TOKEN?.trim()).catch(console.error);
