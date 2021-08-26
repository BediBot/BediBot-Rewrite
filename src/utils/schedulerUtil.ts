import {container} from '@sapphire/framework';
import Agenda, {Job} from 'agenda/dist/index';
import {BaseGuildTextChannel, Formatters} from 'discord.js';

import {getBirthdaysToday} from '../database/models/BirthdayModel';
import {getDueDatesInGuildForCategoryAndCourse, removeOldDueDatesInGuild} from '../database/models/DueDateModel';
import {getRandomQuoteInGuild} from '../database/models/QuoteModel';
import {getSettings} from '../database/models/SettingsModel';
import {BediEmbed} from '../lib/BediEmbed';

import {getUserFromMention} from './discordUtil';
import logger from './loggerUtil';

const humanInterval = require('human-interval');

export const UNLOCK_JOB_NAME = 'Unlock Channel for Role';
export const MORN_ANNOUNCE_JOB_NAME = 'Send Morning Announcement';
export const BIRTH_ANNOUNCE_JOB_NAME = 'Send Birthday Announcement';
export const DUE_DATE_UPDATE_JOB_NAME = 'Update Due Dates';

export const agenda = new Agenda();

export const startAgenda = async () => {
  agenda.database(process.env.MONGO_URI as string);
  await agenda.start();
  logger.warn('Agenda Started!');

  agenda.on('start', (job) => { logger.verbose(`Job ${job.attrs.name} started`); });

  agenda.on('success', (job) => { logger.verbose(`Job ${job.attrs.name} succeeded`); });

  agenda.on('fail', async (err, job) => {
	logger.error(`Job ${job.attrs.name} failed with error: ${err.nessage}`);
	await job.remove();
  });
};

export const isValidDurationOrTime = (string: string) => {
  if (string.length === 0) return false;
  if (isValidTime(string)) return true;
  const value = humanInterval(string).valueOf();
  return !isNaN(value) && value != 0;
};

export const isValidTime = (string: string) => {
  const re12 = /^(0?[1-9]|1[012])(:[0-5]\d) [APap][mM]$/;
  const re12Short = /^(0?[1-9]|1[012]) [APap][mM]$/;
  const re24 = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  return re12.test(string) || re24.test(string) || re12Short.test(string);
};

agenda.define(UNLOCK_JOB_NAME, async (job: Job) => {
  const client = container.client;

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

	  const embed = new BediEmbed().setTitle('Lockdown Reply').setDescription(`Channel has been unlocked for ${role.toString()}`);

	  try {
		const message = await channel.messages.fetch(messageId);
		await message.reply({embeds: [embed]});
	  } catch {
		logger.debug('Unlock Role Job: Unable to find invoking message so can not reply to it');
		await channel.send({embeds: [embed]});
	  }

	} else {
	  await job.fail('Channel or Role not found. This means either the channel or role has been deleted.');
	}
  } else {
	await job.fail('Guild not found. This means BediBot is no longer in this guild.');
  }
  await job.remove();
});

agenda.define(MORN_ANNOUNCE_JOB_NAME, async (job: Job) => {
  const client = container.client;

  const guildId = job.attrs.data?.guildId;
  const channelId = job.attrs.data?.channelId;
  const autoDelete = job.attrs.data?.autoDelete;

  const guild = client.guilds.cache.get(guildId);

  if (guild) {
	const channel = await guild.channels.fetch(channelId) as BaseGuildTextChannel;
	if (channel) {
	  const quote = await getRandomQuoteInGuild(guildId);
	  const user = await getUserFromMention(quote?.name as string);

	  let description: string;
	  if (quote?.date) {
		if (user)
		  description = `Quote: ${Formatters.inlineCode(quote?.quote as string)}\nAuthor: ${quote?.name}\nDate: <t:${
			  Math.round(quote.date.valueOf() / 1000)}:D>`;
		else
		  description = `Quote: ${Formatters.inlineCode(quote?.quote as string)}\nAuthor: ${
			  Formatters.inlineCode(quote?.name as string)}\nDate: <t:${Math.round(quote.date.valueOf() / 1000)}:D>`;
	  } else {
		if (user)
		  description = `Quote: ${Formatters.inlineCode(quote?.quote as string)}\nAuthor: ${quote?.name}`;
		else
		  description =
			  `Quote: ${Formatters.inlineCode(quote?.quote as string)}\nAuthor: ${Formatters.inlineCode(quote?.name as string)}`;
	  }

	  const embed = new BediEmbed().setTitle('Good Morning!').setDescription(description);
	  const newMessage = await channel.send({embeds: [embed]});

	  if (autoDelete) {
		const messageId = job.attrs.data?.messageId;
		if (messageId) {
		  try {
			const messageToDelete = await channel.messages.fetch(messageId);
			await messageToDelete.delete();
		  } catch { logger.debug('Morning Announcement Job: Message was manually deleted before bot could get to it.'); }
		}
		job.attrs.data!.messageId = newMessage.id;
		await job.save();
	  }
	} else {
	  await job.fail('Channel not found. This means that the channel has been deleted.');
	}
  } else {
	await job.fail('Guild not found. This means BediBot is no longer in this guild.');
  }
});

