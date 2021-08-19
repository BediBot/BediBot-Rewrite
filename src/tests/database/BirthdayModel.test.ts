import mongoose from 'mongoose';
import birthdayModel, {getBirthdaysFromMonth, getBirthdaysToday, updateBirthday} from '../../database/models/BirthdayModel';
import logger from '../../utils/loggerUtil';

describe('Birthday DB', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL + 'Birthdays' as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('updateBirthday', async () => {
    const userId = 'randomID';
    const birthday = new Date();

    expect(await birthdayModel.findById(userId)).toBeNull();

    await updateBirthday(userId, birthday);

    let result = await birthdayModel.findById(userId);
    expect(result?.birthDate.toString()).toBe(birthday.toString());

    birthday.setFullYear(birthday.getFullYear() + 1);

    await updateBirthday(userId, birthday);

    result = await birthdayModel.findById(userId);
    expect(result?.birthDate.toString()).toBe(birthday.toString());
  });

  test('getBirthdaysFromMonth', async () => {
    const userId = 'randomID';
    const userId1 = 'randomID1';
    const userId2 = 'randomID2';
    const birthday = new Date().setDate(1);
    const birthday1 = new Date().setDate(2);
    const birthday2 = new Date().setDate(3);

    await birthdayModel.create({
      _id: userId,
      birthDate: birthday,
    });

    await birthdayModel.create({
      _id: userId2,
      birthDate: birthday2,
    });

    await birthdayModel.create({
      _id: userId1,
      birthDate: birthday1,
    });

    const result = await getBirthdaysFromMonth(new Date().getMonth() + 1);

    expect(result[0]._id).toBe(userId);
    expect(result[0].birthDate.valueOf()).toBe(birthday);
    expect(result[1]._id).toBe(userId1);
    expect(result[1].birthDate.valueOf()).toBe(birthday1);
    expect(result[2]._id).toBe(userId2);
    expect(result[2].birthDate.valueOf()).toBe(birthday2);
  });

  test('getBirthdaysToday', async () => {
    const userId = 'randomID';
    const userId1 = 'randomID1';
    const userId2 = 'randomID2';
    const birthday = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const birthday1 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const birthday2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1);

    await birthdayModel.create({
      _id: userId,
      birthDate: birthday,
    });

    await birthdayModel.create({
      _id: userId2,
      birthDate: birthday2,
    });

    await birthdayModel.create({
      _id: userId1,
      birthDate: birthday1,
    });

    logger.info(await birthdayModel.find());

    const result = await getBirthdaysToday('America/Toronto');

    expect(result.length).toBe(2);
    expect(result[0]._id).toBe(userId);
    expect(result[0].birthDate.valueOf()).toBe(birthday.valueOf());
    expect(result[1]._id).toBe(userId1);
    expect(result[1].birthDate.valueOf()).toBe(birthday1.valueOf());
  });
});