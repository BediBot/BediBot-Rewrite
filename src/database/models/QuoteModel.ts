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
 * Gets a random quote from the specified guild
 * @param guildId
 * @returns {Promise<Query<(QuoteI & Document<any, any, QuoteI>) | null, QuoteI & Document<any, any, QuoteI>, {}, QuoteI>>}
 */
export const getRandomQuote = async (guildId: string) => {
  const random = Math.floor(Math.random() * (await quoteModel.countDocuments()));

  return quoteModel.findOne().skip(random);
};

/**
 * Gets a random quote from the specified guild and author
 * @param guildId
 * @param author
 * @returns {Promise<Query<(QuoteI & Document<any, any, QuoteI>) | null, QuoteI & Document<any, any, QuoteI>, {}, QuoteI>>}
 */
export const getRandomQuoteFromAuthor = async (guildId: string, author: string) => {
  const random = Math.floor(Math.random() * (await quoteModel.find({author: author}).countDocuments()));

  return quoteModel.findOne({author: author}).skip(random);
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