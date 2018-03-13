import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';

import * as metrics from '../src/metrics';
import * as systemMonitors from '../src/system-monitors';
import * as logger from '../src/logger';

let sandbox;

describe('system-monitors.ts', () => {
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    logger.disable();
  });

  afterEach(() => {
    logger.disable();
    sandbox.restore();
  });

  it('start', () => {
    const gauge = sandbox.spy(metrics, 'gauge');

    systemMonitors.start({ advanced: true });

    expect(gauge.firstCall.args[0]).to.equal('node.process.uptime');
    expect(gauge.secondCall.args[0]).to.equal('node.os.uptime');
  });

  it('stop advanced', () => {
    logger.enable();
    systemMonitors.start({ advanced: true });

    const now = Date.now();
    while (Date.now() - now < 10);

    systemMonitors.stop({ advanced: true });
  });

  it('stop basic', () => {
    logger.enable();
    systemMonitors.start();

    const now = Date.now();
    while (Date.now() - now < 10);

    systemMonitors.stop();
  });
});
