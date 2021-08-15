import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {purge_messages} from '../../utils/discordUtil';

const MAX_MSGS_THAT_CAN_BE_DELETED = 100;

const {Command} = require('@sapphire/framework');

module.exports = class PingCommand extends Command {
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
    if(!args.finished)
    {
        const arg_channel = await args.pickResult('channel');

        if (!arg_channel.success) {
            const embed = new BediEmbed()
                .setColor(colors.ERROR)
                .setTitle('Say Reply')
                .setDescription('Invalid Syntax!\n\nMake sure your command is in the format `' + settingsData.prefix + 'say <title> <body> (channel)`');
            return message.reply({embeds: [embed]});
          }
         
        //Assert that the channel type is only in guild_text
        if(arg_channel.value.type != "GUILD_TEXT")
        {
            const embed = new BediEmbed()
                .setColor(colors.ERROR)
                .setTitle('Say Reply')
                .setDescription('Please ensure that the channel is a guild text channel!');
            return message.reply({embeds: [embed]});
        }

        channel = arg_channel.value;
    }
    

    //Send the say command
    const embed = new BediEmbed()
        .setTitle(say_title.value)
        .setDescription(say_content.value);
    return channel.send({embeds: [embed]});
  }
};