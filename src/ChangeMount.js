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

const p = require('path');

const attributesToRetrieve = ['objectID', 'path'];

function makeparents(filename = '') {
  const parent = p.dirname(filename[0] === '/' ? filename : `/${filename}`);
  if (parent === '/' || parent === '.' || !parent) {
    return ['/'];
  }
  return [...makeparents(parent), parent];
}

module.exports = class ChangeMount {
  constructor(index, from, to) {
    this._index = index;
    this._from = from;
    this._to = to;
    this._page = 0;
  }

  async run() {
    const records = [];
    let hits = await this._fetchFirst();

    do {
      records.push(...this._process(hits));
      // eslint-disable-next-line no-await-in-loop
      hits = await this._fetchNext();
    } while (hits);

    await this._index.partialUpdateObjects(records);
  }

  async _fetchFirst() {
    const result = await this._index.search('', { attributesToRetrieve });
    this._pages = result.nbPages;
    return result.hits;
  }

  async _fetchNext() {
    this._page += 1;
    if (this._page < this._pages) {
      const result = await this._index.search('', { attributesToRetrieve, page: this._page });
      return result.hits;
    }
    return null;
  }

  _process(hits) {
    return hits
      .filter(
        (hit) => (this._from !== '/' ? hit.path.startsWith(this._from.substr(1)) : true),
      )
      .map(
        (hit) => {
          const newpath = this._replace(hit.path);
          return {
            objectID: hit.objectID,
            path: newpath,
            parents: makeparents(`/${newpath}`),
            dir: p.dirname(newpath),
          };
        },
      );
  }

  _replace(path) {
    const suffix = (this._from !== '/' ? path.substr(this._from.substr(1).length) : path);
    return this._to !== '/' ? `${this._to.substr(1)}:${suffix}` : suffix;
  }
};
