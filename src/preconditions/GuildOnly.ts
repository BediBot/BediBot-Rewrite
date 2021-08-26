import {Precondition} from '@sapphire/framework';
import {Message} from 'discord.js';

export class GuildPrecondition extends Precondition {
    public run(message: Message) {
        if (message.guild) return this.ok();
        return this.error({message: 'This command can only be used in guilds.'});
    }
}