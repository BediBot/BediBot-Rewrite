import {ClientOptions, Intents} from 'discord.js';
import {LogLevel} from '@sapphire/framework';
import {fetchPrefix, getRandomStatus} from './utils/discordUtil';

export const DEFAULT_PREFIX = '$';

export const STATUSES = [
  {status: 'online', activities: [{type: 'LISTENING', name: 'Martingales | $help'}]},
  {status: 'online', activities: [{type: 'LISTENING', name: '115 ASMR | $help'}]},
  {status: 'online', activities: [{type: 'WATCHING', name: 'Geese honk | $help'}]},
  {status: 'online', activities: [{type: 'WATCHING', name: 'Crowdmark | $help'}]},
  {status: 'online', activities: [{type: 'STREAMING', name: 'EGAD Videos | $help'}]},
  {status: 'online', activities: [{type: 'PLAYING', name: 'Solidworks | $help'}]},
  {status: 'online', activities: [{type: 'PLAYING', name: 'Among Us | $help'}]},
];

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
  presence: getRandomStatus(),
  logger: {
    level: LogLevel.None,
  },
  partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
  fetchPrefix: fetchPrefix,
};

