import {model, Schema} from 'mongoose';
import moment from 'moment-timezone/moment-timezone-utils';

interface DueDateI {
  guildId: string,
  title: string,
  dateTime: Date,
  type: string,
  stream: string,
  course: string,
  dateOnly: boolean,
}

export const DueDate = new Schema({
  guildId: String,
  title: String,
  dateTime: Date,
  type: String,
  stream: String,
  course: String,
  dateOnly: Boolean,
});

const dueDateModel = model<DueDateI>('DueDate', DueDate, 'DueDates');

/**
 * Adds a due date
 * @param guildId
 * @param title
 * @param dateTime
 * @param type
 * @param stream
 * @param course
 * @returns {Promise<void>}
 */
export const addDueDate = async (guildId: string, title: string, dateTime: Date, type: string, stream: string, course: string, dateOnly: boolean) => {
  await dueDateModel.create({
    guildId: guildId,
    title: title,
    dateTime: dateTime,
    type: type,
    stream: stream,
    course: course,
    dateOnly: dateOnly,
  });
};

export const removeOldDueDates = async (guildId: string) => {
  await dueDateModel.deleteMany({dateTime: {$lte: moment().toDate()}});
};

export default dueDateModel;