const { JSDOM } = require('jsdom');

exports.name = 'pinterest';

/**
 * Check if the parser can parse the given content.
 *
 * @param content String
 * @return boolean
 */
exports.canParse = function (content) {
  return /<rss/i.test(content) && /<channel>/i.test(content);
};

/**
 * Parse the content for bookmarks.
 *
 * @param content
 * @returns []
 */
exports.parse = function (content) {
  const { window } = new JSDOM(content);

  const result = [];

  // Retrieve all items in the documents. Each item is a pin.
  const items = window.document.getElementsByTagName('item');

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];

    const title = item.querySelector('title').textContent;
    const url = item.querySelector('guid').textContent;
    const description = item.querySelector('description').textContent;
    const createdAt = new Date(item.querySelector('pubDate').textContent);

    const bookmark = {
      type: 'bookmark',
      title,
      url,
      description,
      createdAt: createdAt.getTime(),
    };
    result.push(bookmark);
  }

  return result;
};
