import logger from './loggerUtil';

import Agenda, {Job} from 'agenda/dist/index';
import {BaseGuildTextChannel} from 'discord.js';
import {BediEmbed} from '../lib/BediEmbed';
import {client} from '../index';

const humanInterval = require('human-interval');

export const UNLOCK_JOB_NAME = 'Unlock Channel for Role';

export const agenda = new Agenda();

export const startAgenda = async () => {
  agenda.database(process.env.MONGO_URI as string);
  await agenda.start();
  logger.info('Agenda Started!');

  agenda.on('start', (job) => {
    logger.info(`Job ${job.attrs.name} started`);
  });

  agenda.on('success', (job) => {
    logger.info(`Job ${job.attrs.name} succeeded`);
  });

  agenda.on('fail', (err, job) => {
    logger.error(`Job ${job.attrs.name} failed with error: ${err.message}`);
  });
};

/**
 * Checks if a string is a valid duration or time to schedule
 * @param string
 * @returns {boolean}
 */
export const isValidDurationOrTime = (string: string) => {
  if (string.length === 0) return false;
  const re12 = /((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/;
  const re12Short = /(1[0-2]|0?[1-9] ?([AaPp][Mm]))/;
  const re24 = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  if (re12.test(string) || re24.test(string) || re12Short.test(string)) return true;
  return !isNaN(humanInterval(string).valueOf());
};

// This job allows a role to speak in a specific channel
agenda.define(UNLOCK_JOB_NAME, async (job: Job) => {
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