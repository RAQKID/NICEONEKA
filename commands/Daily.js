const { EmbedBuilder } = require('discord.js');
const db = require('../db');
const cooldowns = new Map();

module.exports = {
    name: 'daily',
    description: 'Claim your daily $10,000 reward (24h cooldown)',
    aliases: ['claim'],
    async execute(message, args, client) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        const cooldownKey = `${guildId}-${userId}`;
        const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours in ms
        const rewardAmount = 10000;

        // Check cooldown
        if (cooldowns.has(cooldownKey)) {
            const remaining = cooldowns.get(cooldownKey) - Date.now();
            if (remaining > 0) {
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                return message.reply(`⏳ You can claim again in ${hours}h ${minutes}m!`);
            }
        }

        // Add to balance
        const balance = await db.getUserBalance(guildId, userId);
        balance.wallet += rewardAmount;
        await db.setUserBalance(guildId, userId, balance);

        // Set cooldown
        cooldowns.set(cooldownKey, Date.now() + cooldownTime);

        // Save cooldown to DB
        const dbCooldowns = db.getCooldowns() || {};
        dbCooldowns[cooldownKey] = Date.now() + cooldownTime;
        db.setCooldowns(dbCooldowns);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('💰 Daily Reward Claimed!')
            .setDescription(`You received $${rewardAmount.toLocaleString()}`)
            .addFields(
                { name: 'New Balance', value: `$${balance.wallet.toLocaleString()}` },
                { name: 'Next Claim', value: '<t:' + Math.floor((Date.now() + cooldownTime)/1000) + ':R>' }
            )
            .setThumbnail(client.user.displayAvatarURL()) // Using bot's avatar
            .setFooter({ text: 'Come back tomorrow for more!' });

        await message.reply({ embeds: [embed] });
    }
};