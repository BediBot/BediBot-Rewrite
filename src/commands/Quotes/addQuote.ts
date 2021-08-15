import {Args, PieceContext, Result, UserError} from '@sapphire/framework';
import {Message, MessageActionRow, MessageButton, Snowflake} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {userVerifiedInGuild} from '../../database/models/VerifiedUserModel';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import logger from '../../utils/loggerUtil';
import {addQuote} from '../../database/models/QuoteModel';
import {client} from '../../index';

const {Command} = require('@sapphire/framework');

const EMBED_FIELD_MAX_CHAR_LENGTH = 1025;

module.exports = class PingCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'addQuote',
      aliases: ['aq'],
      description: 'Adds a quote from an individual of your choice.',
    });
  }

  async run(message: Message, args: Args) {
    const {guild, guildId, author} = message;
    const settingsData = await getSettings(guildId as string);

    if (!settingsData.quotesEnabled) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Add Quote Reply')
          .setDescription('Quotes are not enabled on this server!');
      return message.reply({embeds: [embed]});
    }

    if (settingsData.verificationEnabled && !(await userVerifiedInGuild(author.id, guildId as string))) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Add Quote Reply')
          .setDescription(`You are not verified on this server! Run ${surroundStringWithBackTick(settingsData.prefix + 'verify <emailAddress>')}`);
      return message.reply({embeds: [embed]});
    }
    let quote: string | Result<string, UserError>;
    let quoteAuthor: Result<string, UserError>;

    if (message.reference) {
      quote = (await message.channel.messages.fetch(message.reference.messageId as Snowflake)).content;
      quoteAuthor = await args.pickResult('string');

      if (!quoteAuthor.success) return invalidSyntaxReply(message, settingsData);
    } else {

      quote = await args.pickResult('string');
      quoteAuthor = await args.pickResult('string');

      if (!quote.success || !quoteAuthor.success) return invalidSyntaxReply(message, settingsData);
      quote = quote.value;
    }

    if (quote.length > EMBED_FIELD_MAX_CHAR_LENGTH) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Add Quote Reply')
          .setDescription('Quote is too long! Please submit a quote that is 1024 characters or fewer.');
      return message.reply({embeds: [embed]});
    }

    const embed = new BediEmbed()
        .setTitle(`Add Quote Reply - Approvals: 0/${settingsData.quoteApprovalsRequired}`)
        .setDescription(`Quote: ${surroundStringWithBackTick(quote)}
        Author: ${surroundStringWithBackTick(quoteAuthor.value as string)}
        Submitted By: ${author}
        Approved By:`);

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('QuoteApprove')
                .setLabel('Approve')
                .setStyle('SUCCESS'),
        );

    const response = await message.reply({
      embeds: [embed],
      components: [row],
    });
  }

  async onLoad() {
    client.on('interactionCreate', async interaction => {
      if (!interaction.isButton() || !(interaction.customId === 'QuoteApprove')) return;
      await interaction.deferUpdate();

      const message = interaction.message;
      if (!(message instanceof Message)) return;

      let description = message.embeds[0].description;
      if (description?.includes(interaction.user.toString())) return;

      const title = message.embeds[0].title;
      let numApprovals = parseInt(title?.substring('Add Quote Reply - Approvals: '.length, title.indexOf('/')) as string, 10);
      numApprovals++;
      description += ` ${interaction.user}`;

      const settingsData = await getSettings(interaction.guildId as string);

      if (numApprovals < settingsData.quoteApprovalsRequired) {
        const embed = new BediEmbed()
            .setTitle(`Add Quote Reply - Approvals: ${numApprovals}/${settingsData.quoteApprovalsRequired}`)
            .setDescription(description as string);

        await message.edit({embeds: [embed]});
      } else {
        const embed = new BediEmbed()
            .setTitle('Add Quote Reply - Approved')
            .setDescription(description as string);

        const quote = description?.substring('Quote: `'.length, description?.indexOf('`', 'Quote: `'.length + 1));
        const authorIndex = (description?.indexOf('Author: `') as number) + 'Author: `'.length;
        const author = description?.substring(authorIndex, description?.indexOf('`', authorIndex + 1));

        await addQuote(interaction.guildId as string, quote as string, author as string);

        await message.edit({
          embeds: [embed],
          components: [],
        });
      }
    });
  }
};

const invalidSyntaxReply = async (message: Message, settingsData: { prefix: string; }) => {
  logger.info('this happened');
  const embed = new BediEmbed()
      .setColor(colors.ERROR)
      .setTitle('Add Quote Reply')
      .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${surroundStringWithBackTick(
          settingsData.prefix + 'addquote <quote> <author>')}`);
  return message.reply({embeds: [embed]});
};