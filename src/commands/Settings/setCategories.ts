import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import settingsModel, {getSettings} from '../../database/models/SettingsModel';

const {Command} = require('@sapphire/framework');

module.exports = class SetCategoriesCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'setCategories',
      aliases: ['setcats', 'setcat'],
      description: 'Changes the due date categories for BediBot',
      preconditions: ['GuildOnly', ['AdminOnly', 'BotOwnerOnly']],
      detailedDescription: `${'setCategories <category> <category:optional> . . .`'}`,
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;
    const settingsData = await getSettings(guildId as string);

    const newValues = await args.repeatResult('string');
    if (!newValues.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Set Categories Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format 
          ${surroundStringWithBackTick(settingsData.prefix + 'setCategories <category> <category:optional> . . .')}`);
      return message.reply({embeds: [embed]});
    }

    if (new Set(newValues.value).size != newValues.value.length) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Set Categories Reply')
          .setDescription('Duplicate values are not allowed.');
      return message.reply({embeds: [embed]});
    }

    await settingsModel.updateOne({_id: guildId as string}, {categories: newValues.value});

    let description = 'The due date categories have been updated to: ';

    for (const value of newValues.value) {
      description += `${surroundStringWithBackTick(value)} `;
    }

    const embed = new BediEmbed()
        .setTitle('Set Categories Reply')
        .setDescription(description);
    return message.reply({embeds: [embed]});
  };
};