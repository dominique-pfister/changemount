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

/**
 * Algolia compatible read-only index loaded from file for testing.
 */
module.exports = class AlgoliaIndex {
  constructor(contents) {
    this._contents = contents;
  }

  // eslint-disable-next-line class-methods-use-this
  search(_, { page }) {
    if (page > 0) {
      return null;
    }
    return {
      nbPages: 1,
      nbHits: this.contents.length,
      hits: this.contents,
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
