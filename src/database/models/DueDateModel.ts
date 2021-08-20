import {model, Schema} from 'mongoose';

interface DueDateI {
  guildId: string,
  title: string,
  dateTime: Date,
  type: string,
  stream: string,
  course: string,
}

export const DueDate = new Schema({
  guildId: String,
  title: String,
  dateTime: Date,
  type: String,
  stream: String,
  course: String,
});

const dueDateModel = model<DueDateI>('DueDate', DueDate, 'DueDates');

export const addDueDate = async (guildId: string, title: string, dateTime: Date, type: string, stream: string, course: string) => {
  await dueDateModel.create({
    guildId: guildId,
    title: title,
    dateTime: dateTime,
    type: type,
    stream: stream,
    course: course,
  });
};

export default dueDateModel;