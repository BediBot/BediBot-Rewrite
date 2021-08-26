import {Events, Listener, PieceContext} from '@sapphire/framework';
import {Formatters, Guild} from 'discord.js';

import settingsModel, {getSettings} from '../database/models/SettingsModel';
import {BediEmbed} from '../lib/BediEmbed';
import colors from '../utils/colorUtil';

module.exports = class GuildCreateListener extends Listener {
  constructor(context: PieceContext) {
    super(context, {
      event: Events.GuildCreate,
    });
  }

  public async run(guild: Guild) {
    let channel = guild.systemChannel;

    await settingsModel.deleteOne({_id: guild.id});  // This will delete existing settings data
    const settingsData = await getSettings(guild.id as string);

    const embed =
	new BediEmbed()
	    .setTitle('BediBot has entered the server!')
	    .setColor(colors.PRIMARY)
	    .addField(
		'List of commands', `Run ${Formatters.inlineCode(settingsData.prefix + 'help')} to see the list of commands`)
	    .addField(
		'How to view settings',
		`Run ${Formatters.inlineCode(settingsData.prefix + 'settings')} to see the various settings that can be changed.`)
	    .addField(
		'Due Dates',
		`To set up due dates, first set up due date types, categories, and courses (see ${
		    Formatters.inlineCode(settingsData.prefix + 'help')} for commands).
Then, run ${Formatters.inlineCode(settingsData.prefix + 'displayDueDates <category>')} to display them in a channel.`)
	    .addField(
		'Verification',
		`To set up verification, first set up the email domain and verified role (see ${
		    Formatters.inlineCode(settingsData.prefix + 'help')} for commands).\n` +
		    `Then, run ${Formatters.inlineCode(settingsData.prefix + 'toggleModules')} to enable verification.`)
	    .addField(
		'Morning Announcements',
		`Morning announcements will send a morning message with a random quote from your guild at a set time.\n` +
		    `Run ${
			Formatters.inlineCode(settingsData.prefix + 'morningAnnouncement <time>')} in a channel to set them up.`)
	    .addField(
		'Birthday Announcements',
		`Birthday announcements will send a birthday message containing all the users who have birthdays that day at a set time. ` +
		    `It can also give those users a special role for a day if you choose.\n` +
		    `Run ${
			Formatters.inlineCode(
			    settingsData.prefix + 'birthdayAnnouncement <time> <role:optional>')} in a channel to set them up.`);
    return channel?.send({embeds: [embed]});
  }
};