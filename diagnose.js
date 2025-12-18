import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.DISCORD_TOKEN || 'MISSING';
console.log(`Token length: ${token.length}`);
console.log(`Token starts with: ${token.substring(0, 5)}...`);
console.log(`Token ends with: ...${token.substring(token.length - 5)}`);
console.log(`GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
console.log(`API_KEY present: ${!!process.env.API_KEY}`);
