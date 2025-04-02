const { EmbedBuilder } = require('discord.js');
const db = require('../db');
const cooldowns = new Map();

module.exports = {
    name: 'work',
    description: 'Earn server-specific money (5min cooldown)',
    async execute(message, args, client) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        const cooldownKey = `${guildId}-${userId}`;

        // Cooldown check (5 minutes)
        if (cooldowns.has(cooldownKey) && Date.now() - cooldowns.get(cooldownKey) < 300000) {
            const remaining = Math.ceil((300000 - (Date.now() - cooldowns.get(cooldownKey))) / 60000);
            return message.reply(`⏳ You can work again in ${remaining} minute(s)!`);
        }

        // Update balance
        const balance = db.getUserBalance(guildId, userId);
        const earnings = Math.floor(Math.random() * 401) + 100;
        balance.wallet += earnings;
        db.setUserBalance(guildId, userId, balance);

        // Set cooldown
        cooldowns.set(cooldownKey, Date.now());

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('💼 Work Completed')
            .setDescription(`You earned **$${earnings.toLocaleString()}** in ${message.guild.name}!`)
            .addFields(
                { name: 'New Wallet Balance', value: `$${balance.wallet.toLocaleString()}` },
                { name: 'Server', value: message.guild.name }
            );

        await message.reply({ embeds: [embed] });
    }
};