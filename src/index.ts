import {LogLevel, SapphireClient} from '@sapphire/framework';
import {Intents} from 'discord.js';
import {validateEnv} from './utils/envUtil';
import logger from './utils/loggerUtil';
import {fetchPrefix} from './utils/discordUtil';

require('dotenv').config({path: '../.env'});

const client = new SapphireClient({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  defaultPrefix: '$',
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Info,
  },
  partials: ['CHANNEL'],
});

client.fetchPrefix = fetchPrefix;

const main = async () => {
  if (!validateEnv()) return;

  try {
    logger.info('Bot is logging in');
    await client.login(process.env.BOT_TOKEN);
    logger.info('Bot has logged in');
  } catch (error) {
    logger.error(error);
    client.destroy();
    process.exit(1);
  }
};

main().then();