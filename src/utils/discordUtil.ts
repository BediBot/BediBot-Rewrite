import {container, SapphireClient} from '@sapphire/framework';
import {Collection, Guild, GuildMember, Message, Role} from 'discord.js';
import moment from 'moment-timezone/moment-timezone-utils';

import {DEFAULT_PREFIX} from '../config';
import {getSettings} from '../database/models/SettingsModel';

import logger from './loggerUtil';

/**
 * Adds role to the author of a given message
 * @param message
 * @param roleName
 * @returns {Promise<void>}
 */
export const addRoleToAuthor = async (message: Message, roleName: string) => {
  const {author, guild} = message;

  if (!guild) {
    logger.warn('addRoleToAuthor called from message without valid guild');
    return;
  }

  await addRoleToUser(author.id, guild, roleName);
};

/**
 * Adds role to a specified user
 * @param userId
 * @param guild
 * @param roleName
 * @returns {Promise<void>}
 */
export const addRoleToUser =
    async (userId: string, guild: Guild|null, roleName: string) => {
  if (!guild) {
    logger.warn('addRoleToUser called from message without valid guild ID');
    return;
  }

  const role = guild.roles.cache.find(role => role.name === roleName);

  if (!role) {
    logger.warn('Attempted to add role that does not exist');
    return;
  }

  const member = await guild.members.fetch(userId).catch();

  try {
    await member!.roles.add(role as Role);
  } catch (error) { logger.error(error); }
};

/**
 * This function is passed into the SapphireClient so that it can fetch
 * server-specific prefixes
 * @param message
 * @returns {Promise<any>}
 */
export const fetchPrefix = async (message: Message) => {
  if (!message.guild) return [DEFAULT_PREFIX, ''];

  const {guildId} = message;

  return (await getSettings(guildId as string)).prefix;
};

/**
 * Purge messages in a specific channel
 * @param message Discord JS message object
 * @param numMessages Number of messages to fetch and delete
 * @note This command will purposely ignore pinned messages
 * @returns whether the message was actually deleted or not
 */
export const purgeMessages = async (message: Message, numMessages: number) => {
  if (message.channel.type == 'GUILD_TEXT') {
    const fetchedMessages = await message.channel.messages.fetch(
	{limit: numMessages, before: message.id});
    const messagesToDelete = await fetchedMessages.filter(
	(m: Message) => !m.pinned ||
	    m.createdTimestamp < moment().subtract(14, 'd').toDate().valueOf());
    await message.channel.bulkDelete(messagesToDelete);
    return messagesToDelete.size;
  }
  return false;
};

/**
 * Purges messages from specific user with a specified search depth
 * @param message
 * @param numMessagesToSearch
 * @param userId user ID as a string to filter out messages for
 * @returns number of messages deleted
 */
export const purgeMessagesFromUser =
    async (message: Message, numMessagesToSearch: number, userId: string) => {
  let numMessagesDeleted = 0;
  if (message.channel.type == 'GUILD_TEXT') {
    const fetched_messages =
	await message.channel.messages.fetch({limit: numMessagesToSearch});
    const messagesToDelete = fetched_messages.filter(
	(m: Message) => m.author.id == userId ||
	    m.createdTimestamp < moment().subtract(14, 'd').toDate().valueOf());
    await message.channel.bulkDelete(messagesToDelete);
    numMessagesDeleted = messagesToDelete.size;
  }
  return numMessagesDeleted;
};

/**
 * Gets the number of guilds that the client is a member in
 * @param client
 * @returns {number}
 */
export const numGuilds =
    (client: SapphireClient) => { return client.guilds.cache.size;};

/**
 * Gets the number of unique users that the client can see
 * @param client
 * @returns {number}
 */
export const numUsers = async (client: SapphireClient) => {
  let members = new Collection<string, GuildMember>();

  for (const guild of client.guilds.cache) {
    // Get all members in guild
    const newMembers =
	(await guild[1].members.fetch()).filter(member => !member.user.bot);

    // Add member to collection of members if they are new (ensures that we dont
    // double count members if they are in multiple guilds)
    newMembers.forEach(newMember => {
      if (!members.find(oldMember => oldMember.id === newMember.id))
	members.set(newMember.id, newMember);
    });
  }

  return members.size;
};

/**
 * Gets a user object from a mention
 * @param mention
 * @returns {User | undefined}
 */
export const getUserFromMention = (mention: string) => {
  if (!mention) return;

  if (mention.startsWith('<@') && mention.endsWith('>')) {
    mention = mention.slice(2, -1);

    if (mention.startsWith('!')) { mention = mention.slice(1); }

    return container.client.users.fetch(mention);
  }
};