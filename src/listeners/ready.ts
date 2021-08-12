import {Events, Listener, PieceContext} from '@sapphire/framework';
import {connectDatabase} from '../database/connectDatabase';

module.exports = class ReadyListener extends Listener {
  constructor(context: PieceContext) {
    super(context, {
      once: true,
      event: Events.ClientReady,
    });
  }

  public async run() {
    this.container.logger.info('The bot is up and running!');

    await connectDatabase();
  }
};