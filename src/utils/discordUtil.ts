import {Guild, Message, Role, Channel} from 'discord.js';
import logger from './loggerUtil';
import {getSettings} from '../database/models/SettingsModel';

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
  const {guildId} = message;

  const guildPrefix = (await getSettings(guildId as string)).prefix;

  return guildPrefix ?? '$';
};


/**
 * 
 * @param channel Discord JS channel object in which to delete messages
 * @param number_of_msgs Number of messages to fetch and delete
 * @note This command will purposely ignore pinned messages
 */
export const purge_messages = async(message: Message, number_of_msgs: number) => {
    if(message.channel.type == "GUILD_TEXT")
    {
      const fetched_messages = await message.channel.messages.fetch({limit: number_of_msgs});
      const messages_to_delete = fetched_messages.filter((m) => !m.pinned);
      message.channel.bulkDelete(messages_to_delete); 
    }
};