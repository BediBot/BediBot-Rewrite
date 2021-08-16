import {model, Schema} from 'mongoose';

interface QuoteI {
  guildId: string,
  quote: string,
  author: string,
  date: Date,
}

export const Quote = new Schema({
  guildId: String,
  quote: String,
  author: String,
  date: Date,
});

const quoteModel = model<QuoteI>('Quote', Quote, 'Quotes');

export const addQuote = async (guildId: string, quote: string, author: string, date: Date) => {
  await quoteModel.create({
    guildId: guildId,
    quote: quote,
    author: author,
    date: date,
  });
};

export const removeQuote = async (guildId: string, quote: string, author: string) => {
  return quoteModel.findOneAndDelete({
    guildId: guildId,
    quote: quote,
    author: author,
  });
};

/**
 * Gets all the quotes from a specified author in a specified guild
 * @param guildId
 * @param author
 * @returns {Promise<Query<Array<EnforceDocument<QuoteI, {}>>, QuoteI & Document<any, any, QuoteI>, {}, QuoteI>>}
 */
export const getQuotesFromAuthor = async (guildId: string, author: string) => {
  return quoteModel.find({
    guildId: guildId,
    author: {
      $regex: new RegExp(`^${author}$`, 'i'),
    },
  });
};

export default quoteModel;