import {Args, PieceContext} from '@sapphire/framework';
import {BaseGuildTextChannel, GuildChannel, Message} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {agenda, isValidDurationOrTime} from '../../utils/schedulerUtil';
import {Job} from 'agenda';

const {Command} = require('@sapphire/framework');

export const UNLOCK_JOB_NAME = 'Unlock Channel for Role';

module.exports = class LockdownCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'lockdown',
      aliases: ['ld'],
      description: 'Prevents a role from speaking in the channel',
      preconditions: ['GuildOnly', ['AdminOnly', 'BotOwnerOnly'], 'ManageRolesPerms'],
      //TODO: put possible units in detailed description when written
      //seconds, minutes, hours, days, weeks, months (30 days), years (365 days)
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
    const jobs = await agenda.cancel({
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
        Unlock scheduled for ${surroundStringWithBackTick(`${nextRun?.toDateString()} ${nextRun?.toLocaleTimeString()}`)}`);
    return message.reply({embeds: [embed]});
  }

  onLoad() {
    super.onLoad();

    // Define job for use in the command
    agenda.define(UNLOCK_JOB_NAME, async (job: Job) => {
      const {client} = this.container;
      const guildId = job.attrs.data?.guildId;
      const channelId = job.attrs.data?.channelId;
      const roleId = job.attrs.data?.roleId;
      const messageId = job.attrs.data?.messageId;

      const guild = client.guilds.cache.get(guildId);

      if (guild) {
        const channel = await guild.channels.fetch(channelId) as BaseGuildTextChannel;
        const role = await guild.roles.fetch(roleId);
        if (channel && role) {
          await channel.permissionOverwrites.edit(role, {SEND_MESSAGES: true});

          const message = await channel.messages.fetch(messageId);
          if (message) {
            const embed = new BediEmbed()
                .setTitle('Lockdown Reply')
                .setDescription(`Channel has been unlocked for ${role.toString()}`);
            await message.reply({embeds: [embed]});
          }
        } else {
          job.fail('Channel or Role not found. This means either the channel or role has been deleted.');
        }
      } else {
        job.fail('Guild not found. This means BediBot is no longer in this guild.');
      }
      await job.remove();
    });
  }
};

