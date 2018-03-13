import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';

import * as metrics from '../src/metrics';
import { Timer } from '../src/Timer';

let sandbox;
let histogram;

describe('Timer.ts', () => {
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    histogram = sandbox.spy(metrics, 'histogram');
  });

  afterEach(() => {
    expect(histogram.called).to.be.true;
    sandbox.restore();
  });

  it('timer', () => {
    const t = new Timer('timer1', { t3: 'v3' });
    sleep(1);
    t.checkpoint('cp1');
    sleep(1);
    t.end();

    expect(histogram.firstCall.args[0]).to.equal('timer1.cp1');
    expect(histogram.firstCall.args[2]).to.deep.equal({ t3: 'v3' });

    expect(histogram.secondCall.args[0]).to.equal('timer1');
    expect(histogram.secondCall.args[2]).to.deep.equal({ t3: 'v3' });
  });

  it('timer no tags', () => {
    const t = new Timer('timer2');
    sleep(1);
    t.checkpoint('cp2');
    sleep(1);
    t.end();

    expect(histogram.firstCall.args[0]).to.equal('timer2.cp2');
    expect(histogram.firstCall.args[2]).to.deep.equal({});

    expect(histogram.secondCall.args[0]).to.equal('timer2');
    expect(histogram.secondCall.args[2]).to.deep.equal({});
  });

  it('timer count', () => {
    const count = sandbox.spy(metrics, 'count');

    const t = new Timer('timer3');
    t.count('4xxerror', 1);
    t.end();

    expect(count.firstCall.args[0]).to.equal('timer3.4xxerror');
  });
});

const sleep = (duration) => { // ms
  const currentTime = new Date().getTime();
  while (currentTime + duration >= new Date().getTime()) { }
};
