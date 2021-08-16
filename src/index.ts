import {SapphireClient} from '@sapphire/framework';
import {validateEnv} from './utils/envUtil';
import logger from './utils/loggerUtil';
import {CLIENT_OPTIONS} from './config';

const client = new SapphireClient(CLIENT_OPTIONS);

const main = async () => {
  if (!validateEnv()) return;

  try {
    logger.info('Bot is logging in');
    await client.login(process.env.BOT_TOKEN);
    logger.info('Bot has logged in');
    logger.info('bot auto restarted and detected this change');
  } catch (error) {
    logger.error(error);
    client.destroy();
    process.exit(1);
  }
};

main().then();