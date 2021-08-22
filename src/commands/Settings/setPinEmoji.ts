import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import settingsModel, {getSettings} from '../../database/models/SettingsModel';

const {Command} = require('@sapphire/framework');

module.exports = class SetPinEmojiCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'setPinEmoji',
      aliases: ['spe'],
      description: 'Changes the pin emoji for BediBot',
      preconditions: ['GuildOnly', ['BotOwnerOnly', 'AdminOnly']],
      detailedDescription: `${'setPinEmoji <:emoji:>`'}`,
    });
  }

  async run(message: Message, args: Args) {
    const {guildId} = message;
    const settingsData = await getSettings(guildId as string);

    // Check if they even inputted a string
    const newValue = await args.peekResult('string');
    if (!newValue.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Set Pin Emoji Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format 
          ${surroundStringWithBackTick(settingsData.prefix + 'setPinEmoji <:emoji:>')}`);
      return message.reply({embeds: [embed]});
    }

    await settingsModel.updateOne({_id: guildId as string}, {pinEmoji: newValue.value});

    const embed = new BediEmbed()
        .setTitle('Set Pin Emoji Reply')
        .setDescription(`The pin emoji has been updated to ${newValue.value}`);
    return message.reply({embeds: [embed]});
  };
};

const isEmojiString = (emoji: string) => {
  return emoji.startsWith(':') && emoji.endsWith(':');
};