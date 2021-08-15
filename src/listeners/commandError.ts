import {CommandErrorPayload, Events, Listener, PieceContext, UserError} from '@sapphire/framework';
import {capFirstLetter} from '../utils/stringsUtil';
import logger from '../utils/loggerUtil';

module.exports = class CommandError extends Listener {
  constructor(context: PieceContext) {
    super(context, {
      event: Events.CommandError,
    });
  }

  public async run({context, message: content}: UserError, {message, command}: CommandErrorPayload) {
    const commandName = capFirstLetter(command.name);

    logger.error('Command Error:' + commandName + ' - ' + content);
  }
};