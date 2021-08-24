import {Args, PieceContext} from '@sapphire/framework';
import {Message, MessageActionRow, MessageButton} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {agenda, isValidTime, MORN_ANNOUNCE_JOB_NAME} from '../../utils/schedulerUtil';
import moment from 'moment-timezone/moment-timezone-utils';

const {Command} = require('@sapphire/framework');

module.exports = class MorningAnnouncementCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'morningAnnouncement',
      aliases: ['ma'],
      description: 'Schedules Morning Announcements in the Current Channel',
      preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
      detailedDescription: `${'morningAnnouncement <time>`'}
You can specify the announcement time in most common time formats.
If you make a mistake, simply run the command again, only one morning announcement can be scheduled per day.`,
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
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format 
          ${surroundStringWithBackTick(settingsData.prefix + 'morningAnnouncement <time>')}`);
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

    await job.repeatEvery('one day', {skipImmediate: true})
             .schedule(announcementTime.value);

    const localRunTime = job.attrs.nextRunAt;

    const nextRun = moment.tz(moment().format('YYYY-MM-DD'), settingsData.timezone);
    nextRun.set({h: localRunTime?.getHours(), m: localRunTime?.getMinutes()});
    if (nextRun < moment()) nextRun.add(1, 'd');

    const buttonRow = new MessageActionRow()
        .addComponents([
          new MessageButton()
              .setCustomId('mornDeleteYes')
              .setLabel('Yes')
              .setStyle('SUCCESS'),
          new MessageButton()
              .setCustomId('mornDeleteNo')
              .setLabel('No')
              .setStyle('DANGER'),
        ]);

    const embed = new BediEmbed()
        .setTitle('Morning Announcement Reply')
        .setDescription(`Morning Announcements will be scheduled for ${surroundStringWithBackTick(
            `${nextRun.toDate().toLocaleTimeString('en-US', {timeZone: settingsData.timezone})}`)}
            
            Do you want to auto delete each announcement after 24 hours?`);
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
          .setDescription(`Morning Announcements have been scheduled for ${surroundStringWithBackTick(
              `${nextRun.toDate().toLocaleTimeString('en-US', {timeZone: settingsData.timezone})}`)}`);

      await reply.edit({
        embeds: [embed],
        components: [],
      });
    });

    buttonCollector.on('end', async interaction => {
      if (buttonCollector.total === 0) {
        const embed = new BediEmbed()
            .setTitle('Morning Announcement Reply')
            .setDescription(`You took too long to choose. Announcements have not been scheduled.`);

        await reply.edit({
          embeds: [embed],
          components: [],
        });
      }
    });
  }
};

