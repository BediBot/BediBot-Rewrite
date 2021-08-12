import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import {getSettings} from '../../database/models/SettingsModel';
import {addVerifiedUser, userVerifiedInGuild} from '../../database/models/VerifiedUserModel';
import {
  emailHashFromPendingUser,
  removePendingVerificationUser,
  userPendingVerification,
  validUniqueKey,
} from '../../database/models/PendingVerificationuserModel';
import {addRoleToAuthor} from '../../tests/utils/discordUtil';
import colors from '../../utils/colorUtil';

const {Command} = require('@sapphire/framework');

module.exports = class ConfirmCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'confirm',
      description: 'Allows you to confirm with your unique code to access the server',
    });
  }

  async run(message: Message, args: Args) {
    const {guild, guildId, author} = message;
    const settingsData = await getSettings(guildId as string);

    if (!guild) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Confirm Reply')
          .setDescription('This command is only for guilds!');
      return message.reply({
        embeds: [embed],
      });
    }

    if (!settingsData.verificationEnabled) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Confirm Reply')
          .setDescription('Verification is not enabled on this server!');
      return message.channel.send({
        embeds: [embed],
      });
    }

    if (await userVerifiedInGuild(author.id, guildId as string)) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Confirm Reply')
          .setDescription(`You are already verified! Run ${settingsData.prefix}unverify if necessary.`);
      return message.channel.send({
        embeds: [embed],
      });
    }

    if (!await userPendingVerification(author.id, guildId as string)) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Confirm Reply')
          .setDescription('You have not run `' + settingsData.prefix + 'verify <emailAddress>` yet!');
      return message.channel.send({
        embeds: [embed],
      });
    }

    const uniqueKey = await args.pickResult('string');
    if (!uniqueKey.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Confirm Reply')
          .setDescription('Invalid Syntax!\n\nMake sure your command is in the format `' + settingsData.prefix + 'confirm <uniqueKey>`');
      return message.channel.send({
        embeds: [embed],
      });
    }

    if (!(await validUniqueKey(author.id, guildId as string, uniqueKey.value))) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Confirm Reply')
          .setDescription('Invalid key!');
      return message.channel.send({
        embeds: [embed],
      });
    }

    await addRoleToAuthor(message, settingsData.verifiedRole);
    await addVerifiedUser(author.id, guildId as string, await emailHashFromPendingUser(author.id, guildId as string));
    await removePendingVerificationUser(author.id, guildId as string);
    const embed = new BediEmbed()
        .setColor(colors.PRIMARY)
        .setTitle('Confirm Reply')
        .setDescription('You have been verified on `' + guild.name + '`');
    return message.author.send({
      embeds: [embed],
    });
  }
};