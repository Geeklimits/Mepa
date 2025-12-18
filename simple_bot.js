import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("Token length:", process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.length : "undefined");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`Successfully logged in as ${client.user.tag}`);
    process.exit(0);
});

client.on('error', (err) => {
    console.error("Client error:", err);
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("Login failed:", err);
    process.exit(1);
});
