import {CommandDeniedPayload, Events, Listener, PieceContext, UserError} from '@sapphire/framework';

import {BediEmbed} from '../lib/BediEmbed';
import colors from '../utils/colorUtil';
import logger from '../utils/loggerUtil';
import {capFirstLetter} from '../utils/stringsUtil';

module.exports = class CommandDenied extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            event: Events.CommandDenied,
        });
    }

    public async run({context, message: content}: UserError, {message, command}: CommandDeniedPayload) {
        const commandName = capFirstLetter(command.name);

        logger.debug('Command Denied: ' + commandName + ' - ' + content);

        // Does nothing if command has 'silent' flag
        if (Reflect.get(Object(context), 'silent')) return;

        const embed = new BediEmbed().setTitle(commandName + ' Reply').setColor(colors.ERROR).setDescription(content);
        return message.reply({embeds: [embed]});
    }
};