import {Args, PieceContext, Result, UserError} from '@sapphire/framework';
import {Formatters, Message, MessageActionRow, MessageButton, Snowflake, User} from 'discord.js';
import moment from 'moment-timezone/moment-timezone-utils';

import {MAX_QUOTE_LENGTH} from '../../config';
import {addQuote} from '../../database/models/QuoteModel';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import logger from '../../utils/loggerUtil';

const {Command} = require('@sapphire/framework');

const TITLE_BEFORE_NUM_APPROVALS = 'Add Quote Reply - Approvals: ';

module.exports = class AddQuoteCommand extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'addQuote',
            aliases: ['aq', 'addq', 'aquote'],
            description: 'Adds a quote from an individual of your choice.',
            preconditions: ['GuildOnly', 'QuotesEnabled'],
            detailedDescription: 'addQuote <quote> <author>`' +
                '\nThis command supports both regular names and mentions for the author parameter.',
        });
    }

    async run(message: Message, args: Args) {
        const {guild, guildId, author} = message;
        const settingsData = await getSettings(guildId as string);

        let quote: string|Result<string, UserError>;
        let quoteAuthor: Result<string, UserError>|Result<User, UserError>;

        if (message.reference) {
            // This implies that this is a reply
            quote = (await message.channel.messages.fetch(message.reference.messageId as Snowflake)).content;
            if (quote.length === 0) {
                const embed = new BediEmbed()
                                  .setColor(colors.ERROR)
                                  .setTitle('Add Quote Reply')
                                  .setDescription(
                                      `Please ensure that the message you're replying to contains text content (i.e. No embeds)`);
                return message.reply({embeds: [embed]});
            }
            quoteAuthor = await args.pickResult('user');
            if (!quoteAuthor.success) quoteAuthor = await args.pickResult('string');

            if (!quoteAuthor.success) {
                const embed = new BediEmbed()
                                  .setColor(colors.ERROR)
                                  .setTitle('Add Quote Reply')
                                  .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${
                                      Formatters.inlineCode(settingsData.prefix + 'addQuote <author>')}`);
                return message.reply({embeds: [embed]});
            }
        } else {
            quote = await args.pickResult('string');
            quoteAuthor = await args.pickResult('user');
            if (!quoteAuthor.success) quoteAuthor = await args.pickResult('string');

            if (!quote.success || !quoteAuthor.success) {
                const embed = new BediEmbed()
                                  .setColor(colors.ERROR)
                                  .setTitle('Add Quote Reply')
                                  .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${
                                      Formatters.inlineCode(settingsData.prefix + 'addQuote <quote> <author>')}`);
                return message.reply({embeds: [embed]});
            }
            quote = quote.value;
        }

        if (quote.length === 0) {
            const embed = new BediEmbed()
                              .setColor(colors.ERROR)
                              .setTitle('Add Quote Reply')
                              .setDescription('You cannot submit an empty quote.');
            return message.reply({embeds: [embed]});
        }

        if (quote.length > MAX_QUOTE_LENGTH) {
            const embed = new BediEmbed()
                              .setColor(colors.ERROR)
                              .setTitle('Add Quote Reply')
                              .setDescription('Quote is too long! Please submit a quote that is 1000 characters or fewer.');
            return message.reply({embeds: [embed]});
        }
        const embed = new BediEmbed()
                          .setColor(colors.ACTION)
                          .setTitle(`${TITLE_BEFORE_NUM_APPROVALS}0/${settingsData.quoteApprovalsRequired}`);

        const date = moment().toDate();

        // displayQuote will be the string that is displayed, as this will have different formatting depending on quote
        // content
        let displayQuote = quote;
        if (!displayQuote.includes('<')) displayQuote = Formatters.inlineCode(quote);

        if (typeof quoteAuthor.value === 'string') {
            embed.setDescription(
                `Quote: ${displayQuote}\nAuthor: ${Formatters.inlineCode(quoteAuthor.value as string)}\nDate: <t:${
                    Math.round(date.valueOf() / 1000)}:f>\nSubmitted By: ${author}\nApproved By:`);
        } else {
            embed.setDescription(`Quote: ${displayQuote}\nAuthor: ${quoteAuthor.value}\nDate: <t:${
                Math.round(date.valueOf() / 1000)}:f>\nSubmitted By: ${author}\nApproved By:`);
        }

        const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('QuoteApprove').setLabel('Approve').setStyle('SUCCESS'),
        );

        const response = await message.reply({
            embeds: [embed],
            components: [row],
        });

        let numApprovals = 0;
        let approvedByString = '';

        const collector = response.createMessageComponentCollector({componentType: 'BUTTON', time: 1800000});
        collector.on('collect', async interaction => {
            if (!interaction.isButton() || interaction.customId != 'QuoteApprove') return;

            await interaction.deferUpdate();

            collector.resetTimer();  // If someone interacts, reset the timer to give more time for approvals to come in

            const message = interaction.message;
            if (!(message instanceof Message)) return;

            let description = message.embeds[0].description;

            if (description?.includes(interaction.user.toString())) return;

            numApprovals++;

            approvedByString += ` ${interaction.user}`;

            const settingsData = await getSettings(interaction.guildId as string);

            if (numApprovals < settingsData.quoteApprovalsRequired) {
                const embed =
                    new BediEmbed()
                        .setColor(colors.ACTION)
                        .setTitle(`Add Quote Reply - Approvals: ${numApprovals}/${settingsData.quoteApprovalsRequired}`);

                if (typeof quoteAuthor.value === 'string') {
                    embed.setDescription(
                        `Quote: ${displayQuote}\nAuthor: ${Formatters.inlineCode(quoteAuthor.value as string)}\nDate: <t:${
                            Math.round(date.valueOf() / 1000)}:f>\nSubmitted By: ${author}\nApproved By: ${approvedByString}`);
                } else {
                    embed.setDescription(`Quote: ${displayQuote}\nAuthor: ${quoteAuthor.value}\nDate: <t:${
                        Math.round(date.valueOf() / 1000)}:f>\nSubmitted By: ${author}\nApproved By: ${approvedByString}`);
                }

                await message.edit({embeds: [embed]});
            } else {
                const embed = new BediEmbed().setColor(colors.SUCCESS).setTitle('Add Quote Reply - Approved');

                if (typeof quoteAuthor.value === 'string') {
                    embed.setDescription(
                        `Quote: ${displayQuote}\nAuthor: ${Formatters.inlineCode(quoteAuthor.value as string)}\nDate: <t:${
                            Math.round(date.valueOf() / 1000)}:f>\nSubmitted By: ${author}\nApproved By: ${approvedByString}`);
                } else {
                    embed.setDescription(`Quote: ${displayQuote}\nAuthor: ${quoteAuthor.value}\nDate: <t:${
                        Math.round(date.valueOf() / 1000)}:f>\nSubmitted By: ${author}\nApproved By: ${approvedByString}`);
                }

                await addQuote(interaction.guildId as string, quote as string, quoteAuthor.value!.toString(), date);

                await message.edit({
                    embeds: [embed],
                    components: [],
                });
                collector.stop();
            }
        });
        collector.on('end', async interaction => {
            if (numApprovals < settingsData.quoteApprovalsRequired) {
                const embed = response.embeds[0];
                embed.setTitle('Add Quote Reply - Timed Out').setColor(colors.ERROR);

                await response
                    .edit({
                        embeds: [embed],
                        components: [],
                    })
                    .catch(
                        () => logger.error(
                            `Unable to edit Add Quote Response in ${message.guild?.name}.` +
                            `Usually due to response being deleted by an admin.`));
            }
        });
    }
};