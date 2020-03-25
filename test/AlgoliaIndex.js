/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

'use strict';

const HITS_PER_PAGE = 2;

/**
 * Algolia compatible read-only index loaded from file for testing.
 */
module.exports = class AlgoliaIndex {
  constructor(contents) {
    this._contents = contents;
    this._nbPages = Math.ceil(contents.length / HITS_PER_PAGE);
  }

  // eslint-disable-next-line class-methods-use-this
  search(_, { page = 0 }) {
    if (page >= this._nbPages) {
      return null;
    }
    return {
      nbPages: this._nbPages,
      nbHits: this.contents.length,
      hits: this.contents.slice(page * HITS_PER_PAGE, (page + 1) * HITS_PER_PAGE),
    };
  }

  partialUpdateObjects(records) {
    records.forEach((record) => {
      const index = this.contents.findIndex((item) => item.objectID === record.objectID);
      if (index !== -1) {
        this.contents[index] = record;
      }
    });
  }

  get name() {
    return this._name;
  }

  get contents() {
    return this._contents;
  }
};
