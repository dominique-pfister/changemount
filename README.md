# changemount

> Rename a mount in all paths in an Algolia index

## Installation

```bash
$ npm install @dominique-pfister/changemount
```

## Usage

```
Usage: changemount <index> <from> <to>

index - Algolia index name
from  - Original mount name (e.g. '/ms/')
to    - New mount name (e.g. '/')

Your environment should contain values for ALGOLIA_APP_ID and ALGOLIA_API_KEY. They
can be specified in an .env file in the working directory.

```

## Development

### Build

```bash
$ npm install
```

### Lint

```bash
$ npm run lint
```