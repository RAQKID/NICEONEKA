const { EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
    name: 'pay',
    description: 'Transfer money to another user in this server',
    usage: '<@user> <amount|all>',
    async execute(message, args, client) {
        // Basic validation
        if (args.length < 2) {
            return message.reply('❌ Usage: `!pay @user <amount|all>`');
        }

        const recipient = message.mentions.users.first();
        if (!recipient) {
            return message.reply('❌ You must mention a valid user!');
        }

        // Prevent invalid transfers
        if (recipient.bot) {
            return message.reply('❌ Cannot pay bots!');
        }
        if (recipient.id === message.author.id) {
            return message.reply('❌ Cannot pay yourself!');
        }

        const amountInput = args[1];
        const minTransfer = 1;
        const senderBalance = await db.getUserBalance(message.guild.id, message.author.id);
        let transferAmount;

        // Handle 'all' transfer
        if (amountInput.toLowerCase() === 'all') {
            if (senderBalance.wallet <= 0) {
                return message.reply('❌ Your wallet is empty!');
            }
            transferAmount = senderBalance.wallet;
        } else {
            // Validate numerical amount
            transferAmount = parseInt(amountInput.replace(/,/g, ''));
            if (isNaN(transferAmount)) {
                return message.reply('❌ Invalid amount!');
            }
            if (transferAmount < minTransfer) {
                return message.reply(`❌ Minimum transfer is $${minTransfer}!`);
            }
            if (transferAmount > senderBalance.wallet) {
                return message.reply(`❌ You only have $${senderBalance.wallet.toLocaleString()}!`);
            }
        }

        // Process transaction
        const recipientBalance = await db.getUserBalance(message.guild.id, recipient.id);
        
        senderBalance.wallet -= transferAmount;
        recipientBalance.wallet += transferAmount;

        await db.setUserBalance(message.guild.id, message.author.id, senderBalance);
        await db.setUserBalance(message.guild.id, recipient.id, recipientBalance);

        // Create transaction receipt
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('💸 Payment Successful')
            .setDescription(`You sent $${transferAmount.toLocaleString()} to ${recipient.username}`)
            .addFields(
                { name: 'Your New Balance', value: `$${senderBalance.wallet.toLocaleString()}`, inline: true },
                { name: `${recipient.username}'s Balance`, value: `$${recipientBalance.wallet.toLocaleString()}`, inline: true }
            )
            .setFooter({ text: `Transaction completed in ${message.guild.name}` })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};