require('dotenv').config();
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Initialize Discord Client with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Load config
const config = require('./config.json');

// Command Handling
client.commands = new Collection();
client.prefixes = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.name, command);
}

// Ready Event
client.once('ready', () => {
    console.log(`✅ ${client.user.tag} ready in ${client.guilds.cache.size} servers`);
    client.user.setActivity(`${config.defaultPrefix}help`, { type: 'WATCHING' });
});

// Message Handler
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    try {
        const prefix = client.prefixes.get(message.guild.id) || config.defaultPrefix;
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) ||
            Array.from(client.commands.values()).find(cmd => 
                cmd.aliases && cmd.aliases.includes(commandName)
            );

        if (!command) return;

        await command.execute(message, args, client);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error:`, error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Error')
            .setDescription('An error occurred while processing this command')
            .addFields(
                { name: 'Error', value: error.message.substring(0, 1000) }
            );
        
        await message.reply({ embeds: [errorEmbed] }).catch(console.error);
    }
});

// Keep-alive server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'online',
        bot: client.user?.tag || 'Starting...',
        servers: client.guilds?.cache.size || 0
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Keep-alive server running on port ${PORT}`);
});

// Error Handling
process.on('unhandledRejection', error => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
});

// Login
client.login(process.env.DISCORD_BOT_TOKEN)
    .catch(error => {
        console.error('Login Failed:', error);
        process.exit(1);
    });