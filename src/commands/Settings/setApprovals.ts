import {Args, PieceContext} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';

import settingsModel, {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';

const {Command} = require('@sapphire/framework');

module.exports = class SetApprovalsCommand extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'setApprovals',
            aliases: ['sa', 'setapproval'],
            description: 'Changes the number of quote approvals required for BediBot',
            preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
            detailedDescription: 'setApprovals <integer>`',
        });
    }

    async run(message: Message, args: Args) {
        const {guildId} = message;
        const settingsData = await getSettings(guildId as string);

        // Check if they even inputted a string
        const newValue = await args.peekResult('integer');
        if (!newValue.success) {
            const embed = new BediEmbed()
                              .setColor(colors.ERROR)
                              .setTitle('Set Quote Approvals Reply')
                              .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${
                                  Formatters.inlineCode(settingsData.prefix + 'setApprovals <integer>')}`);
            return message.reply({embeds: [embed]});
        }

        await settingsModel.updateOne({_id: guildId as string}, {quoteApprovalsRequired: newValue.value});

        const embed = new BediEmbed()
                          .setTitle('Set Quote Approvals Reply')
                          .setColor(colors.SUCCESS)
                          .setDescription(`The number of quote approvals required has been updated to ${
                              Formatters.inlineCode(newValue.value.toString())}`);
        return message.reply({embeds: [embed]});
    };
};