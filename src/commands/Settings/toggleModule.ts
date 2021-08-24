import {Args, PieceContext} from '@sapphire/framework';
import {Message, MessageActionRow, MessageButton, MessageSelectMenu} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import settingsModel from '../../database/models/SettingsModel';
import logger from '../../utils/loggerUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import colors from '../../utils/colorUtil';

const {Command} = require('@sapphire/framework');

module.exports = class SettingsCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'togglemodule',
      aliases: ['tm', 'toggleModules'],
      description: 'Allows you to enable or disable BediBot modules',
      preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
      detailedDescription: `${'toggleModule`'}`,
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;

    const selectRow = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('moduleSelect')
                .setPlaceholder('Select a Module')
                .addOptions([
                  {
                    label: 'Pins',
                    description: 'Reacting with the Pin Emoji to Pin a Message',
                    value: 'Pins',
                  },
                  {
                    label: 'Quotes',
                    description: 'Saving funny and/or interesting quotes',
                    value: 'Quotes',
                  },
                  {
                    label: 'Due Dates',
                    description: 'Save upcoming due dates and display them on a message board',
                    value: 'Due Dates',
                  },
                  {
                    label: 'Verification',
                    description: 'Enforce verification under a specific email domain',
                    value: 'Verification',
                  },
                ]),
        );

    const buttonRow = new MessageActionRow()
        .addComponents([
          new MessageButton()
              .setCustomId('moduleEnable')
              .setLabel('Enable')
              .setStyle('SUCCESS'),
          new MessageButton()
              .setCustomId('moduleDisable')
              .setLabel('Disable')
              .setStyle('DANGER'),
        ]);

    const embed = new BediEmbed()
        .setTitle('Toggle Modules Reply')
        .setDescription('Select a module and then choose to enable or disable');

    const reply = await message.reply({
      embeds: [embed],
      components: [selectRow, buttonRow],
    });

    let module: string | null = null;

    const selectCollector = reply.createMessageComponentCollector({componentType: 'SELECT_MENU', time: 60000});
    selectCollector.on('collect', async interaction => {
      if (!interaction.isSelectMenu()) return;
      if (interaction.user.id != message.author.id) {
        const embed = new BediEmbed()
            .setTitle('Toggle Module Reply')
            .setColor(colors.ERROR)
            .setDescription('You did not run this command');

        return interaction.reply({
          ephemeral: true,
          embeds: [embed],
        });
      }
      await interaction.deferUpdate();
      module = interaction.values[0];
    });

    selectCollector.on('end', async collected => {
      await reply.edit({
        embeds: [embed],
        components: [],
      });
    });

    const buttonCollector = reply.createMessageComponentCollector({componentType: 'BUTTON', time: 60000});
    buttonCollector.on('collect', async interaction => {
      if (!interaction.isButton()) return;
      if (interaction.user.id != message.author.id) {
        const embed = new BediEmbed()
            .setTitle('Add Due Date Reply')
            .setColor(colors.ERROR)
            .setDescription('You did not run this command');

        return interaction.reply({
          ephemeral: true,
          embeds: [embed],
        });
      }
      if (!module) {
        const embed = new BediEmbed()
            .setTitle('Toggle Modules Reply')
            .setDescription('Please select a module first');

        return interaction.reply({
          ephemeral: true,
          embeds: [embed],
        });
      }

      const toggleValue = interaction.customId === 'moduleEnable';

      switch (module) {
        case 'Pins':
          await settingsModel.updateOne({_id: guildId as string}, {pinsEnabled: toggleValue});
          break;
        case 'Quotes':
          await settingsModel.updateOne({_id: guildId as string}, {quotesEnabled: toggleValue});
          break;
        case 'Due Dates':
          await settingsModel.updateOne({_id: guildId as string}, {dueDatesEnabled: toggleValue});
          break;
        case 'Verification':
          await settingsModel.updateOne({_id: guildId as string}, {verificationEnabled: toggleValue});
          break;
        default:
          logger.error('Something went wrong with toggleModule. This should be unreachable.');
      }

      const embed = new BediEmbed()
          .setTitle('Toggle Modules Reply');

      if (toggleValue) embed.setColor('GREEN').setDescription(`The ${surroundStringWithBackTick(module)} module has been enabled`);
      else embed.setColor('RED').setDescription(`The ${surroundStringWithBackTick(module)} module has been disabled`);

      return interaction.reply({
        ephemeral: true,
        embeds: [embed],
      });
    });
  }
};