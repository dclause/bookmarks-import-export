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
 *
 * @return object
 * @throws
 */
function parse(content) {
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
    throw new Error('No suitable parser found for given content.');
  }

  // Parse content with the selected parser.
  return {
    parser: parser.name,
    bookmarks: parser.parse(content),
  };
}

module.exports = exports = {
  parse: parse,
};
