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

export default quoteModel;