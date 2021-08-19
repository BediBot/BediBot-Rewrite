import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {agenda, isValidTime, MORN_ANNOUNCE_JOB_NAME} from '../../utils/schedulerUtil';

const {Command} = require('@sapphire/framework');

module.exports = class LockdownCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'morningAnnouncement',
      aliases: ['ma'],
      description: 'Schedules Morning Announcements in the Current Channel',
      preconditions: ['GuildOnly', ['AdminOnly', 'BotOwnerOnly']],
    });
  }

  async run(message: Message, args: Args) {
    const {guildId, channelId} = message;
    const settingsData = await getSettings(guildId as string);

    const announcementTime = await args.pickResult('string');

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
    });

    await job.repeatEvery('one day', {skipImmediate: true})
             .schedule(announcementTime.value)
             .save();

    // Response message with next run time
    const nextRun = job.attrs.nextRunAt;
    const embed = new BediEmbed()
        .setTitle('Morning Announcement Reply')
        .setDescription(`Morning Announcements have been scheduled for ${surroundStringWithBackTick(`${nextRun?.toLocaleTimeString()}`)}`);
    return message.reply({embeds: [embed]});
  }
};

