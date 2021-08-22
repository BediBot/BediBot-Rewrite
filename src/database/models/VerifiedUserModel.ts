import {model, Schema} from 'mongoose';
import {getSettings} from './SettingsModel';
import {hashString} from '../../utils/hashUtil';

interface VerifiedUserI {
  userId: string,
  guildId: string,
  emailHash: string,
}

export const VerifiedUser = new Schema({
  userId: String,
  guildId: String,
  emailHash: String,
}, {versionKey: false});

const verifiedUserModel = model<VerifiedUserI>('VerifiedUser', VerifiedUser, 'VerifiedUsers');

/**
 * Checks if a given user is verified in a given guild
 * @param userId
 * @param guildId
 * @returns {Promise<boolean>}
 */
export const userVerifiedInGuild = async (userId: string, guildId: string) => {
  return verifiedUserModel.exists({
    userId: userId,
    guildId: guildId,
  });
};

/**
 * Checks if a given user is verified anywhere and if so, returns their hashed email, otherwise returns null
 * @param userId
 * @param guildId
 * @returns {Promise<any>}
 */
export const userVerifiedAnywhereEmailHash = async (userId: string, guildId: string) => {
  const docs = await verifiedUserModel.find({userId: userId});
  for (const doc of docs) {
    const origSettingsData = await getSettings(guildId);
    const otherSettingsData = await getSettings(guildId);

    if (origSettingsData.emailDomain === otherSettingsData.emailDomain) {
      return doc.emailHash;
    }
  }
  return null;
};

/**
 * Adds a new verified user
 * @param userId
 * @param guildId
 * @param emailHash
 * @returns {Promise<void>}
 */
export const addVerifiedUser = async (userId: string, guildId: string, emailHash: string) => {
  await verifiedUserModel.create({
    userId: userId,
    guildId: guildId,
    emailHash: emailHash,
  });
};

/**
 * Removes a verified user from the database
 * @param userId
 * @param guildId
 * @returns {Promise<void>}
 */
export const removeVerifiedUser = async (userId: string, guildId: string) => {
  await verifiedUserModel.deleteOne({
    userId: userId,
    guildId: guildId,
  });
};

/**
 * Checks if an email address is linked to a user in the given guild
 * @param emailAddress
 * @param guildId
 * @returns {Promise<boolean>}
 */
export const emailAddressLinkedToUser = async (emailAddress: string, guildId: string) => {
  const docs = await verifiedUserModel.find({guildId: guildId});

  for (const doc of docs) {
    const emailHash = await hashString(emailAddress.substring(0, emailAddress.indexOf('@')));

    if (emailHash === doc.emailHash) return true;
  }
  return false;
};

export default verifiedUserModel;