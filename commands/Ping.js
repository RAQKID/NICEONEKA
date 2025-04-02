const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Check bot and API latency',
  aliases: ['latency'],
  async execute(message, args, client) {
    try {
      const startTime = Date.now();
      const sent = await message.reply({ content: '🏓 Measuring ping...', fetchReply: true });
      
      const botLatency = sent.createdTimestamp - message.createdTimestamp;
      const apiLatency = client.ws ? Math.round(client.ws.ping) : 'N/A';

      const pingEmbed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('🏓 Pong!')
        .addFields(
          { name: 'Bot Latency', value: `\`${botLatency}ms\``, inline: true },
          { name: 'API Latency', value: `\`${apiLatency}ms\``, inline: true }
        )
        .setFooter({ 
          text: `Requested by ${message.author.username}`, 
          iconURL: message.author.displayAvatarURL() 
        });

      await sent.edit({ 
        content: '', 
        embeds: [pingEmbed] 
      });
    } catch (error) {
      console.error('Ping Command Error:', error);
      await message.reply('❌ Failed to measure ping. Please try again.');
    }
  }
};