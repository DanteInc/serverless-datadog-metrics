import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';

import * as logger from '../src/logger';
import * as metrics from '../src/metrics';

const TIMESTAMP = 1487270789123;
const TIMESTAMP_UNIX = 1487270789;

let sandbox;

describe('metrics.ts', () => {
  before(() => {
    expect(metrics.init()).to.deep.equal({ acct: 'dev', region: 'us-east-1' });
    expect(metrics.init({ test: 'metrics' })).to.deep.equal({
      acct: 'dev',
      region: 'us-east-1',
      test: 'metrics',
    });
  });

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const clock = sandbox.useFakeTimers(TIMESTAMP);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('gauge', () => {
    const log = sandbox.spy(logger, 'log');

    metrics.gauge('g2', 1);
    expect(log.calledWith(TIMESTAMP_UNIX, 'gauge', 'g2', 1, { acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;

    metrics.gauge('g3', 1, { t1: 'v1' });
    expect(log.calledWith(TIMESTAMP_UNIX, 'gauge', 'g3', 1, { t1: 'v1', acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;
  });

  it('count', () => {
    const log = sandbox.spy(logger, 'log');

    metrics.count('c1');
    expect(log.calledWith(TIMESTAMP_UNIX, 'count', 'c1', 1, { acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;

    metrics.count('c2', 2);
    expect(log.calledWith(TIMESTAMP_UNIX, 'count', 'c2', 2, { acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;

    metrics.count('c3', 3, { t3: 'v3' });
    expect(log.calledWith(TIMESTAMP_UNIX, 'count', 'c3', 3, { t3: 'v3', acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;
  });

  it('histogram', () => {
    const log = sandbox.spy(logger, 'log');

    metrics.histogram('h1');
    expect(log.calledWith(TIMESTAMP_UNIX, 'histogram', 'h1', 1, { acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;

    metrics.histogram('h2', 2);
    expect(log.calledWith(TIMESTAMP_UNIX, 'histogram', 'h2', 2, { acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;

    metrics.histogram('h3', 3, { t3: 'v3' });
    expect(log.calledWith(TIMESTAMP_UNIX, 'histogram', 'h3', 3, { t3: 'v3', acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;
  });

  it('check', () => {
    const log = sandbox.spy(logger, 'log');

    metrics.check('c1');
    expect(log.calledWith(TIMESTAMP_UNIX, 'check', 'c1', 0, { acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;

    metrics.check('c2', 1);
    expect(log.calledWith(TIMESTAMP_UNIX, 'check', 'c2', 1, { acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;

    metrics.check('c3', 2, { t3: 'v3' });
    expect(log.calledWith(TIMESTAMP_UNIX, 'check', 'c3', 2, { t3: 'v3', acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;
  });

  it('error count object', () => {
    const log = sandbox.spy(logger, 'log');
    const err = sandbox.spy(logger, 'err');

    metrics.error(new RangeError(), 'my');
    expect(log.calledWith(TIMESTAMP_UNIX, 'count', 'my.error.count', 1, { type: 'RangeError', acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;
    expect(err.called).to.be.true;
  });

  it('error count string', () => {
    const log = sandbox.spy(logger, 'log');
    const err = sandbox.spy(logger, 'err');

    metrics.error('string error');
    expect(log.calledWith(TIMESTAMP_UNIX, 'count', 'aws.lambda.handler.error.count', 1,
                          { type: 'string', acct: 'dev', region: 'us-east-1', test: 'metrics' })).to.be.true;
    expect(err.called).to.be.true;
  });
});
