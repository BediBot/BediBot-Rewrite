import {ClientOptions, Intents, PresenceData} from 'discord.js';
import {LogLevel} from '@sapphire/framework';
import {getRandomStatus} from './utils/statusUtil';
import {fetchPrefix} from './utils/discordUtil';

export const DEFAULT_PREFIX = '$';

export const CLIENT_OPTIONS: ClientOptions = {
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
  defaultPrefix: DEFAULT_PREFIX,
  caseInsensitiveCommands: true,
  caseInsensitivePrefixes: true,
  presence: getRandomStatus() as PresenceData,
  logger: {
    level: LogLevel.None,
  },
  partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
  fetchPrefix: fetchPrefix,
};