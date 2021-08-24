import {Args, PieceContext, Result, UserError} from '@sapphire/framework';
import {Interaction, Message, MessageActionRow, MessageButton, Snowflake, User} from 'discord.js';
import {getSettings} from '../../database/models/SettingsModel';
import {BediEmbed} from '../../lib/BediEmbed';
import colors from '../../utils/colorUtil';
import {surroundStringWithBackTick} from '../../utils/discordUtil';
import {addQuote} from '../../database/models/QuoteModel';

const {Command} = require('@sapphire/framework');

export const QUOTE_MAX_LENGTH = 1000;
const TITLE_BEFORE_NUM_APPROVALS = 'Add Quote Reply - Approvals: ';

module.exports = class AddQuoteCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'addQuote',
      aliases: ['aq', 'addq', 'aquote'],
      description: 'Adds a quote from an individual of your choice.',
      preconditions: ['GuildOnly', 'QuotesEnabled'],
      detailedDescription: `${'addQuote <quote> <author>`'}
      This command supports both regular names as well as mention's for the author parameter.`,
    });
  }

  async run(message: Message, args: Args) {
    const {guild, guildId, author} = message;
    const settingsData = await getSettings(guildId as string);

    let quote: string | Result<string, UserError>;
    let quoteAuthor: Result<string, UserError> | Result<User, UserError>;

    if (message.reference) {
      //This implies that this is a reply
      quote = (await message.channel.messages.fetch(message.reference.messageId as Snowflake)).content;
      if(quote.length === 0) 
      {
        const embed = new BediEmbed()
        .setColor(colors.ERROR)
        .setTitle('Add Quote Reply')
        .setDescription(`Please ensure that the message you're replying to contains text content (i.e. No embeds)`);
       return message.reply({embeds: [embed]});
      }
      quoteAuthor = await args.pickResult('user');
      if (!quoteAuthor.success) quoteAuthor = await args.pickResult('string');

      if (!quoteAuthor.success){
        const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Add Quote Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${surroundStringWithBackTick(
              settingsData.prefix + 'addquote <author>')}`);
        return message.reply({embeds: [embed]});
      }
    } else {
      quote = await args.pickResult('string');
      quoteAuthor = await args.pickResult('user');
      if (!quoteAuthor.success) quoteAuthor = await args.pickResult('string');

      if (!quote.success || !quoteAuthor.success)
      {
        const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Add Quote Reply')
          .setDescription(`Invalid Syntax!\n\nMake sure your command is in the format ${surroundStringWithBackTick(
              settingsData.prefix + 'addquote <quote> <author>')}`);
        return message.reply({embeds: [embed]});
      }
      quote = quote.value;
    }

    if (quote.length > QUOTE_MAX_LENGTH) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Add Quote Reply')
          .setDescription('Quote is too long! Please submit a quote that is 1000 characters or fewer.');
      return message.reply({embeds: [embed]});
    }
    const embed = new BediEmbed()
        .setTitle(`${TITLE_BEFORE_NUM_APPROVALS}0/${settingsData.quoteApprovalsRequired}`);

    const date = new Date(Date.now());

    if (typeof quoteAuthor.value === 'string') {
      embed.setDescription(`Quote: ${surroundStringWithBackTick(quote)}
        Author: ${surroundStringWithBackTick(quoteAuthor.value as string)}
        Date: ${surroundStringWithBackTick(date.toLocaleDateString('en-US', {timeZone: settingsData.timezone, dateStyle: 'long'}))}
        Submitted By: ${author}
        Approved By:`);
    } else {
      embed.setDescription(`Quote: ${surroundStringWithBackTick(quote)}
        Author (Mention): ${quoteAuthor.value}
        Date: ${surroundStringWithBackTick(date.toLocaleDateString('en-US', {timeZone: settingsData.timezone, dateStyle: 'long'}))}
        Submitted By: ${author}
        Approved By:`);
    }

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

  // This function is called when the command is added to the command store. It is a useful place to add the listener for the button interactions.
  async onLoad() {
    super.onLoad();

    this.container.client.on('interactionCreate', async (interaction: Interaction) => {
      if (!interaction.isButton() || interaction.customId != 'QuoteApprove') return;

      await interaction.deferUpdate();

      const message = interaction.message;
      if (!(message instanceof Message)) return;

      let description = message.embeds[0].description;

      if (description?.includes(interaction.user.toString())) return;

      const title = message.embeds[0].title;

      let numApprovals = parseInt(title?.substring(TITLE_BEFORE_NUM_APPROVALS.length, title.indexOf('/')) as string, 10);
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

        let author: string;

        if (description?.includes('Author (Mention)')) {
          author = description?.substring(description?.indexOf('<'), description?.indexOf('>') + 1) as string;
        } else {
          const authorIndex = (description?.indexOf('Author: `') as number) + 'Author: `'.length;
          author = description?.substring(authorIndex, description?.indexOf('`', authorIndex + 1)) as string;
        }

        const dateIndex = (description?.indexOf('Date: `') as number) + 'Date: `'.length;
        const date = new Date(Date.parse(description?.substring(dateIndex, description?.indexOf('`', dateIndex + 1)) as string));

        await addQuote(interaction.guildId as string, quote as string, author, date);

        await message.edit({
          embeds: [embed],
          components: [],
        });
      }
    });
  }
};

/**
 * Replies with the invalid syntax message - This function is purely to avoid repeated code
 * @param message
 * @param settingsData
 * @returns {Promise<Message>}
 */
const invalidSyntaxReply = async (message: Message, settingsData: { prefix: string; }) => {

};