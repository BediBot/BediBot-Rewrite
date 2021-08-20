import {Args, CommandStore, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {getSettings} from '../../database/models/SettingsModel';

const {Command} = require('@sapphire/framework');

module.exports = class HelpCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'help',
      description: 'Shows helpful information about commands',
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;
    const settingsData = await getSettings(guildId as string);

    const selectedCommand = await args.pickResult('string');

    const embed = new BediEmbed();

    if (!selectedCommand.success || !this.store.has(selectedCommand.value.toLowerCase())) {
      embed.setTitle('Help Reply')
           .setDescription(
               `To get more detailed information about a command, type ${surroundStringWithBackTick(`${settingsData.prefix}help <commandName>`)}`);

      for (const category of this.categories) {
        let fieldValue = '';

        for (const command of this.store as CommandStore) {
          if (command[1].category === category) fieldValue += `${surroundStringWithBackTick(command[1]?.name)} `;
        }

        embed.addField(category, fieldValue, false);
      }
    } else {
      const command = this.store.get(selectedCommand.value.toLowerCase());

      embed.setTitle(`Help Reply - ${settingsData.prefix}${command.name} command`)
           .setDescription(command.description);

      embed.addField('Category', command.category, false);
      if (command.detailedDescription) embed.addField('Detailed Description', command.detailedDescription, false);
      if (command.aliases) {
        let aliasString = '';

        for (const alias of command.aliases) {
          aliasString += `${surroundStringWithBackTick(`${settingsData.prefix}${alias}`)} `;
        }

        embed.addField('Aliases', aliasString, false);
      }
    }

    return message.reply({
      embeds: [embed],
    });
  }
};