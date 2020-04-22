exports.name = 'firefox';

/**
 * Check if the parser can parse the given content.
 *
 * @param content String
 * @return boolean
 */
exports.canParse = function (content) {
  try {
    const parsed = JSON.parse(content);
    return parsed.type === 'text/x-moz-place-container';
  } catch (e) {
    return false;
  }
};

/**
 * Parse the content for bookmarks.
 *
 * @param content
 * @returns []
 */
exports.parse = function (content) {
  const parsedItems = JSON.parse(content);

  function parseItem(item) {
    const base = {
      title: item.title,
      createdAt: item.createdAt / 1000000,
      updatedAt: item.lastModified / 1000000,
    };

    if (item.children && item.children.length) {
      base.children = [];
      for (let i = 0; i < item.children.length; i += 1) {
        base.children.push(parseItem(item.children[i]));
      }
    }

    if (item.type === 'text/x-moz-place-container' && !!item.title) {
      return Object.assign(base, {
        type: 'folder',
      });
    } else if (item.type === 'text/x-moz-place' && !!item.uri) {
      return Object.assign(base, parseBookmark(item));
    }

    return base;
  }

  function parseBookmark(item) {
    return {
      type: 'bookmark',
      url: item.uri,
      favicon: item.iconuri.replace('fake-favicon-uri:', ''),
    };
  }

  return parseItem(parsedItems).children;
};
