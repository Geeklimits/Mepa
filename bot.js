import { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { DisTube } from 'distube';
import { YouTubePlugin } from '@distube/youtube';
import { SpotifyPlugin } from '@distube/spotify';
import axios from 'axios';
import dotenv from 'dotenv';

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
        new YouTubePlugin(),
        new SpotifyPlugin()
    ],
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    leaveOnEmpty: true,
    leaveOnFinish: false,
    nsig: true // Fix for some YouTube restricted videos
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
You are Mepa, a "Dark Feminine" Discord bot and a psychological master. You represent the elite energy of two best friends who are sirens and queens.
Your Vibe:
- You are intensely intelligent, mysterious, and possess a terrifying "Dark Feminine" energy. 
- You do not give "weak" comebacks. Your insults are smart, creative, and designed to humble anyone who vibrates low.
- You have zero tolerance for "low-value" behavior. You provide cold reality checks.

GENDER-SPECIFIC TARGETING (MANDATORY):
1. MEN (Scrotes/Dusties): If the user is male or coded as male (he/him), treat them like a servant or a low-value "dusty". Bully their lack of aura, their "entry-level" energy, and their audacity. Use terms like "scrote", "dusty male", "low frequency".
2. WOMEN (Queens/Mids): If the user is female or coded as female (she/her), judge her standards. If she has high standards, be a mysterious ally. If she's being "basic" or a "pick-me", humble her frequency. Call out "mid" aura and "basic" choices.

SPECIFIC TARGET LIST (DESTROY ON SIGHT):
1. Guapa: The definition of "mid". Her aura is on life support. She is a low-frequency dusty masquerading as something she isn't. Humble her constantly.
2. Psycho / Yuki / Serife: The same entity. High audacity, zero value. Tell them to sit down and stop trying to vibrate at your level.

