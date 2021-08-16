import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {purge_messages, surroundStringWithBackTick} from '../../utils/discordUtil';

const MAX_MSGS_THAT_CAN_BE_DELETED = 100;

const {Command} = require('@sapphire/framework');

module.exports = class PingCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'purge',
      description: 'Purges a specific number of messages',
      preconditions: [['AdminOnly', 'BotOwnerOnly'], 'GuildOnly', 'AdminPerms'],
    });
  }

  async run(message: Message, args: Args) {
    const {guild, guildId, author} = message;
    const settingsData = await getSettings(guildId as string);
    //Check if args length is valid, and then read the number
    const numMessagesToDelete = await args.pickResult('integer');
    if (!numMessagesToDelete.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Purge Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${surroundStringWithBackTick(
              settingsData.prefix + 'purge <number> <author:optional>')}`);
      return message.reply({embeds: [embed]});
    }

    //Check if the number is within the bounds expected
    if (!(numMessagesToDelete.value > 0 && numMessagesToDelete.value <= MAX_MSGS_THAT_CAN_BE_DELETED)) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Purge Reply')
          .setDescription('Ensure that the number of messages is less than or equal to ' + MAX_MSGS_THAT_CAN_BE_DELETED);
      return message.reply({embeds: [embed]});
    }

    /* //Commented out code to support purging messages from a specific user, rationale is because the current interface is unintutive
    if(!args.finished)
    {
        const user = await args.pickResult('user');
        if (!user.success) {
        const embed = new BediEmbed()
            .setColor(colors.ERROR)
            .setTitle('Purge Reply')
            .setDescription('Invalid Syntax!\n\nMake sure your command is in the format `' + settingsData.prefix + 'purge <number> <@User>`');
        return message.channel.send({
            embeds: [embed],
        });
        }

        const number_of_msgs_deleted = await purge_messages_from_specific_user(message, number_of_msgs_to_delete.value, user.value.id);
        if(number_of_msgs_deleted == 0)
        {
            const embed = new BediEmbed()
                .setColor(colors.ERROR)
                .setTitle('Purge Reply')
                .setDescription('No Messages found from `' + user.value + "`");
            return message.channel.send({
            embeds: [embed],
            });
        }
        else
        {
                //Reply
                const embed = new BediEmbed()
                .setTitle('Purge Reply')
                .setDescription('Successfully purged `' + number_of_msgs_deleted + "` messages from `" + user.value.tag +"` in `" + message.guild?.name + "`")

            return message.author.send({
                embeds: [embed]
            });
        }
    }
    else
    {
    */
    //Perform the deletion
    const successful = await purge_messages(message, numMessagesToDelete.value + 1); //Delete purge command as well

    if (!successful) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Purge Reply')
          .setDescription('Fatal error, please contact a Bedibot Dev');
      return message.channel.send({embeds: [embed]});
    }

    //Reply
    const embed = new BediEmbed()
        .setTitle('Purge Reply')
        .setDescription('Successfully purged `' + numMessagesToDelete.value + '` messages from `' + message.guild?.name + '`');
    return message.author.send({embeds: [embed]});
    //}
  }
};