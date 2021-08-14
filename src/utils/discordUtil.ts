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