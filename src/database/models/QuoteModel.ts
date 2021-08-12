import {model, Schema} from 'mongoose';

interface IQuote {
  guildId: string,
  quote: string,
  author: string,
}

export const Quote = new Schema({
  guildId: String,
  quote: String,
  author: String,
});

const quoteModel = model<IQuote>('Quote', Quote, 'Quotes');

export default quoteModel;