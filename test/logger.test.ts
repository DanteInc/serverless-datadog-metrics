import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';

import * as logger from '../src/logger';

const TIMESTAMP = 1487270789; // unix format

let sandbox;

describe('logger.ts', () => {
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    logger.disable();
  });

  afterEach(() => {
    logger.disable();
    sandbox.restore();
  });

  it('format', () => {
    expect(logger.format(TIMESTAMP, 'gauge', 'gauge1', 1, { tag1: 'value1', tag2: 'value2' }))
      .to.deep.equal(
        'MONITORING|1487270789|1|gauge|gauge1|#tag1:value1,tag2:value2',
    );
  });

  it('log', () => {
    const log = sandbox.stub(console, 'log');

    logger.log(TIMESTAMP, 'gauge', 'g1', 1, {});
    expect(log.notCalled).to.be.true;

    logger.enable();

    logger.log(TIMESTAMP, 'gauge', 'g1', 1, {});
    expect(log.called).to.be.true;

    log.restore();
  });

  it('err', () => {
    const log = sandbox.stub(console, 'error');

    logger.err(new Error('disabled'));
    expect(log.notCalled).to.be.true;

    logger.err('disabled');
    expect(log.notCalled).to.be.true;

    logger.enable();

    logger.err('string error');
    expect(log.getCall(0).args[0]).to.equal('string error');

    logger.err(new Error('enabled'));

    const arg0 = JSON.parse(log.getCall(1).args[0]);
    expect(arg0.errorMessage).to.equal('enabled');
    expect(arg0.errorType).to.equal('Error');
    expect(arg0.handled).to.equal(false);
    expect(arg0.stackTrace).to.not.be.null;

    log.restore();
  });
});
