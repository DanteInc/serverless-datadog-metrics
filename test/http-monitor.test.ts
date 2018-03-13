import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';

import * as Promise from 'bluebird';

import * as metrics from '../src/metrics';
import * as httpMonitor from '../src/http-monitor';

import { Timer } from '../src/Timer';

const supertest = require('supertest');
const replay = require('replay');

let sandbox;
let histogram;

describe('http-monitor.ts', () => {
  beforeEach(() => {
    httpMonitor.patch();

    sandbox = sinon.sandbox.create();

    histogram = sandbox.spy(metrics, 'histogram');
  });

  afterEach(() => {
    httpMonitor.unpatch();

    expect(histogram.calledOnce).to.be.true;
    sandbox.restore();
  });

  it('check timer', () => {
    const tags = {
      'http-host': 'www.google.com',
      'http-method': 'GET',
    };

    return Promise.resolve(supertest('https://www.google.com').get('/')
      .expect(200))
      .catch(expect.fail)
      .tap(() => {
        expect(histogram.firstCall.args[0]).to.equal('http.request');
        expect(histogram.firstCall.args[2]).to.deep.equal(Object.assign({ statusCode: 200, statusMessage: 'OK' }, tags));
      })
      ;
  });

  it('4xxerror', () => {
    const count = sandbox.spy(metrics, 'count');

    const tags = { statusCode: 401, statusMessage: 'UNAUTHORIZED' };
    const response = tags;
    const t = new Timer('http.request');

    httpMonitor.recordError(response, tags, t);
    t.end(tags);

    expect(count.firstCall.args[0]).to.equal('http.request.4xxerror');
    expect(count.firstCall.args[1]).to.equal(1);
    expect(count.firstCall.args[2]).to.deep.equal(tags);

    expect(count.secondCall.args[0]).to.equal('http.request.5xxerror');
    expect(count.secondCall.args[1]).to.equal(0);
    expect(count.secondCall.args[2]).to.deep.equal(tags);
  });

  it('5xxerror', () => {
    const count = sandbox.spy(metrics, 'count');

    const tags = { statusCode: 502, statusMessage: 'BAD_GATEWAY' };
    const response = tags;
    const t = new Timer('http.request');

    httpMonitor.recordError(response, tags, t);
    t.end(tags);

    expect(count.firstCall.args[0]).to.equal('http.request.4xxerror');
    expect(count.firstCall.args[1]).to.equal(0);
    expect(count.firstCall.args[2]).to.deep.equal(tags);

    expect(count.secondCall.args[0]).to.equal('http.request.5xxerror');
    expect(count.secondCall.args[1]).to.equal(1);
    expect(count.secondCall.args[2]).to.deep.equal(tags);
  });
});
