import {Precondition} from '@sapphire/framework';
import {Message, Permissions} from 'discord.js';

export default class AdminPrecondition extends Precondition {
  public run(message: Message) {
    if (message.guild && message.member!.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return this.ok();
    return this.error({message: 'Only an admin is allowed to execute this command.'});
  }
}