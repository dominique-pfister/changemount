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

/* eslint-disable no-console */

'use strict';

const algoliasearch = require('algoliasearch');
const ChangeMount = require('./ChangeMount.js');

require('dotenv').config();

function usage() {
  console.log(`usage: changemount <index> <from> <to>

index - Algolia index name
from  - Original mount name (e.g. '/ms/')
to    - New mount name (e.g. '/')

Your environment should contain values for ALGOLIA_APP_ID and ALGOLIA_API_KEY. They
can be specified in an .env file in the working directory.
`);
  process.exit(1);
}

function error(msg) {
  console.log(`** error: ${msg}`);
  process.exit(-1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 3) {
    usage();
  }
  const [name, from, to] = args;
  if (from !== '/' && !from.match(/\/.*\//)) {
    error(`from should be either '/' or start and end with a '/': ${from}`);
  }
  if (to !== '/' && !to.match(/\/.*\//)) {
    error(`to should be either '/' or start and end with a '/': ${to}`);
  }
  if (from === to) {
    return;
  }
  const {
    ALGOLIA_APP_ID: appId,
    ALGOLIA_API_KEY: apiKey,
  } = process.env;

  if (!appId) {
    error('Missing environment variable: ALGOLIA_APP_ID');
  }
  if (!apiKey) {
    error('Missing environment variable: ALGOLIA_API_KEY');
  }
  try {
    const algolia = algoliasearch(appId, apiKey);
    const index = algolia.initIndex(name);

    const changemount = new ChangeMount(index, from, to);
    await changemount.run();
  } catch (e) {
    error(e.message);
  }
}

main();
