import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRoute, routeHash} from '../src/lib/navigation.ts';

test('a reading URL restores the same passage and originating screen after reload', () => {
  for (const view of ['library', 'notebook', 'review']) {
    const route = {view, reading: 'passage-123'};
    assert.deepEqual(parseRoute(routeHash(route)), route);
  }
});

test('non-reading screens retain their own URLs', () => {
  for (const view of ['library', 'notebook', 'review']) {
    assert.deepEqual(parseRoute(`#/${view}`), {view, reading: null});
  }
});

test('passage identifiers roundtrip safely and malformed routes fall back', () => {
  const route = {view: 'library', reading: 'bài đọc / 1?#'};
  assert.deepEqual(parseRoute(routeHash(route)), route);
  for (const hash of ['', '#', '#/unknown', '#/library/read/%ZZ', '#/library/read/']) {
    assert.deepEqual(parseRoute(hash), {view: 'library', reading: null});
  }
});
