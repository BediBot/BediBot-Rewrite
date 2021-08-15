import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';

const MAX_MSGS_THAT_CAN_BE_DELETED = 100;

const {Command} = require('@sapphire/framework');

module.exports = class SayCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'say',
      description: 'Sends a message from the bot',
      preconditions: [['AdminOnly', 'BotOwnerOnly'], 'GuildOnly'],
    });
  }

  async run(message: Message, args: Args) {
    const {guild, guildId, author} = message;
    const settingsData = await getSettings(guildId as string);

    //Pick the title and content from args, return error if invalid
    const say_title = await args.pickResult('string');
    const say_content = await args.pickResult('string');
    if (!say_title.success || !say_content.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Say Reply')
          .setDescription('Invalid Syntax!\n\nMake sure your command is in the format `' + settingsData.prefix + 'say <title> <body> (channel)`');
      return message.reply({embeds: [embed]});
    }

    //Parse channel args
    let channel = message.channel;
    if (!args.finished) {
      const arg_channel = await args.pickResult('guildTextChannel');

      if (!arg_channel.success) {
        const embed = new BediEmbed()
            .setColor(colors.ERROR)
            .setTitle('Say Reply')
            .setDescription(
                'Invalid Syntax!\n\nMake sure your command is run in the format `' + settingsData.prefix + 'say <title> <body> (channel)`');
        return message.reply({embeds: [embed]});
      }

      channel = arg_channel.value;
    }

    let body_content_to_send = say_content.value;
    const BOT_OWNERS = process.env.BOT_OWNERS!.split(',');
    if (!BOT_OWNERS.includes(message.author.id)) {
      //Append the user's @ to the message so that $say messages aren't mistaken for actual bot messages
      body_content_to_send = body_content_to_send.concat('\n\nMessage created by ' + message.author);
    }

    //Delete the original message
    message.delete();

    //Send the say command
    const embed = new BediEmbed()
        .setTitle(say_title.value)
        .setDescription(body_content_to_send);
    return channel.send({embeds: [embed]});
  }
};