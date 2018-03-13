import * as logger from './logger';

const debug = require('debug')('metrics');

const globalTags = {
  acct: process.env.ACCOUNT_NAME || 'dev',
  // account: process.env.ACCOUNT_NAME || 'dev',
  region: process.env.AWS_REGION || 'us-east-1',
};

/* istanbul ignore next */
if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  globalTags['functionname'] = process.env.AWS_LAMBDA_FUNCTION_NAME;
}
/* istanbul ignore next */
if (process.env.SERVERLESS_STAGE) {
  globalTags['stage'] = process.env.SERVERLESS_STAGE;
}
/* istanbul ignore next */
if (process.env.SERVERLESS_PROJECT) {
  globalTags['service'] = process.env.SERVERLESS_PROJECT;
}
/* istanbul ignore next */
if (process.env.SERVERLESS_STAGE && process.env.SERVERLESS_PROJECT) {
  globalTags['apiname'] = `${process.env.SERVERLESS_STAGE}-${process.env.SERVERLESS_PROJECT}`;
}
/* istanbul ignore next */
if (process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE) {
  globalTags['memorysize'] = process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE;
}

export const init = (tags: { [key: string]: any } = {}) => {
  Object.assign(globalTags, tags);
  debug('init(%j), enabled: %s', globalTags, process.env.AWS_LAMBDA_LOG_GROUP_NAME !== undefined);
  return globalTags;
};

export const gauge = (key: string, value: number, tags: { [key: string]: any } = {}) => {
  log('gauge', key, value, tags);
};

export const count = (key: string, value: number = 1, tags: { [key: string]: any } = {}) => {
  log('count', key, value, tags);
};

export const histogram = (key: string, value: number = 1, tags: { [key: string]: any } = {}) => {
  log('histogram', key, value, tags);
};

// 0=ok, 1=warning, 2=critical, 3=unknown
export const check = (key: string, value: number = 0, tags: { [key: string]: any } = {}) => {
  log('check', key, value, tags);
};

export const error = (keyPrefix: string, err: any) => {
  logger.err(err);
  count(`${keyPrefix}.error.count`, 1, { type: (err instanceof Error) ? err.name : 'string' });
};

const log = (type: string, key: string, value: number, tags: { [key: string]: any }) => {
  const allTags = Object.assign({}, tags, globalTags);
  const timestamp = Math.floor(Date.now() / 1000); // unix format
  logger.log(timestamp, type, key, value, allTags);
};
