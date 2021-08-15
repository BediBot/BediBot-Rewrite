import {Guild, Message, Role} from 'discord.js';
import logger from './loggerUtil';
import {getSettings} from '../database/models/SettingsModel';
import {DEFAULT_PREFIX} from '../config';

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
export const addRoleToUser = async (userId: string, guild: Guild | null, roleName: string) => {
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
  } catch (error) {
    logger.error(error);
  }
};

/**
 * This function is passed into the SapphireClient so that it can fetch server-specific prefixes
 * @param message
 * @returns {Promise<any>}
 */
export const fetchPrefix = async (message: Message) => {
  if (!message.guild) return DEFAULT_PREFIX;

  const {guildId} = message;

  return (await getSettings(guildId as string)).prefix;
};

/**
 * Purge messages in a specific channel
 * @param message Discord JS message object
 * @param number_of_msgs Number of messages to fetch and delete
 * @note This command will purposely ignore pinned messages
 * @returns whether the message was actually deleted or not
 */
export const purge_messages = async (message: Message, number_of_msgs: number) => {
  if (message.channel.type == 'GUILD_TEXT') {
    const fetched_messages = await message.channel.messages.fetch({limit: number_of_msgs});
    const messages_to_delete = fetched_messages.filter((m) => !m.pinned);
    await message.channel.bulkDelete(messages_to_delete);
    return true;
  }
  return false;
};

/**
 * Purges messages from specific user with a specified search depth
 * @param message
 * @param number_of_msgs_to_search
 * @param userId user ID as a string to filter out messages for
 * @returns number of messages deleted
 */
export const purge_messages_from_specific_user = async (message: Message, number_of_msgs_to_search: number, userId: string) => {
  let number_of_messages_deleted = 0;
  if (message.channel.type == 'GUILD_TEXT') {
    const fetched_messages = await message.channel.messages.fetch({limit: number_of_msgs_to_search});
    const messages_to_delete = fetched_messages.filter((m) => m.author.id == userId);
    await message.channel.bulkDelete(messages_to_delete);
    number_of_messages_deleted = messages_to_delete.size;
  }
  return number_of_messages_deleted;
};
