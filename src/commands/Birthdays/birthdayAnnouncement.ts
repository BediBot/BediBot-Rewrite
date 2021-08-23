import {Args, PieceContext} from '@sapphire/framework';
import {Message, MessageActionRow, MessageButton} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {agenda, BIRTH_ANNOUNCE_JOB_NAME, isValidTime} from '../../utils/schedulerUtil';
import moment from 'moment-timezone/moment-timezone-utils';

const {Command} = require('@sapphire/framework');

module.exports = class BirthdayAnnouncementCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'birthdayAnnouncement',
      aliases: ['ba'],
      description: 'Schedules Birthday Announcements in the Current Channel',
      preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
      detailedDescription: `${'birthdayAnnouncement <time> <role:optional>`'}
You can specify the announcement time in most common time formats.
If you make a mistake, simply run the command again, only one birthday announcement can be scheduled per day.
If you specify a role, people will receive the role for the duration of their birthday.`,
    });
  }

  async run(message: Message, args: Args) {
    const {guildId, channelId} = message;
    const settingsData = await getSettings(guildId as string);

    const announcementTime = await args.pickResult('string');

    if (!announcementTime.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Birthday Announcement Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format 
          ${surroundStringWithBackTick(settingsData.prefix + 'birthdayAnnouncement <time> <role:optional>')}`);
      return message.reply({embeds: [embed]});
    }

    if (!isValidTime(announcementTime.value)) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Birthday Announcement Reply')
          .setDescription('That is not a valid time.');
      return message.reply({embeds: [embed]});
    }

    // Check if they even inputted a string
    let role = null;
    const roleString = await args.peekResult('string');
    if (roleString.success) {
      // Check if the string is a valid role
      const roleArg = await args.restResult('role');
      if (!roleArg.success) {
        const embed = new BediEmbed()
            .setColor(colors.ERROR)
            .setTitle('Birthday Announcement Reply')
            .setDescription('That is not a valid role.');
        return message.reply({embeds: [embed]});
      }
      role = roleArg.value;
    }

    await agenda.cancel({
      'name': BIRTH_ANNOUNCE_JOB_NAME,
      'data.guildId': guildId,
    });

    let data;

    if (role) {
      data = {
        guildId: guildId,
        channelId: channelId,
        autoDelete: false,
        roleId: role.id,
      };
    } else {
      data = {
        guildId: guildId,
        channelId: channelId,
        autoDelete: false,
      };
    }

    const job = await agenda.create(BIRTH_ANNOUNCE_JOB_NAME, data);

    await job.repeatEvery('5 seconds', {skipImmediate: true})
             .schedule(announcementTime.value);

    const localRunTime = job.attrs.nextRunAt;

    const nextRun = moment.tz(moment().format('YYYY-MM-DD'), settingsData.timezone);
    nextRun.set({h: localRunTime?.getHours(), m: localRunTime?.getMinutes()});
    if (nextRun < moment()) nextRun.add(1, 'd');

    const buttonRow = new MessageActionRow()
        .addComponents([
          new MessageButton()
              .setCustomId('birthDeleteYes')
              .setLabel('Yes')
              .setStyle('SUCCESS'),
          new MessageButton()
              .setCustomId('birthDeleteNo')
              .setLabel('No')
              .setStyle('DANGER'),
        ]);

    const embed = new BediEmbed()
        .setTitle('Birthday Announcement Reply')
        .setDescription(`Birthday Announcements have been scheduled for ${surroundStringWithBackTick(
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
            .setTitle('Birthday Announcement Reply')
            .setColor(colors.ERROR)
            .setDescription('You did not run this command');

        return interaction.reply({
          ephemeral: true,
          embeds: [embed],
        });
      }

      if (interaction.customId === 'birthDeleteYes') {
        job.attrs.data!.autoDelete = true;
      }

      await job.schedule(nextRun.toDate()).save();

      const embed = new BediEmbed()
          .setTitle('Birthday Announcement Reply')
          .setDescription(`Birthday Announcements have been scheduled for ${surroundStringWithBackTick(
              `${nextRun.toDate().toLocaleTimeString('en-US', {timeZone: settingsData.timezone})}`)}`);

      await reply.edit({
        embeds: [embed],
        components: [],
      });
    });

    buttonCollector.on('end', async interaction => {
      const embed = new BediEmbed()
          .setTitle('Birthday Announcement Reply')
          .setDescription(`You took too long to choose. Announcements have not been scheduled.`);

      await reply.edit({
        embeds: [embed],
        components: [],
      });
    });
  }
};

