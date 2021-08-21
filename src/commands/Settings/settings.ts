import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import {capFirstLetterEveryWord} from '../../utils/stringsUtil';
import {listModulesString} from '../../utils/settingsUtil';
import {getSettings} from '../../database/models/SettingsModel';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';

const {Command} = require('@sapphire/framework');

module.exports = class SettingsCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'settings',
      aliases: ['setting'],
      description: 'Displays the current guild settings',
      preconditions: ['GuildOnly', ['AdminOnly', 'BotOwnerOnly']],
      detailedDescription: `${surroundStringWithBackTick(`settings`)}`,
    });
  }

  async run(message: Message, args: Args) {
    const {guild, guildId} = message;

    if (!guild) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Settings Reply')
          .setDescription('This command is only for guilds!');
      return message.reply({embeds: [embed]});
    }

    let settingsData = await getSettings(guildId as string);

    const module = await args.restResult('string');

    const embed = new BediEmbed()
        .setTitle('Settings Reply');

    if (!module.success) {
      embed.setDescription('Run `' + settingsData.prefix + 'settings <module>' + '` to see more detailed settings' +
          '\nModules: ' + listModulesString() +
          '\n\nHere are the settings for `' + guild.name + '`')
           .addField('Prefix', '`' + settingsData.prefix + '`', false)
           .addField('Timezone', '`' + settingsData.timezone + '`', false);
    } else {
      embed.setDescription('Here are the settings for the `' + capFirstLetterEveryWord(module.value) + '` module');

      // Add settings to the cases below as they are implemented
      switch (module.value.toLowerCase()) {
        case 'verification':
          embed.addField('Verification Enabled', '`' + settingsData.verificationEnabled + '`', false)
               .addField('Email Domain', '`' + settingsData.emailDomain + '`', false)
               .addField('Verified Role', '`' + settingsData.verifiedRole + '`', false);
          break;
        case 'due dates':
          embed.addField('Due Dates Enabled', '`' + settingsData.dueDatesEnabled + '`', false)
               .addField('Types', '`' + settingsData.types.join(', ') + '`', false)
               .addField('Categories', '`' + settingsData.categories.join(', ') + '`', false)
               .addField('Courses', '`' + settingsData.courses.join(', ') + '`', false);
          break;
        case 'quotes':
          embed.addField('Quotes Enabled', '`' + settingsData.quotesEnabled + '`', false)
               .addField('Number of Approvals Required to Save', '`' + settingsData.quoteApprovalsRequired + '`', false);
          break;
        case 'pins':
          embed.addField('Pins Enabled', '`' + settingsData.pinsEnabled + '`', false)
               .addField('Pin Emoji', '`' + settingsData.pinEmoji + '`', false);
          break;
        default:
          embed.setColor('RED');
          embed.setDescription('That is not a valid module! Run `' + settingsData.prefix + 'settings` to see a list of valid modules.');
      }
    }

    return message.reply({embeds: [embed]});
  }
};