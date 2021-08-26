import {Args, PieceContext} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';

import settingsModel, {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';

const {Command} = require('@sapphire/framework');

module.exports = class SetTypesCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'setTypes',
      aliases: ['settype'],
      description: 'Changes the due date types for BediBot',
      preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
      detailedDescription: 'setTypes <type> <type:optional> . . .`',
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;
    const settingsData = await getSettings(guildId as string);

    const newValues = await args.repeatResult('string');
    if (!newValues.success) {
      const embed = new BediEmbed()
			.setColor(colors.ERROR)
			.setTitle('Set Types Reply')
			.setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${
			    Formatters.inlineCode(settingsData.prefix + 'setTypes <type> <type:optional> . . .')}`);
      return message.reply({embeds: [embed]});
    }

    if (new Set(newValues.value).size != newValues.value.length) {
      const embed =
	  new BediEmbed().setColor(colors.ERROR).setTitle('Set Types Reply').setDescription('Duplicate values are not allowed.');
      return message.reply({embeds: [embed]});
    }

    await settingsModel.updateOne({_id: guildId as string}, {types: newValues.value});

    let description = 'The due date types have been updated to: ';

    for (const value of newValues.value) { description += `${Formatters.inlineCode(value)} `; }

    const embed = new BediEmbed().setTitle('Set Types Reply').setColor(colors.SUCCESS).setDescription(description);
    return message.reply({embeds: [embed]});
  };
};