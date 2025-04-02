const { EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
    name: 'balance',
    aliases: ['bal', 'money'],
    description: 'Check server-specific balance',
    async execute(message, args, client) {
        const targetUser = message.mentions.users.first() || message.author;
        const balance = db.getUserBalance(message.guild.id, targetUser.id);

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle(`${targetUser.username}'s Balance in ${message.guild.name}`)
            .addFields(
                { name: '💵 Wallet', value: `$${balance.wallet.toLocaleString()}`, inline: true },
                { name: '🏦 Bank', value: `$${balance.bank.toLocaleString()}`, inline: true },
                { name: '💰 Total', value: `$${(balance.wallet + balance.bank).toLocaleString()}` }
            );

        await message.reply({ embeds: [embed] });
    }
}
