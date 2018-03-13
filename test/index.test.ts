import 'mocha';
import { expect } from 'chai';

import * as index from '../src';

describe('index.ts', () => {
  it('exports', () => {
    expect(index).not.empty;
  });
});
