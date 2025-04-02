const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Show all available commands',
    aliases: ['commands'],
    async execute(message, args, client) {
        const prefix = client.prefixes.get(message.guild.id) || '!';

        const commandCategories = [
            {
                name: '💰 ECONOMY',
                commands: [
                    { name: 'balance [@user]', description: 'Check balance (aliases: bal, money)' },
                    { name: 'work', description: 'Earn money (5min cooldown)' },
                    { name: 'daily', description: 'Claim $10,000 daily (alias: claim)' },
                    { name: 'deposit <amount|all>', description: 'Bank money (alias: dep)' },
                    { name: 'withdraw <amount|all>', description: 'Withdraw money (alias: with)' },
                    { name: 'pay @user <amount>', description: 'Transfer money' }
                ]
            },
            {
                name: '🎰 GAMBLING',
                commands: [
                    { name: 'slots <amount|all>', description: 'Classic slots (Min $100)' },
                    { name: 'proslots <amount|all>', description: 'VIP slots (Min $10K)' }
                ]
            },
            {
                name: '⚙️ ADMIN',
                commands: [
                    { name: 'setprefix <new>', description: 'Change bot prefix' }
                ]
            },
            {
                name: 'ℹ️ INFO',
                commands: [
                    { name: 'help', description: 'Show this menu' },
                    { name: 'ping', description: 'Check bot latency' }
                ]
            }
        ];

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('📚 Command Help')
            .setDescription(`**Prefix:** \`${prefix}\`\n**Usage:** \`${prefix}command [options]\``)
            .setFooter({ text: '<> = required | [] = optional' });

        commandCategories.forEach(category => {
            embed.addFields({
                name: `\n${category.name}`,
                value: category.commands.map(cmd => 
                    `• \`${cmd.name}\` - ${cmd.description}`
                ).join('\n')
            });
        });

        await message.reply({ embeds: [embed] });
    }
};