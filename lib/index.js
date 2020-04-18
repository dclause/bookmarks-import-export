const fs = require('fs');

// load parsers.
const parsers = [];
const files = fs.readdirSync(__dirname + '/parsers');
files.forEach(function (file) {
  parsers.push(require('./parsers/' + file));
});

/**
 * Parse the given content.
 *
 * @param content
 * @param callback function
 *
 * @return object
 * @throws
 */
function parse(content, callback) {
  let parser = null;
  for (let idx = 0; idx < parsers.length; idx += 1) {
    try {
      if (parsers[idx].canParse(content)) {
        parser = parsers[idx];
        break;
      }
    } catch (e) {
      // Do nothing: skip that parser.
    }
  }

  if (parser === null) {
    const err = new Error('No suitable parser found for given content.');
    if (callback !== undefined) {
      callback(err);
    }
    throw err;
  }

  // Parse content with the selected parser.
  const res = {
    parser: parser.name,
    bookmarks: parser.parse(content),
  };
  if (callback !== undefined) {
    callback(null, res);
  }
  return res;
}

module.exports = exports = {
  parse: parse,
};
