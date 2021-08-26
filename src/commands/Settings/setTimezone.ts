import {Args, PieceContext} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';
import momentTZ from 'moment-timezone';

import settingsModel, {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';

const {Command} = require('@sapphire/framework');

module.exports = class SetTimezoneCommand extends Command {
        constructor(context: PieceContext) {
                super(context, {
                        name: 'setTimezone',
                        aliases: ['settz'],
                        description: 'Changes the timezone for BediBot',
                        preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
                        detailedDescription: 'setTimezone <newTimezone>`' +
                            '\nThe <newTimezone> must be the [TZ Database Name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) of the timezone.',
                });
        }

        async run(message: Message, args: Args) {
                const {guildId} = message;
                const settingsData = await getSettings(guildId as string);

                // Check if they even inputted a string
                const newValue = await args.peekResult('string');
                if (!newValue.success) {
                        const embed = new BediEmbed()
                                          .setColor(colors.ERROR)
                                          .setTitle('Set Timezone Reply')
                                          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${
                                              Formatters.inlineCode(settingsData.prefix + 'setTimezone <newTimezone>')}`);
                        return message.reply({embeds: [embed]});
                }

                if (!momentTZ.tz.names().includes(newValue.value)) {
                        const embed =
                            new BediEmbed()
                                .setColor(colors.ERROR)
                                .setTitle('Set Timezone Reply')
                                .setDescription(
                                    `${Formatters.inlineCode(newValue.value)} is not a valid timezone.` +
                                    `\n\nThe input must be the [TZ Database Name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) on the timezone.`);
                        return message.reply({embeds: [embed]});
                }

                await settingsModel.updateOne({_id: guildId as string}, {timezone: newValue.value});

                const embed = new BediEmbed()
                                  .setTitle('Set Timezone Reply')
                                  .setColor(colors.SUCCESS)
                                  .setDescription(`The timezone has been updated to ${Formatters.inlineCode(newValue.value)}`);
                return message.reply({embeds: [embed]});
        };
};