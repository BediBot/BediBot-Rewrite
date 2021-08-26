import {Args, PieceContext} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';

import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {agenda, MORN_ANNOUNCE_JOB_NAME} from '../../utils/schedulerUtil';

const {Command} = require('@sapphire/framework');

module.exports = class StopMorningAnnouncementCommand extends Command {
        constructor(context: PieceContext) {
                super(context, {
                        name: 'stopMorningAnnouncement',
                        aliases: ['stopma', 'sma'],
                        description: 'Stops any scheduled morning announcements in this server',
                        preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
                        detailedDescription: 'stopMorningAnnouncement`',
                });
        }

        async run(message: Message, args: Args) {
                const {guildId, guild} = message;

                await agenda.cancel({
                        'name': MORN_ANNOUNCE_JOB_NAME,
                        'data.guildId': guildId,
                });

                const embed =
                    new BediEmbed()
                        .setColor(colors.SUCCESS)
                        .setTitle('Stop Morning Announcement Reply')
                        .setDescription(
                            `Morning Announcements have been cancelled for ${Formatters.inlineCode(guild?.name as string)}`);
                return message.reply({embeds: [embed]});
        }
};
