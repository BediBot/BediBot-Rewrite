import {model, Schema} from 'mongoose';
import {reqDate, reqString} from '../../utils/databaseUtil';

interface QuoteI {
  guildId: string,
  quote: string,
  name: string,
  date: Date,
}

export const Quote = new Schema({
  guildId: reqString,
  quote: reqString,
  name: reqString,
  date: reqDate,
}, {versionKey: false});

const quoteModel = model<QuoteI>('Quote', Quote, 'Quotes');

export const addQuote = async (guildId: string, quote: string, name: string, date: Date) => {
  await quoteModel.create({
    guildId: guildId,
    quote: quote,
    name: name,
    date: date,
  });
};

export const removeQuote = async (guildId: string, quote: string, name: string) => {
  return quoteModel.findOneAndDelete({
    guildId: guildId,
    quote: quote,
    name: name,
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
export const getRandomQuoteFromAuthor = async (guildId: string, name: string) => {
  const random = Math.floor(Math.random() * (await quoteModel.find({name: name}).countDocuments()));

  return quoteModel.findOne({name: name}).skip(random);
};

/**
 * Gets all the quotes from a specified author in a specified guild
 * @param guildId
 * @param author
 * @returns {Promise<Query<Array<EnforceDocument<QuoteI, {}>>, QuoteI & Document<any, any, QuoteI>, {}, QuoteI>>}
 */
export const getQuotesFromAuthor = async (guildId: string, name: string) => {
  return quoteModel.find({
    guildId: guildId,
    name: {
      $regex: new RegExp(`^${name}$`, 'i'),
    },
  });
};

/**
 * Gets all the quotes in a guild
 * @param guildId
 * @returns {Promise<Query<Array<EnforceDocument<QuoteI, {}>>, QuoteI & Document<any, any, QuoteI>, {}, QuoteI>>}
 */
export const getQuotesInGuild = async (guildId: string) => {
  return quoteModel.find({
    guildId: guildId,
  });
};

export default quoteModel;