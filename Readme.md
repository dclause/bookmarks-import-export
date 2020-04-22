# Parses or export bookmarks files

This library can parse (or export) bookmarks files from various formats listed below:

- Netscape Bookmarks (Google Chrome, ...)
- Firefox json file
- GetPocket library
- Instapaper HTML file

## Installation

`npm install bookmarks-import-export`

## Usage

**Parse input files :**

`const bookmarks = parser.parse.(content)`

Exemple:

```javascript
const bookmarksParser = require('bookmarks-import-export');
try {
  const { parser, bookmarks } = bookmarksParser.parse(
    '<title>Pocket Export</title><h1>Unread</h1>' +
      '<ul><li><a href="http://example.com">Example!</a></li></ul>'
  );
} catch (err) {
  // Something went wrong.
}

// Do nothing here with bookmarks.
```

or using a callback:

```javascript
const bookmarksParser = require('bookmarks-import-export');
  bookmarksParser.parse(
    '<title>Pocket Export</title><h1>Unread</h1>' +
      '<ul><li><a href="http://example.com">Example!</a></li></ul>', (err, { parser, bookmarks }) => {
        if (err) {
          // Something went wrong.
        }
        // Do nothing here with bookmarks.
  });
```

`parse` function accepts two parameters :
- `content` (string): text of a exported bookmarks file.
- `callback` (function)[optional]: a callback function.

If no `callback` is given, the method :

throws Error object in case of error:
- `err` (error): will be an Error object in case of a parsing issue.

or return an object keyed as follows:
- `parser` (string): the parser used name. Currently only `netscape` available.
- `bookmarks` (array): An array of parsed folders/bookmarks objects

Otherwise, the `callback` method must accept two arguments: `err` and `res` such as described above.

Each item the `bookmarks` array is an object with fields:
- `type` (string): `folder` or `bookmark`.
- `title` (string): title of a bookmark or a folder.
- `children` (array): An array of children bookmarks, only for folders.
- `url` (string): URL only for bookmarks.

Optionally (depending on source) it may contain also:
- `createdAt` (timestamp): a timestamp when the folder/bookmark was added.
- `updatedAt` (timestamp): a timestamp when the folder/bookmark was last updated.
- `tags` (array): an array of tags strings.

If you have found out any bugs or have any questions please feel free to submit it into the issues.

## Credits

- (calibr) [bookmarks-parser](https://github.com/calibr/node-bookmarks-parser) must be quoted as the main source of inspiration for this module.
