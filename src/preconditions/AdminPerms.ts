import {Precondition} from '@sapphire/framework';
import {Message, Permissions} from 'discord.js';

export class AdminPermPrecondition extends Precondition {
  public run(message: Message) {
    if (message.guild && message.guild.me?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) { return this.ok(); }
    return this.error({message: 'BediBot does not have the required permissions: `ADMINISTRATOR`'});
  }
}
