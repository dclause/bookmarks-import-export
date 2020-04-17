# Parses or export bookmarks files

This library can parse (or export) bookmarks files from various formats listed below:

- Netscape Bookmarks (Google Chrome, ...)

## Installation

`npm install bookmarks-import-export`

## Usage

**Parse input files :**

`const bookmarks = parse(content, callback)`

Exemple:
```javascript

const parse = require("bookmarks-import-export");
parse('<title>Pocket Export</title><h1>Unread</h1>'+
      '<ul><li><a href="http://example.com">Example!</a></li></ul>', (err, res) => {
  console.log(err);
  console.log(res.parser);
  console.log(res.bookmarks);
});

```

`parse` function accepts two parameters : 
- `content` (string): text of a exported bookmarks file.
- `callback` (function): a callback method.

The callback should accept two parameters: 
- `err` (error or null): will be an Error object in case of parsing issue.
- `res` (object): will be an object with two keys:
    - `parser` (string): the parser used name. Currently only `netscape` available.
    - `bookmarks` (array): An array of parsed bookmarks objects

Each bookmark is an object with fields:
- `type` (string): `folder` or `bookmark`.
- `title` (string): title of a bookmark or a folder.
- `url` (string): URL only for bookmarks.
- `children` (array): An array of children bookmarks, only for folders.

Optionaly (depending on source) it may contain also:
- `date` (timestamp): a timestamp of the time when the bookmark was added.


If you have found out any bugs or have any questions please feel free to submit it into the issues.

## Credits

- (calibr) [bookmarks-parser](https://github.com/calibr/node-bookmarks-parser) must be quoted as the main source of inspiration for this module.
