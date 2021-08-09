import {PieceContext} from '@sapphire/framework';

const {Event} = require('@sapphire/framework');

module.exports = class extends Event {
  constructor(context: PieceContext) {
    super(context, {
      once: true,
    });
  }

  async run() {
    this.context.logger.info('The bot is up and running!');
  }
};