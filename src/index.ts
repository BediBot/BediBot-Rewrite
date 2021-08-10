import {LogLevel, SapphireClient} from '@sapphire/framework';
import {Intents} from 'discord.js';
import {validateEnv} from './utils/validateEnv';
import {connectDatabase} from './database/connectDatabase';

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

const main = async () => {
  if (!validateEnv()) return;

  try {
    client.logger.info('Bot is logging in');
    await client.login(process.env.BOT_TOKEN);
    client.logger.info('Bot has logged in');
    await connectDatabase();
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
};

main().catch(console.error);