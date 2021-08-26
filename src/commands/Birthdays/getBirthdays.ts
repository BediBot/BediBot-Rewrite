import {PaginatedMessage} from '@sapphire/discord.js-utilities';
import {Args, PieceContext} from '@sapphire/framework';
import {Formatters, MemberMention, Message} from 'discord.js';

import {getBirthdaysFromMonth} from '../../database/models/BirthdayModel';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {isValidMonth} from '../../utils/dateUtil';

const {Command} = require('@sapphire/framework');

const MAX_BIRTHDAYS_PER_PAGE = 10;

module.exports = class GetBirthdays extends Command {
        constructor(context: PieceContext) {
                super(context, {
                        name: 'getbirthdays',
                        aliases: ['gb'],
                        description: 'Gets the birthdays for a month',
                        preconditions: ['GuildOnly'],
                        detailedDescription: 'getBirthdays <month>`' +
                            'The month can be long (January), short (Jan), or a number (1).',
                });
        }

        async run(message: Message, args: Args) {
                const {guildId} = message;
                const settingsData = await getSettings(guildId as string);

                let month;
                month = await args.pickResult('integer');
                if (!month.success) month = await args.pickResult('string');

                if (!month.success) return invalidSyntaxReply(message, settingsData);

                month = isValidMonth(month.value);

                if (!month) return invalidSyntaxReply(message, settingsData);

                const birthdays = await getBirthdaysFromMonth(month as number);
                const members = await message.guild?.members.fetch();
                birthdays.filter(birthday => members?.has(birthday._id));

                if (birthdays.length === 0) {
                        const embed = new BediEmbed()
                                          .setColor(colors.ERROR)
                                          .setTitle('Get Birthdays Reply')
                                          .setDescription('No birthdays were found');
                        return message.reply({embeds: [embed]});
                }

                const embed = new BediEmbed().setTitle('Get Birthdays Reply').setDescription('Searching for Quotes');

                const response = await message.reply({embeds: [embed]});

                const monthString = birthdays[0].birthDate.toLocaleString('default', {month: 'long'});
                const templateDescription = `Here are the birthdays for the month of ${Formatters.inlineCode(monthString)}`;

                const paginatedMessage = new PaginatedMessage();

                for (let i = 0; i < birthdays.length; i += MAX_BIRTHDAYS_PER_PAGE) {
                        let embed =
                            new BediEmbed()
                                .setTitle('Get Birthdays Reply')
                                .setDescription(templateDescription)
                                .setFooter(
                                    '  For any concerns, contact a BediBot Dev');  // The spaces before 'For' here are intentional

                        for (let j = 0; j < MAX_BIRTHDAYS_PER_PAGE; j++) {
                                if ((i + j) >= birthdays.length) break;
                                embed.addField(
                                    `${monthString} ${birthdays[i + j].birthDate.getDate()}`,
                                    members?.get(birthdays[i + j]._id)?.toString() as MemberMention, false);
                        }
                        paginatedMessage.addPageEmbed(embed);
                }
                return paginatedMessage.run(response, message.author);
        }
};

/**
 * Replies with the invalid syntax message - This function is purely to avoid repeated code
 * @param message
 * @param settingsData
 * @returns {Promise<Message>}
 */
const invalidSyntaxReply = async (message: Message, settingsData: {prefix: string;}) => {
        const embed = new BediEmbed()
                          .setColor(colors.ERROR)
                          .setTitle('Get Birthdays Reply')
                          .setDescription(
                              `Invalid Syntax!\n\nMake sure your command is in the format ${
                                  Formatters.inlineCode(settingsData.prefix + 'getbirthdays <month>')}`,
                          );
        return message.channel.send({embeds: [embed]});
};