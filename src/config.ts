import {ClientOptions, Intents} from 'discord.js';
import {LogLevel} from '@sapphire/framework';
import {fetchPrefix} from './utils/discordUtil';

export const DEFAULT_PREFIX = '$';

export const CLIENT_OPTIONS: ClientOptions = {
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  defaultPrefix: DEFAULT_PREFIX,
  caseInsensitiveCommands: true,
  caseInsensitivePrefixes: true,
  logger: {
    level: LogLevel.None,
  },
  partials: ['CHANNEL'],
  fetchPrefix: fetchPrefix,
};