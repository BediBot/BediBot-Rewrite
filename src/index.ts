import {LogLevel, SapphireClient} from '@sapphire/framework';

require('dotenv').config({path: '../.env'});

const client = new SapphireClient({
  defaultPrefix: '$',
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Info,
  },
});

const main = async () => {
  try {
    client.logger.info('Bot is logging in');
    await client.login(process.env.BOT_TOKEN);
    client.logger.info('Bot has logged in');
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
};

main().catch(console.error);