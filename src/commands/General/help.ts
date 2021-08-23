import {Args, CommandStore, PieceContext, PreconditionContainerArray} from '@sapphire/framework';
import {Message, Permissions} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import {fetchPrefix, surroundStringWithBackTick} from '../../utils/discordUtil';
import logger from '../../utils/loggerUtil';

const {Command} = require('@sapphire/framework');

module.exports = class HelpCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'help',
      description: 'Shows helpful information about commands',
      detailedDescription: `${'help`'}`,
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;
    const prefix = (await fetchPrefix(message))[0];

    const selectedCommand = await args.pickResult('string');

    const embed = new BediEmbed();

    if (!selectedCommand.success || !this.store.has(selectedCommand.value.toLowerCase())) {
      embed.setTitle('Help Reply')
           .setDescription(
               `To get more detailed information about a command, type ${surroundStringWithBackTick(`${prefix}help <commandName>`)}`);

      for (const category of this.categories) {
        let fieldValue = '';

        for (const command of this.store as CommandStore) {
          let skip = false;
          if (message.guild && !message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            for (const preconditionContainer of command[1].preconditions.entries) {
              if (preconditionContainer instanceof PreconditionContainerArray &&
                  preconditionContainer.entries.find((precondition: any) => precondition.name === 'AdminOnly')) skip = true;
            }
          }

          if (skip) continue;

          if (command[1].category === category) fieldValue += `${surroundStringWithBackTick(command[1]?.name)} `;
        }
        if (fieldValue.length === 0) continue;

        embed.addField(category, fieldValue, false);
      }
    } else {
      const command = this.store.get(selectedCommand.value.toLowerCase());

      embed.setTitle(`Help Reply - ${prefix}${command.name} command`)
           .setDescription(command.description);

      embed.addField('Category', command.category, false);

      if (command.detailedDescription) embed.addField('Detailed Description',
          'Usage: `' + prefix + command.detailedDescription, false);

      let aliasString = '';

      for (const alias of command.aliases) {
        logger.info('this happened');
        aliasString += `${surroundStringWithBackTick(`${prefix}${alias}`)} `;
      }

      if (aliasString.length != 0) embed.addField('Aliases', aliasString, false);
    }

    return message.reply({
      embeds: [embed],
    });
  }
};