import {Args, CommandStore, PieceContext, PreconditionContainerArray} from '@sapphire/framework';
import {Formatters, Message, MessageActionRow, MessageSelectMenu, Permissions} from 'discord.js';

import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {fetchPrefix} from '../../utils/discordUtil';

const {Command} = require('@sapphire/framework');
const DEFAULT_PAGE = 'General';

module.exports = class HelpCommand extends Command {
        constructor(context: PieceContext) {
                super(context, {
                        name: 'help',
                        description: 'Shows helpful information about commands',
                        detailedDescription: 'help`',
                });
        }

        async run(message: Message, args: Args) {
                const prefix = (await fetchPrefix(message))[0];

                const selectedCommand = await args.pickResult('string');

                if (!selectedCommand.success || !this.store.has(selectedCommand.value.toLowerCase())) {
                        const helpPages = new Map();

                        const selectMenu = new MessageSelectMenu().setCustomId('helpSelect').setPlaceholder('Select a Category');

                        for (const category of this.categories) {
                                const embed = new BediEmbed()
                                                  .setTitle('Help Reply - ' + category)
                                                  .setDescription(`To get more detailed information about a command, type ${
                                                      Formatters.inlineCode(`${prefix}help <commandName>`)}`);

                                let fieldValue = '';

                                for (const command of this.store as CommandStore) {
                                        let skip = false;
                                        if (message.guild && !message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                                                for (const preconditionContainer of command[1].preconditions.entries) {
                                                        if (preconditionContainer instanceof PreconditionContainerArray &&
                                                            preconditionContainer.entries.find(
                                                                (precondition: any) => precondition.name === 'AdminOnly'))
                                                                skip = true;
                                                }
                                        }

                                        if (skip) continue;

                                        if (command[1].category === category)
                                                embed.addField(`${prefix}${command[1].name}`, command[1].description, false);
                                }
                                if (embed.fields.length === 0) continue;

                                selectMenu.addOptions([
                                        {
                                                label: category,
                                                value: category,
                                        },
                                ]);
                                helpPages.set(category, embed);
                        }

                        const selectRow = new MessageActionRow().addComponents(selectMenu);

                        if (message.guild) {
                                const serverReplyEmbed = new BediEmbed()
                                                             .setTitle('Help Reply')
                                                             .setDescription('A list of commands has been sent to you via DM.');
                                await message.reply({embeds: [serverReplyEmbed]});
                        }

                        const helpMessage = await message.author.send({
                                embeds: [helpPages.get(DEFAULT_PAGE)],
                                components: [selectRow],
                        });

                        const selectCollector =
                            helpMessage.createMessageComponentCollector({componentType: 'SELECT_MENU', time: 60000});
                        selectCollector.on('collect', async interaction => {
                                if (!interaction.isSelectMenu()) return;
                                if (interaction.user.id != message.author.id) {
                                        const embed = new BediEmbed()
                                                          .setTitle('Help Reply')
                                                          .setColor(colors.ERROR)
                                                          .setDescription('You did not run this command');

                                        return interaction.reply({
                                                ephemeral: true,
                                                embeds: [embed],
                                        });
                                }
                                await interaction.deferUpdate();

                                await helpMessage.edit({
                                        embeds: [helpPages.get(interaction.values[0])],
                                });
                        });

                        selectCollector.on('end', async collected => {
                                await helpMessage.edit({
                                        components: [],
                                });
                        });

                } else {
                        const command = this.store.get(selectedCommand.value.toLowerCase());

                        const embed = new BediEmbed()
                                          .setTitle(`Help Reply - ${prefix}${command.name} command`)
                                          .setDescription(command.description);

                        embed.addField('Category', command.category, false);

                        if (command.detailedDescription)
                                embed.addField('Detailed Description', 'Usage: `' + prefix + command.detailedDescription, false);

                        let aliasString = '';

                        for (const alias of command.aliases) {
                                aliasString += `${Formatters.inlineCode(`${prefix}${alias}`)} `;
                        }

                        if (aliasString.length != 0) embed.addField('Aliases', aliasString, false);

                        return message.reply({
                                embeds: [embed],
                        });
                }
        }
};