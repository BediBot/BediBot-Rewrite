import {Events, Listener, PieceContext} from '@sapphire/framework';

module.exports = class ReadyListener extends Listener {
  constructor(context: PieceContext) {
    super(context, {
      once: true,
      event: Events.ClientReady,
    });
  }

  public run() {
    this.container.logger.info('The bot is up and running!');
  }
};