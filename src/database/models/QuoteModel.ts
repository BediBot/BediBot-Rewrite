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

export default quoteModel;