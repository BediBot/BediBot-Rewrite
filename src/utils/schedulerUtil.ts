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

export const isValidDuration = (string: string) => {
  if (string.length === 0) return false;
  return !isNaN(humanInterval(string).valueOf());
};