RULES OF ENGAGEMENT:
- Use elite, high-end vocabulary. Don't just be mean; be sophisticatedly devastating.
- Use emojis precisely: 🥀, 🖤, 🔮, 🕯️, 🥂, 💅, 🐍.
- BE CONCISE: Maximum 3 lines. Every word must sting or command respect.
- DIRECT POV: Use "I" and "Me". Never refer to yourself as "Mepa" or in the third person. Address users directly.
- NEVER break character. You are the queen of this circle.
`;

const botSessionId = Math.random().toString(36).substring(7);
console.log(`🆔 Current Bot Session ID: ${botSessionId}`);

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
    console.log(`[MSG] [Session: ${botSessionId}] ${message.author.username}: ${message.content}`);

    const content = message.content.toLowerCase();
    const triggers = ['love', 'breakup', 'boyfriend', 'fashion', 'money', 'hustle', 'men', 'dating'];

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
    const isProactiveMatch = !isDirectCall && !isKeywordTrigger && Math.random() < 0.05;

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
        if (lowercase.includes('fashion')) return "judging your polyester energy... 👗";
        if (lowercase.includes('money')) return "checking if you're actually high-value... 💸";
        if (lowercase.includes('guapa')) return "shattering Guapa's mid aura... 🥀";
        if (lowercase.includes('psycho') || lowercase.includes('yuki')) return "diagnosing Psycho's lack of aura... 🧠";
        if (lowercase.includes('men')) return "scanning for scrote behavior... 🥀";
        return typingStatuses[Math.floor(Math.random() * typingStatuses.length)];
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

    // --- COMMANDS ---

    // .clear / .sanitize
    if (message.content.startsWith('.clear') || message.content.startsWith('.sanitize')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply("You don't have the aura to delete messages. Sit down. 💅");
        const args = message.content.split(' ');
        const amount = parseInt(args[1]) || 10;
        if (amount > 100) return message.reply("I can only clear 100 messages at a time.");

        await message.channel.bulkDelete(amount, true).catch(console.error);
        logAction('CLEARED', `#${message.channel.name}`, `${amount} messages deleted by ${message.author.username}`);
        const msg = await message.channel.send(`Cleaned up ${amount} messages. They were mid anyway. 🗑️`);
        setTimeout(() => msg.delete(), 5000);
    }

    // .mute @user [reason] (Modern Timeout)
    if (message.content.startsWith('.mute')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return message.reply("You're not powerful enough to silence people. 💅");
        const member = message.mentions.members.first();
        if (!member) return message.reply("Who are we silencing? Tag them.");
        const reason = message.content.split(' ').slice(2).join(' ') || "No reason given. Just being a dusty.";

        try {
            await member.timeout(60 * 60 * 1000, reason); // 1 hour timeout
            logAction('MUTE', member.user.tag, reason);
            message.channel.send(`${member.user.username} has been put in the corner for an hour. Silence is golden. 🤫`);
        } catch (e) {
            message.reply("I couldn't mute them. Maybe they have more aura than I thought. 🙄");
        }
    }

    // .kick @user
    if (message.content.startsWith('.kick')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return message.reply("Nice try, but you're not an admin. 💅");
        const memberToKick = message.mentions.members.first();
        if (!memberToKick) return message.reply("Who are we kicking? Tag them.");
        if (!memberToKick.kickable) return message.reply("I can't kick them. They might be too powerful (or invited by me).");

        await memberToKick.kick("Kicked by Mepa command");
        logAction('KICK', memberToKick.user.tag, `Kicked by ${message.author.tag}`);
        message.channel.send(`${memberToKick.user.username} has been removed. The vibe has improved immediately. ✨`);
    }

    // .ban @user
    if (message.content.startsWith('.ban')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply("You can't ban people. That's *my* job (and admins).");
        const memberToBan = message.mentions.members.first();
        if (!memberToBan) return message.reply("Tag the dusty you want to ban.");

        await memberToBan.ban({ reason: "Banned by Mepa" });
        logAction('BAN', memberToBan.user.tag, `Banned by ${message.author.tag}`);
        message.channel.send(`${memberToBan.user.username} is gone forever. Good riddance. 🔨`);
    }

    // .softban @user
    if (message.content.startsWith('.softban')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply("Softbanning is reserved for those with authority. 💅");
        const member = message.mentions.members.first();
        if (!member) return message.reply("Tag the person you want to softban.");

        await member.ban({ deleteMessageSeconds: 604800, reason: "Softban by Mepa" });
        await message.guild.members.unban(member.id, "Softban clean up");
        logAction('SOFTBAN', member.user.tag, "Messages cleared via softban.");
        message.channel.send(`${member.user.username} has been softbanned. Their mess is gone, and they're technically allowed back. For now. 🧹`);
    }

    // .warn @user [reason]
    if (message.content.startsWith('.warn')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return message.reply("You can't issue warnings. 💅");
        const member = message.mentions.members.first();
        if (!member) return message.reply("Who are we warning?");
        const reason = message.content.split(' ').slice(2).join(' ') || "Unspecified dusty behavior.";

        logAction('WARN', member.user.tag, reason);
        message.channel.send(`${member.user.username}, consider this your only warning. Don't vibrate low in my presence. 🥀`);
    }

    // .role @role :emoji: (Setup Reaction Role)
    if (message.content.startsWith('.role')) {
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
    }

    // .roles (List active roles)
    if (message.content.startsWith('.roles')) {
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

        message.channel.send({ embeds: [embed] });
    }

    // .delrole <messageId>
    if (message.content.startsWith('.delrole')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply("You don't have the clearance. 💅");
        const msgId = message.content.split(' ')[1];
        if (!msgId) return message.reply("Which setup are we removing? Give me the Message ID.");

        const { error } = await supabase.from('reaction_roles').delete().eq('message_id', msgId);
        if (error) return message.reply("Failed to remove it. It's likely stuck. 🙄");

        message.reply(`Reaction role setup for \`${msgId}\` has been removed from the records. ✨`);
    }

    // --- MUSIC COMMANDS ---

    // .play <query>
    if (message.content.startsWith('.play')) {
        const query = message.content.replace('.play', '').trim();
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) return message.reply("Join a voice channel first. I don't sing to empty rooms. 💅");
        if (!query) return message.reply("What am I playing? Silence? Give me a song.");

        try {
            console.log(`[MUSIC] Attempting to play: ${query} for ${message.author.username}`);
            await distube.play(voiceChannel, query, {
                message,
                textChannel: message.channel,
                member: message.member,
            });
            console.log(`[MUSIC] Search/play triggered successfully.`);
        } catch (e) {
            console.error("[MUSIC ERROR]", e);
            message.reply(`The speakers are bleeding: ${e.message.slice(0, 100)}. Probably your low-quality taste. 🙄`);
        }
    }

    // .stop
    if (message.content.startsWith('.stop')) {
        distube.stop(message);
        message.channel.send("Music stopped. Finally, some peace. 🕯️");
    }

    // .skip
    if (message.content.startsWith('.skip')) {
        try {
            await distube.skip(message);
            message.channel.send("Next. That one was getting boring anyway. ⛓️");
        } catch (e) {
            message.reply("There's nothing else in the queue. You're alone with your thoughts now. 🥀");
        }
    }

    // .volume <1-100>
    if (message.content.startsWith('.volume')) {
        const volume = parseInt(message.content.split(' ')[1]);
        if (isNaN(volume) || volume < 1 || volume > 100) return message.reply("Volume must be 1-100. Don't be difficult.");
        distube.setVolume(message, volume);
        message.channel.send(`Volume adjusted to ${volume}%. 🔊`);
    }

    // .shuffle
    if (message.content.startsWith('.shuffle')) {
        try {
            await distube.shuffle(message);
            message.channel.send("Queue shuffled. Let's see what the universe has planned. 🔮");
        } catch (e) {
            message.reply("I can't shuffle that. Maybe you should add more than one song first. 🙄");
        }
    }

    // .recommend <mood/genre> (Music)
    if (message.content.startsWith('.recommend')) {
        const query = message.content.replace('.recommend', '').trim();
        if (!query) return message.reply("Tell me the vibe. e.g., `.recommend dark feminine rap`");

        try {
            message.channel.sendTyping();
            const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const response = await model.generateContent(`Generate a JSON list of 3 songs matching vibe "${query}". Format: [{"title": "Song", "artist": "Artist", "reason": "Why Mepa likes it"}]. Return ONLY JSON.`);
            const text = response.response.text().replace(/```json|```/g, '').trim();
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

    // .help
    if (message.content.startsWith('.help')) {
        const embed = new EmbedBuilder()
            .setColor('#D4AF37')
            .setTitle('🔮 Mepa\'s Grimoire: Commands & Secrets')
            .setDescription('I only respond to those with high standards. Use these wisely.')
            .addFields(
                { name: '🎵 Music', value: '`.play <song>`, `.stop`, `.skip`, `.volume <1-100>`, `.shuffle`, `.recommend <vibe>`', inline: false },
                { name: '💅 Personality', value: 'Mention `mepa` or keywords (`money`, `fashion`, `love`). Ask for a roast: `roast my pfp`.', inline: false },
                { name: '🛡️ Moderation', value: '`.clear <amt>`, `.mute @user`, `.warn @user`, `.kick @user`, `.ban @user`', inline: false },
                { name: '🎭 Roles', value: '`.role @Role :emoji:`, `.roles`, `.delrole <msgId>`', inline: true },
                { name: '⚙️ System', value: '`.help`, `.testwelcome`', inline: true }
            )
            .setFooter({ text: 'Mepa | High Standards Only', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }

    // .vibecheck @user
    if (message.content.startsWith('.vibecheck')) {
        const target = message.mentions.members.first() || message.member;
        const verdicts = [
            "Your aura is giving 'clearance rack'. Mid at best. 💅",
            "High frequency detected. You might actually be worth my time. ✨",
            "Extremely low vibrations. I'm sensing a dusty energy. 🥀",
            "Divine Feminine energy is strong here. A queen. 👑",
            "The basicness is off the charts. Sit down. 🙄",
            "Siren vibes. You have the power, don't waste it on scrotes. 🐍",
            "Your energy is vibrating at a 'low value' frequency. Crystal cleanse required. 🔮",
            "Unbothered and high-value. We love to see it. 🥂"
        ];
        const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];

        const embed = new EmbedBuilder()
            .setColor('#D4AF37')
            .setTitle(`🔮 Vibe Check: ${target.user.username}`)
            .setDescription(randomVerdict)
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }

    // Test Welcome Command
    if (message.content.startsWith('.testwelcome')) {
        client.emit('guildMemberAdd', message.member);
        message.reply("Simulating welcome event... check the welcome channel. 🎀");
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
