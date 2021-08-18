import {Events, Listener, PieceContext} from '@sapphire/framework';
import {connectDatabase} from '../database/connectDatabase';
import logger from '../utils/loggerUtil';
import {startAgenda} from '../utils/schedulerUtil';

module.exports = class ReadyListener extends Listener {
  constructor(context: PieceContext) {
    super(context, {
      once: true,
      event: Events.ClientReady,
    });
  }

  public async run() {
    logger.info('The bot is up and running!');

    await connectDatabase();

    await startAgenda();
  }
};