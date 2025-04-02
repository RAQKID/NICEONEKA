const { EmbedBuilder } = require('discord.js');
const db = require('../db');
const proSlots = ['💎', '💰', '🪙', '🏆', '🎯', '🃏', '🔮', '🍀'];

module.exports = {
    name: 'proslots',
    description: 'VIP slots (Minimum: $10,000,000) - 2x always, 5x for 2 matches, 10x for 3 matches',
    usage: '<amount|all>',
    async execute(message, args, client) {
        // Strict validation
        if (!args[0]) {
            return message.reply('❌ Usage: `!proslots <amount|all>` (Minimum: $10,000,000)');
        }

        const minBet = 10000000;
        const balance = await db.getUserBalance(message.guild.id, message.author.id);
        let amount;

        try {
            // Handle 'all' bet
            if (args[0].toLowerCase() === 'all') {
                if (balance.wallet < minBet) {
                    return message.reply(`❌ You need at least $${minBet.toLocaleString()} to play!`);
                }
                amount = balance.wallet;
            } else {
                // Strict amount validation
                amount = Math.floor(Number(args[0].replace(/,/g, '')));
                
                if (isNaN(amount)) {
                    return message.reply('❌ Please enter a valid number!');
                }
                if (amount < minBet) {
                    return message.reply(`❌ Minimum bet is $${minBet.toLocaleString()}!`);
                }
                if (amount > balance.wallet) {
                    return message.reply(`❌ You only have $${balance.wallet.toLocaleString()}!`);
                }
            }

            // Generate slots
            const results = [
                proSlots[Math.floor(Math.random() * proSlots.length)],
                proSlots[Math.floor(Math.random() * proSlots.length)],
                proSlots[Math.floor(Math.random() * proSlots.length)]
            ];

            // Calculate winnings (2x minimum)
            let multiplier = 2;
            let winType = 'Consolation (2x)';
            
            if (results[0] === results[1] && results[1] === results[2]) {
                multiplier = 10;
                winType = 'JACKPOT (10x) 💎';
            } else if (results[0] === results[1] || results[1] === results[2]) {
                multiplier = 5;
                winType = 'WINNER (5x) 🔥';
            }

            // Update balance
            const winnings = amount * multiplier;
            balance.wallet = balance.wallet - amount + winnings;
            await db.setUserBalance(message.guild.id, message.author.id, balance);

            // Build embed
            const embed = new EmbedBuilder()
                .setColor(multiplier > 2 ? '#FFD700' : '#2b2d31')
                .setTitle('💎 PRO SLOTS')
                .setDescription(`**${results.join(' | ')}**`)
                .addFields(
                    { name: 'Bet', value: `$${amount.toLocaleString()}`, inline: true },
                    { name: 'Result', value: winType, inline: true },
                    { name: 'Multiplier', value: `${multiplier}x`, inline: true },
                    { name: 'Winnings', value: `$${winnings.toLocaleString()}`, inline: true },
                    { name: 'New Balance', value: `$${balance.wallet.toLocaleString()}`, inline: true }
                );

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('ProSlots Error:', error);
            message.reply('❌ Failed to process proslots. Please try again.');
        }
    }
};