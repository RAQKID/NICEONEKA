const { EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
    name: 'withdraw',
    aliases: ['with'],
    description: 'Withdraw money from bank',
    usage: '<amount|all>',
    async execute(message, args, client) {
        const amountInput = args[0];
        if (!amountInput) return message.reply('❌ Specify amount or `all`');

        const balance = await db.getUserBalance(message.guild.id, message.author.id);
        let withdrawAmount;

        if (amountInput.toLowerCase() === 'all') {
            if (balance.bank <= 0) return message.reply('❌ Your bank is empty!');
            withdrawAmount = balance.bank;
        } else {
            withdrawAmount = parseInt(amountInput.replace(/,/g, ''));
            if (isNaN(withdrawAmount) || withdrawAmount <= 0) return message.reply('❌ Invalid amount!');
            if (withdrawAmount > balance.bank) return message.reply('❌ Not enough money in bank!');
        }

        balance.bank -= withdrawAmount;
        balance.wallet += withdrawAmount;
        await db.setUserBalance(message.guild.id, message.author.id, balance);

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('💵 Withdrawal Successful')
            .addFields(
                { name: 'Amount Withdrawn', value: `$${withdrawAmount.toLocaleString()}` },
                { name: 'New Wallet', value: `$${balance.wallet.toLocaleString()}`, inline: true },
                { name: 'New Bank', value: `$${balance.bank.toLocaleString()}`, inline: true }
            );

        await message.reply({ embeds: [embed] });
    }
};