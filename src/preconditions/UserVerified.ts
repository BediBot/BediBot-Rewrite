import {Precondition} from '@sapphire/framework';
import {Formatters, Message} from 'discord.js';
import {userVerifiedInGuild} from '../database/models/VerifiedUserModel';
import {getSettings} from '../database/models/SettingsModel';

export class UserVerifiedPrecondition extends Precondition {
  public async run(message: Message) {
    const {guildId, author} = message;

    const settingsData = await getSettings(guildId as string);

    if (!settingsData.verificationEnabled || await userVerifiedInGuild(author.id, guildId as string)) return this.ok();
    return this.error(
        {message: `You are not verified on this server! Run ${Formatters.inlineCode(settingsData.prefix + 'verify <emailAddress>')}`});
  }
}