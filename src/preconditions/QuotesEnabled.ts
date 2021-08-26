import {Precondition} from '@sapphire/framework';
import {Message} from 'discord.js';
import {getSettings} from '../database/models/SettingsModel';

export class QuotesEnabledPrecondition extends Precondition {
  public async run(message: Message) {
	const {guildId, author} = message;

	const settingsData = await getSettings(guildId as string);

	if (settingsData.quotesEnabled) return this.ok();
	return this.error({message: 'Quotes are not enabled on this server!'});
  }
}