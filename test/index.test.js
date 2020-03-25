/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-env mocha */

'use strict';

const assert = require('assert');
const fse = require('fs-extra');
const p = require('path');
const YAML = require('yaml');
const proxyquire = require('proxyquire');
const AlgoliaIndex = require('./AlgoliaIndex');

const SPEC_ROOT = p.resolve(__dirname, 'specs');

/**
 * Where we store our in-memory index before running a test.
 */
let algoliaIndex;

/**
 * Proxy command line tool.
 */
const CLI = proxyquire('../src/CLI.js', {
  algoliasearch: () => ({
    initIndex: () => algoliaIndex,
  }),
});

function readTest(filename) {
  const source = fse.readFileSync(p.resolve(SPEC_ROOT, filename), 'utf8');
  const document = YAML.parseDocument(source, {
    merge: true,
    schema: 'core',
  });
  return document.toJSON();
}

describe('ChangeMount Tests', () => {
  describe('Argument checking', () => {
    it('Missing arguments', async () => {
      await assert.rejects(async () => new CLI([]).run(),
        (err) => {
          assert.strictEqual(err.name, 'CLIError');
          assert.strictEqual(err.code, 1);
          return true;
        });
    });

    const args = ['', '', ''];
    it('Missing ALGOLIA_APP_ID', async () => {
      await assert.rejects(async () => new CLI(args, {}).run(),
        /Missing environment variable/);
    });
    it('Missing ALGOLIA_API_KEY', async () => {
      await assert.rejects(async () => new CLI(args, { ALGOLIA_APP_ID: 'foo' }).run(),
        /Missing environment variable/);
    });

    const env = { ALGOLIA_APP_ID: 'foo', ALGOLIA_API_KEY: 'bar' };
    it('Bad from', async () => {
      await assert.rejects(async () => new CLI(['', '/bad', '/good/'], env).run(),
        /from should be either/);
    });
    it('Bad to', async () => {
      await assert.rejects(async () => new CLI(['', '/good/', 'bad/'], env).run(),
        /to should be either/);
    });

    it('Identical from and to succeeds', async () => {
      await assert.doesNotReject(async () => new CLI(['', '/good/', '/good/'], env).run());
    });
  });

  describe('Run tests in test/specs', () => {
    const env = { ALGOLIA_APP_ID: 'foo', ALGOLIA_API_KEY: 'bar' };

    fse.readdirSync(SPEC_ROOT).forEach((filename) => {
      if (filename.endsWith('.yaml')) {
        const test = readTest(filename);
        it(`Testing ${filename}`, async () => {
          algoliaIndex = new AlgoliaIndex(test.input);
          const cli = new CLI(['', test.from, test.to], env);
          await cli.run();
          assert.deepEqual(algoliaIndex.contents, test.output);
        });
      }
    });
  });
});
