import {Args, PieceContext} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';

const {Command} = require('@sapphire/framework');

module.exports = class SayCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'say',
      description: 'Sends a message from the bot',
      preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
      detailedDescription: 'say <title> <body> <#channel:optional>`',
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;
    const settingsData = await getSettings(guildId as string);

    // Pick the title and content from args, return error if invalid
    const sayTitle = await args.pickResult('string');
    const sayContent = await args.pickResult('string');
    if (!sayTitle.success || !sayContent.success) {
      const embed = new BediEmbed()
			.setColor(colors.ERROR)
			.setTitle('Say Reply')
			.setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${
			    Formatters.inlineCode(settingsData.prefix + 'say <title> <body> <#channel:optional>')}`);
      return message.reply({embeds: [embed]});
    }

    // Parse channel args
    let channel = message.channel;
    if (!args.finished) {
      const channelArg = await args.pickResult('guildTextChannel');

      if (!channelArg.success) {
	const embed = new BediEmbed()
			  .setColor(colors.ERROR)
			  .setTitle('Say Reply')
			  .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${
			      Formatters.inlineCode(settingsData.prefix + 'say <title> <body> <#channel:optional>')}`);
	return message.reply({embeds: [embed]});
      }
      channel = channelArg.value;
    }

    let descriptionToSend = sayContent.value;
    const BOT_OWNERS = process.env.BOT_OWNERS!.split(',');
    if (!BOT_OWNERS.includes(message.author.id)) {
      // Append the user's @ to the message so that $say messages aren't mistaken for actual bot messages
      descriptionToSend = descriptionToSend.concat('\n\nMessage created by ' + message.author);
    }

    // Delete the original message
    await message.delete();

    // Send the say command
    const embed = new BediEmbed().setTitle(sayTitle.value).setDescription(descriptionToSend);
    return channel.send({embeds: [embed]});
  }
};