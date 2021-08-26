import {SapphireClient} from '@sapphire/framework';

import {CLIENT_OPTIONS} from './config';
import {validateEnv} from './utils/envUtil';
import logger from './utils/loggerUtil';

const client = new SapphireClient(CLIENT_OPTIONS);

const main = async () => {
        if (!validateEnv()) return;

        try {
                logger.warn('Bot is logging in');
                await client.login(process.env.BOT_TOKEN);
                logger.warn('Bot has logged in');
        } catch (error) {
                logger.error(error);
                client.destroy();
                process.exit(1);
        }
};

main().then();