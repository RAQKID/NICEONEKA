const { EmbedBuilder } = require('discord.js');
const db = require('../db');
const slots = ['🍎', '🍊', '🍇', '🍒', '🍋', '🍉', '7️⃣', '💰'];

module.exports = {
    name: 'slots',
    description: 'Play slots (Minimum: $100) - 2x for 2 matches, 3x for 3 matches',
    usage: '<amount|all>',
    async execute(message, args, client) {
        // Strict validation
        if (!args[0]) {
            return message.reply('❌ Usage: `!slots <amount|all>` (Minimum: $100)');
        }

        const minBet = 100;
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
                slots[Math.floor(Math.random() * slots.length)],
                slots[Math.floor(Math.random() * slots.length)],
                slots[Math.floor(Math.random() * slots.length)]
            ];

            // Calculate winnings
            let multiplier = 0;
            if (results[0] === results[1] && results[1] === results[2]) {
                multiplier = 3;
            } else if (results[0] === results[1] || results[1] === results[2]) {
                multiplier = 2;
            }

            // Update balance
            const winnings = amount * multiplier;
            balance.wallet = balance.wallet - amount + winnings;
            await db.setUserBalance(message.guild.id, message.author.id, balance);

            // Build embed
            const embed = new EmbedBuilder()
                .setColor(multiplier > 0 ? '#00FF00' : '#FF0000')
                .setTitle('🎰 Slot Machine')
                .setDescription(`**${results.join(' | ')}**`)
                .addFields(
                    { name: 'Bet', value: `$${amount.toLocaleString()}`, inline: true },
                    { name: 'Multiplier', value: `${multiplier}x`, inline: true },
                    { name: 'Winnings', value: `$${winnings.toLocaleString()}`, inline: true },
                    { name: 'New Balance', value: `$${balance.wallet.toLocaleString()}`, inline: true }
                );

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Slots Error:', error);
            message.reply('❌ Failed to process slots. Please try again.');
        }
    }
};