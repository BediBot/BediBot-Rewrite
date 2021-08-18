import logger from './loggerUtil';

import Agenda from 'agenda/dist/index';

const humanInterval = require('human-interval');

export const agenda = new Agenda();

export const startAgenda = async () => {
  agenda.database(process.env.MONGO_URI as string);
  await agenda.start();
  logger.info('Agenda Started!');

  agenda.on('start', (job) => {
    logger.info(`Job ${job.attrs.name} started`);
  });

  agenda.on('success', (job) => {
    logger.info(`Job ${job.attrs.name} succeeded`);
  });

  agenda.on('fail', (err, job) => {
    logger.error(`Job ${job.attrs.name} failed with error: ${err.message}`);
  });
};

export const isValidDurationOrTime = (string: string) => {
  if (string.length === 0) return false;
  const re12 = /((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/;
  const re12Short = /(1[0-2]|0?[1-9] ?([AaPp][Mm]))/;
  const re24 = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  if (re12.test(string) || re24.test(string) || re12Short.test(string)) return true;
  return !isNaN(humanInterval(string).valueOf());
};