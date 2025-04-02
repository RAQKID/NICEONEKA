const { EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
    name: 'deposit',
    aliases: ['dep'],
    description: 'Deposit money to bank',
    usage: '<amount|all>',
    async execute(message, args, client) {
        const amountInput = args[0];
        if (!amountInput) return message.reply('❌ Specify amount or `all`');

        const balance = await db.getUserBalance(message.guild.id, message.author.id);
        let depositAmount;

        if (amountInput.toLowerCase() === 'all') {
            if (balance.wallet <= 0) return message.reply('❌ Your wallet is empty!');
            depositAmount = balance.wallet;
        } else {
            depositAmount = parseInt(amountInput.replace(/,/g, ''));
            if (isNaN(depositAmount) || depositAmount <= 0) return message.reply('❌ Invalid amount!');
            if (depositAmount > balance.wallet) return message.reply('❌ Not enough money in wallet!');
        }

        balance.wallet -= depositAmount;
        balance.bank += depositAmount;
        await db.setUserBalance(message.guild.id, message.author.id, balance);

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🏦 Deposit Successful')
            .addFields(
                { name: 'Amount Deposited', value: `$${depositAmount.toLocaleString()}` },
                { name: 'New Wallet', value: `$${balance.wallet.toLocaleString()}`, inline: true },
                { name: 'New Bank', value: `$${balance.bank.toLocaleString()}`, inline: true }
            );

        await message.reply({ embeds: [embed] });
    }
};