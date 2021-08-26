import {Args, PieceContext} from '@sapphire/framework';
import {Formatters, Message, MessageActionRow, MessageButton} from 'discord.js';
import moment from 'moment-timezone/moment-timezone-utils';

import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {agenda, isValidTime, MORN_ANNOUNCE_JOB_NAME} from '../../utils/schedulerUtil';

const {Command} = require('@sapphire/framework');

module.exports = class MorningAnnouncementCommand extends Command {
        constructor(context: PieceContext) {
                super(context, {
                        name: 'morningAnnouncement',
                        aliases: ['ma'],
                        description: 'Schedules Morning Announcements in the Current Channel',
                        preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
                        detailedDescription: 'morningAnnouncement <time>`' +
                            '\nYou can specify the announcement time in most common time formats.' +
                            '\nIf you make a mistake, simply run the command again, only one morning announcement can be scheduled per day.',
                });
        }

        async run(message: Message, args: Args) {
                const {guildId, channelId} = message;
                const settingsData = await getSettings(guildId as string);

                const announcementTime = await args.restResult('string');

                if (!announcementTime.success) {
                        const embed = new BediEmbed()
                                          .setColor(colors.ERROR)
                                          .setTitle('Morning Announcement Reply')
                                          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${
                                              Formatters.inlineCode(settingsData.prefix + 'morningAnnouncement <time>')}`);
                        return message.reply({embeds: [embed]});
                }

                if (!isValidTime(announcementTime.value)) {
                        const embed = new BediEmbed()
                                          .setColor(colors.ERROR)
                                          .setTitle('Morning Announcement Reply')
                                          .setDescription('That is not a valid time.');
                        return message.reply({embeds: [embed]});
                }

                await agenda.cancel({
                        'name': MORN_ANNOUNCE_JOB_NAME,
                        'data.guildId': guildId,
                });

                const job = await agenda.create(MORN_ANNOUNCE_JOB_NAME, {
                        guildId: guildId,
                        channelId: channelId,
                        autoDelete: false,
                });

                await job.repeatEvery('one day', {skipImmediate: true}).schedule(announcementTime.value);

                const localRunTime = job.attrs.nextRunAt;

                const nextRun = moment.tz(moment().format('YYYY-MM-DD'), settingsData.timezone);
                nextRun.set({h: localRunTime?.getHours(), m: localRunTime?.getMinutes()});
                if (nextRun < moment()) nextRun.add(1, 'd');

                const buttonRow = new MessageActionRow().addComponents([
                        new MessageButton().setCustomId('mornDeleteYes').setLabel('Yes').setStyle('SUCCESS'),
                        new MessageButton().setCustomId('mornDeleteNo').setLabel('No').setStyle('DANGER'),
                ]);

                const embed =
                    new BediEmbed()
                        .setTitle('Morning Announcement Reply')
                        .setColor(colors.ACTION)
                        .setDescription(`Morning Announcements will be scheduled for <t:${
                            Math.round(
                                nextRun.valueOf() / 1000)}:t>\n\nDo you want to auto delete each announcement after 24 hours?`);
                const reply = await message.reply({
                        embeds: [embed],
                        components: [buttonRow],
                });

                const buttonCollector = reply.createMessageComponentCollector({componentType: 'BUTTON', time: 15000});
                buttonCollector.on('collect', async interaction => {
                        if (!interaction.isButton()) return;

                        if (interaction.user.id != message.author.id) {
                                const embed = new BediEmbed()
                                                  .setTitle('Morning Announcement Reply')
                                                  .setColor(colors.ERROR)
                                                  .setDescription('You did not run this command');

                                return interaction.reply({
                                        ephemeral: true,
                                        embeds: [embed],
                                });
                        }

                        if (interaction.customId === 'mornDeleteYes') {
                                job.attrs.data!.autoDelete = true;
                        }

                        await job.schedule(nextRun.toDate()).save();

                        const embed = new BediEmbed()
                                          .setTitle('Morning Announcement Reply')
                                          .setColor(colors.SUCCESS)
                                          .setDescription(`Morning Announcements have been scheduled for <t:${
                                              Math.round(nextRun.valueOf() / 1000)}:t>`);

                        await reply.edit({
                                embeds: [embed],
                                components: [],
                        });
                });

                buttonCollector.on('end', async interaction => {
                        if (buttonCollector.total === 0) {
                                const embed =
                                    new BediEmbed()
                                        .setTitle('Morning Announcement Reply')
                                        .setColor(colors.ERROR)
                                        .setDescription('You took too long to choose. Announcements have not been scheduled.');
                                await reply.edit({
                                        embeds: [embed],
                                        components: [],
                                });
                        }
                });
        }
};
