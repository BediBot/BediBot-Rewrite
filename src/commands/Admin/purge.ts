import {Args, PieceContext} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {purgeMessages} from '../../utils/discordUtil';

const BULK_DELETE_MAX = 100;

const {Command} = require('@sapphire/framework');

module.exports = class PurgeCommand extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'purge',
            description: 'Purges a specific number of messages in the channel the command was executed in',
            preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly'], 'AdminPerms'],
            detailedDescription: 'purge <integer>`' +
                `\nThe number represents the number of messages to purge. Maximum: ${
                                     Formatters.inlineCode(BULK_DELETE_MAX.toString())}`,
        });
    }

    async run(message: Message, args: Args) {
        const {guildId} = message;
        const settingsData = await getSettings(guildId as string);
        // Check if args length is valid, and then read the number
        const numMessagesToDelete = await args.pickResult('integer');
        if (!numMessagesToDelete.success) {
            const embed = new BediEmbed()
                              .setColor(colors.ERROR)
                              .setTitle('Purge Reply')
                              .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${
                                  Formatters.inlineCode(settingsData.prefix + 'purge <integer>')}`);
            return message.reply({embeds: [embed]});
        }

        // Check if the number is within the bounds expected
        if (!(numMessagesToDelete.value > 0 && numMessagesToDelete.value <= BULK_DELETE_MAX)) {
            const embed = new BediEmbed()
                              .setColor(colors.ERROR)
                              .setTitle('Purge Reply')
                              .setDescription('Ensure that the number of messages is less than or equal to ' + BULK_DELETE_MAX);
            return message.reply({embeds: [embed]});
        }

        const loading_embed = new BediEmbed()
                                  .setTitle('Purge Reply')
                                  .setColor(colors.ACTION)
                                  .setDescription('Purging messages in progress... please wait');

        const loading_message = await message.reply({embeds: [loading_embed]});

        /* //Commented out code to support purging messages from a specific user, rationale is because the current
        interface is unintutive if(!args.finished)
        {
            const user = await args.pickResult('user');
            if (!user.success) {
            const embed = new BediEmbed()
                .setColor(colors.ERROR)
                .setTitle('Purge Reply')
                .setDescription('Invalid Syntax!\n\nMake sure your command is in the format `' + settingsData.prefix +
        'purge <number>
        <@User>`'); return message.channel.send({ embeds: [embed],
            });
            }

            const number_of_msgs_deleted = await purge_messages_from_specific_user(message,
        number_of_msgs_to_delete.value, user.value.id); if(number_of_msgs_deleted == 0)
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
                    .setDescription('Successfully purged `' + number_of_msgs_deleted + "` messages from `" +
        user.value.tag +"` in
        `"
        + message.guild?.name + "`")

                return message.author.send({
                    embeds: [embed]
                });
            }
        }
        else
        {
        */
        // Perform the deletion
        const numMessagesDeleted = await purgeMessages(message, numMessagesToDelete.value);

        // Cleanup messages that don't need to be there anymore
        await message.delete();
        await loading_message.delete();

        if (numMessagesDeleted === false) {
            const embed = new BediEmbed()
                              .setColor(colors.ERROR)
                              .setTitle('Purge Reply')
                              .setDescription('Fatal error, please contact a BediBot Dev');
            return message.channel.send({embeds: [embed]});
        } else if (numMessagesDeleted === 0) {
            const embed =
                new BediEmbed()
                    .setColor(colors.ERROR)
                    .setTitle('Purge Reply')
                    .setDescription(
                        'No messages found - note that pinned messages or messages older than 14 days cannot be purged');
            return message.channel.send({embeds: [embed]});
        }

        // Reply
        const embed =
            new BediEmbed()
                .setTitle('Purge Reply')
                .setColor(colors.SUCCESS)
                .setDescription(`Successfully purged ${Formatters.inlineCode(numMessagesDeleted.toString())} messages in ${
                    message.channel.toString()} from ${Formatters.inlineCode(message.guild?.name!)}`);
        return message.author.send({embeds: [embed]});
        //}
    }
};