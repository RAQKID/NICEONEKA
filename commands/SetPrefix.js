const { embedbuilder } = require('discord.js');
const db = require('../db'); // make sure db.js exists in your root folder

module.exports = {
  name: 'setprefix',
  description: 'change the bot\'s prefix for this server',
  usage: '<new prefix>',
  permissions: ['administrator'],
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('this command can only be used in a server!');
    }

    if (!args.length) {
      return message.reply('please provide a new prefix!');
    }
    
    const newprefix = args[0];
    
    if (newprefix.length > 3) {
      return message.reply('prefix must be 3 characters or less!');
    }
    
    // save the prefix to the database
    const success = db.setprefix(message.guild.id, newprefix);
    
    if (!success) {
      return message.reply('there was an error saving the new prefix!');
    }

    // update the client's prefix cache
    if (!client.prefixes) {
      client.prefixes = {};
    }
    client.prefixes[message.guild.id] = newprefix;
    
    const successembed = new embedbuilder()
      .setcolor('#00ff00')
      .settitle('prefix updated successfully')
      .setdescription(`the server prefix has been changed to: \`${newprefix}\``)
      .addfields(
        { name: 'example', value: `now try: \`${newprefix}help\`` }
      )
      .settimestamp()
      .setfooter({ 
        text: `changed by ${message.author.username}`, 
        iconurl: message.author.displayavatarurl() 
      });
    
    await message.channel.send({ embeds: [successembed] });
  }
};