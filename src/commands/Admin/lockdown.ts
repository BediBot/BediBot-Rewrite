import {Args, PieceContext} from '@sapphire/framework';
import {GuildChannel, Message} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {agenda, isValidDurationOrTime, UNLOCK_JOB_NAME} from '../../utils/schedulerUtil';

const {Command} = require('@sapphire/framework');

module.exports = class LockdownCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'lockdown',
      aliases: ['ld'],
      description: 'Prevents a role from speaking in the channel',
      preconditions: ['GuildOnly', ['AdminOnly', 'BotOwnerOnly'], 'ManageRolesPerms'],
      detailedDescription: `${surroundStringWithBackTick(`Usage: lockdown <role> <durationOrTime></durationOrTime>`)}
You can either specify how long the channel should be locked down, or what time it should be unlocked.
Possible units for duration are: seconds, minutes, hours, days, weeks, months (30 days), years (365 days).`,
    });
  }

  async run(message: Message, args: Args) {
    const {guildId, channelId} = message;
    const settingsData = await getSettings(guildId as string);

    // Check if they even inputted a string
    const roleString = await args.peekResult('string');
    if (!roleString.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Lockdown Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format 
          ${surroundStringWithBackTick(settingsData.prefix + 'lockdown <role> <durationORtime:optional>')}`);
      return message.reply({embeds: [embed]});
    }

    // Check if the string is a valid role
    const role = await args.pickResult('role');
    if (!role.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Lockdown Reply')
          .setDescription('That is not a valid role.');
      return message.reply({embeds: [embed]});
    }

    // This should never return due to the GuildOnly precondition
    if (!(message.channel instanceof GuildChannel)) return;

    await message.channel.permissionOverwrites.edit(role.value, {SEND_MESSAGES: false});

    const durationOrTime = await args.restResult('string');
    if (!durationOrTime.success) {
      const embed = new BediEmbed()
          .setTitle('Lockdown Reply')
          .setDescription(`Channel has been locked for ${role.value.toString()}`);
      return message.reply({embeds: [embed]});
    }

    // Check if duration they entered is valid -> see human-interval module for valid durations
    if (!isValidDurationOrTime(durationOrTime.value)) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Lockdown Reply')
          .setDescription('That is not a valid duration or time.');
      return message.reply({embeds: [embed]});
    }

    // Remove old jobs
    await agenda.cancel({
      'name': UNLOCK_JOB_NAME,
      'data.guildId': guildId,
      'data.channelId': channelId,
      'data.roleId': role.value.id,
    });

    // Schedule job
    const job = await agenda.schedule(durationOrTime.value, UNLOCK_JOB_NAME, {
      guildId: guildId,
      channelId: channelId,
      roleId: role.value.id,
      messageId: message.id,
    });

    // Response message with next run time
    const nextRun = job.attrs.nextRunAt;
    const embed = new BediEmbed()
        .setTitle('Lockdown Reply')
        .setDescription(`Channel has been locked for ${role.value.toString()}
        Unlock scheduled for ${surroundStringWithBackTick(`${nextRun?.toLocaleTimeString('en-US', {timeZone: settingsData.timezone})}`)}`);
    return message.reply({embeds: [embed]});
  }
};

