import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import {getSettings} from '../../database/settingsDB';
import {capFirstLetterEveryWord} from '../../utils/stringsUtil';
import {listModulesString, validModule} from '../../utils/settingsUtil';

const {Command} = require('@sapphire/framework');

module.exports = class SettingsCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'settings',
      aliases: ['setting'],
      description: 'Displays the current guild settings',
    });
  }

  async run(message: Message, args: Args) {
    const {guild, guildId} = message;

    if (!guild) {
      const embed = new BediEmbed()
          .setColor('RED')
          .setTitle('Settings Reply')
          .setDescription('This command is only for guilds!');

      return message.reply({
        embeds: [embed],
      });
    }

    let settingsData = await getSettings(guildId as string);

    const module = await args.restResult('string');

    const embed = new BediEmbed()
        .setColor('BLUE')
        .setTitle('Settings Reply');

    if (!module.success || !validModule(module.value)) {
      embed.setDescription('Run `' + settingsData.prefix + 'settings <module>' + '` to see more detailed settings' +
          '\nModules: ' + listModulesString() +
          '\n\nHere are the settings for `' + guild.name + '`')
           .addField('Prefix', '`' + settingsData.prefix + '`', false)
           .addField('Timezone', '`' + settingsData.timezone + '`', false)
           .addField('Pins Enabled', '`' + settingsData.pinsEnabled + '`', false);

    } else {
      embed.setDescription('Here are the settings for the `' + capFirstLetterEveryWord(module.value) + '` module');

      // Add settings to the cases below as they are implemented
      switch (module.value.toLowerCase()) {
        case 'verification':
          embed.addField('Verification Enabled', '`' + settingsData.verificationEnabled + '`', false);
          break;
        case 'birthdays':
          embed.addField('Birthday Announcements Enabled', '`' + settingsData.birthdayAnnouncementsEnabled + '`', false);
          break;
        case 'announcements':
          embed.addField('Morning Announcements Enabled', '`' + settingsData.morningAnnouncementsEnabled + '`', false);
          break;
        case 'due dates':
          embed.addField('Due Dates Enabled', '`' + settingsData.dueDatesEnabled + '`', false);
          break;
        case 'quotes':
          embed.addField('Quotes Enabled', '`' + settingsData.quotesEnabled + '`', false);
          break;
      }
    }

    return message.reply({
      embeds: [embed],
    });
  }
};