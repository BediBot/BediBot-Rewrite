import {CommandErrorPayload, Events, Listener, PieceContext, UserError} from '@sapphire/framework';

import logger from '../utils/loggerUtil';
import {capFirstLetter} from '../utils/stringsUtil';

module.exports = class CommandError extends Listener {
        constructor(context: PieceContext) {
                super(context, {
                        event: Events.CommandError,
                });
        }

        public async run({context, message: content}: UserError, {message, command}: CommandErrorPayload) {
                const commandName = capFirstLetter(command.name);
                logger.error('Command Error:' + commandName + ' - ' + content);
                logger.error('==== ERROR CONTEXT BEGIN ====');
                logger.error(JSON.stringify(message));  // Log the message to ensure that we can debug later
                logger.error('==== ERROR CONTEXT END ====');
        }
};