agenda.define(BIRTH_ANNOUNCE_JOB_NAME, async (job: Job) => {
  const client = container.client;

  const guildId = job.attrs.data?.guildId;
  const channelId = job.attrs.data?.channelId;
  const roleId = job.attrs.data?.roleId;
  const autoDelete = job.attrs.data?.autoDelete;

  const guild = client.guilds.cache.get(guildId);

  if (guild) {
	const channel = await guild.channels.fetch(channelId) as BaseGuildTextChannel;
	if (channel) {
	  const settingsData = await getSettings(guildId);
	  const birthdays = await getBirthdaysToday(settingsData.timezone);
	  const guildMembers = await guild.members.fetch();
	  birthdays.filter(birthday => guildMembers.has(birthday._id));

	  let role = null;
	  if (roleId) {
		role = await guild.roles.fetch(roleId);
		if (role) {
		  for (const member of guildMembers) {
			if (member[1].roles.cache.has(roleId)) await member[1].roles.remove(role);
		  }
		}
	  }

	  if (autoDelete) {
		const messageId = job.attrs.data?.messageId;
		if (messageId) {
		  try {
			const messageToDelete = await channel.messages.fetch(messageId);
			await messageToDelete.delete();
		  } catch { logger.debug('Birthday Announcement Job: Message was manually deleted before bot could get to it.'); }
		  job.attrs.data!.messageId = null;
		  await job.save();
		}
	  }

	  if (birthdays.length === 0) return;

	  let mentions = '';
	  for (const birthday of birthdays) {
		const user = guildMembers.get(birthday._id);
		if (role) user?.roles.add(role);
		mentions += ` ${user?.toString()}`;
	  }

	  const embed = new BediEmbed().setTitle('Happy Birthday!').setDescription(mentions);

	  const newMessage = await channel.send({embeds: [embed]});

	  if (autoDelete) {
		job.attrs.data!.messageId = newMessage.id;
		await job.save();
	  }
	} else {
	  await job.fail('Channel not found. This means that the channel has been deleted.');
	}
  } else {
	await job.fail('Guild not found. This means BediBot is no longer in this guild.');
  }
});

const MAX_NUM_EMBED_FIELDS = 25;

agenda.define(DUE_DATE_UPDATE_JOB_NAME, async (job: Job) => {
  const client = container.client;

  const guildId = job.attrs.data?.guildId;
  const channelId = job.attrs.data?.channelId;
  const messageId = job.attrs.data?.messageId;
  const category = job.attrs.data?.category;

  const guild = client.guilds.cache.get(guildId);

  if (guild) {
	const channel = await guild.channels.fetch(channelId) as BaseGuildTextChannel;
	if (channel) {
	  const message = await channel.messages.fetch(messageId);
	  if (message) {
		// This should never return as you should never schedule this job with a
		// messageID unless the client sent it
		if (message.author.id != client.id) return;

		await removeOldDueDatesInGuild(guildId);

		const settingsData = await getSettings(guildId);

		const embed = new BediEmbed().setTitle(`Due Dates for Category: ${category}`);

		for (const course of settingsData.courses) {
		  if (embed.fields.length === MAX_NUM_EMBED_FIELDS) { break; }

		  const dueDates = await getDueDatesInGuildForCategoryAndCourse(guildId, category, course);

		  for (const dueDate of dueDates) {
			let emoji: string;
			switch (dueDate.type) {
			  case 'Assignment':
				emoji = ':pushpin:';
				break;
			  case 'Test':
				emoji = ':bulb:';
				break;
			  case 'Exam':
				emoji = ':pen_ballpoint:';
				break;
			  case 'Project':
				emoji = ':books:';
				break;
			  case 'Quiz':
				emoji = ':pencil:';
				break;
			  default:
				emoji = ':placard:';
			}

			let fieldName: string;
			if (dueDate === dueDates[0])
			  fieldName = `——————————**${course}**——————————\n\n${emoji} ${dueDate.title}`;
			else
			  fieldName = `${emoji} ${dueDate.title}`;

			let fieldValue: string;
			if (dueDate.dateOnly)
			  fieldValue = `**Type:** ${Formatters.inlineCode(dueDate.type)}\n**Date:** <t:${
				  Math.round(dueDate.dateTime.valueOf() / 1000)}:D>\n\u200b`;
			else
			  fieldValue = `**Type:** ${Formatters.inlineCode(dueDate.type)}\n**Date:** <t:${
				  Math.round(dueDate.dateTime.valueOf() / 1000)}:f>\n\u200b`;

			if (embed.fields.length === (MAX_NUM_EMBED_FIELDS - 1)) {
			  embed.addField('Maximum Limit Reached', 'Remaining Due Dates hidden');
			  break;
			}

			embed.addField(fieldName, fieldValue, false);
		  }
		}
		await message.edit({embeds: [embed]});
	  } else {
		await job.fail('Message not found. This means either the message has been deleted.');
	  }
	} else {
	  await job.fail('Channel not found. This means that the channel has been deleted.');
	}
  } else {
	await job.fail('Guild not found. This means BediBot is no longer in this guild.');
  }
});