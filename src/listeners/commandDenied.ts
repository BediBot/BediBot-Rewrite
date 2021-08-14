import {CommandDeniedPayload, Events, Listener, PieceContext, UserError} from '@sapphire/framework';
import {BediEmbed} from '../lib/BediEmbed';
import colors from '../utils/colorUtil';
import {capFirstLetter} from '../utils/stringsUtil';
import logger from '../utils/loggerUtil';

module.exports = class CommandDenied extends Listener {
  constructor(context: PieceContext) {
    super(context, {
      event: Events.CommandDenied,
    });
  }

  public async run({context, message: content}: UserError, {message, command}: CommandDeniedPayload) {
    logger.warn('Command Denied: ' + capFirstLetter(command.name));

    // Does nothing if command has 'silent' flag
    if (Reflect.get(Object(context), 'silent')) return;

    const embed = new BediEmbed()
        .setTitle(capFirstLetter(command.name) + ' Reply')
        .setColor(colors.ERROR)
        .setDescription(content);

    return message.reply({
      embeds: [embed],
    });
  }
};