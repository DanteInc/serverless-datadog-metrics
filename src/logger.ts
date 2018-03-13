export const format = (timestamp: number, type: string, key: string,
                       value: number, tags: { [key: string]: any }) => {
  const flattenedTags = Object.keys(tags).reduce(
    (t, key) => {
      t.push(`${key}:${tags[key]}`);
      return t;
    },
    []).join(',');

  return `MONITORING|${timestamp}|${value}|${type}|${key}|#${flattenedTags}`;
};

export const log = (timestamp: number, type: string, key: string,
                    value: number, tags: { [key: string]: any }) => {
  if (process.env.AWS_LAMBDA_LOG_GROUP_NAME) {
    console.log(format(timestamp, type, key, value, tags));
  }
};

export const err = (err: any) => {
  if (process.env.AWS_LAMBDA_LOG_GROUP_NAME) {
    if (err instanceof Error) {
      console.error(JSON.stringify({
        errorMessage: err.message,
        errorType: err.name,
        handled: err['uow'] !== undefined,
        stackTrace: err.stack,
      }));
    } else {
      console.error(err);
    }
  }
};

export const enable = () => {
  // enable/disable are just for testing
  // this will be enabled by default in lambda runtime env
  // because this env var will be set
  process.env.AWS_LAMBDA_LOG_GROUP_NAME = '/aws/lambda/MyFunction';
};

export const disable = () => {
  delete process.env.AWS_LAMBDA_LOG_GROUP_NAME;
};
