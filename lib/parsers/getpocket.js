const { JSDOM } = require('jsdom');

exports.name = 'getpocket';

/**
 * Check if the parser can parse the given content.
 *
 * @param content String
 * @return boolean
 */
exports.canParse = function (content) {
  return /<title>Pocket Export<\/title>/i.test(content);
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

  // Retrieve all lists in the documents. Each list is a folder.
  const lists = window.document.getElementsByTagName('ul');

  for (let i = 0; i < lists.length; i += 1) {
    const list = lists[i];
    let folderTitle;

    // Get the first previous sibling <h1> for that <ul> list. That will be the folder name.
    let h1 = list;
    while (h1.previousSibling) {
      if (h1.previousSibling.nodeType !== window.document.TEXT_NODE) {
        break;
      }
      h1 = h1.previousSibling;
    }
    h1 = h1.previousSibling;

    // Stop if unfound.
    if (!h1) {
      throw new Error('Folder title not found');
    }

    folderTitle = h1.textContent;
    const folder = {
      type: 'folder',
      title: folderTitle,
      children: [],
    };

    // Loop over the current list children. Each will be a bookmark.
    const lis = list.getElementsByTagName('li');
    for (let j = 0; j < lis.length; j += 1) {
      const li = lis[j];
      const a = li.querySelector('a');
      if (!a) {
        continue;
      }
      const bookmark = {
        type: 'bookmark',
        title: a.textContent,
        url: a.getAttribute('href'),
        createdAt: a.getAttribute('time_added'),
        tags: a.getAttribute('tags').split(','),
      };
      folder.children.push(bookmark);
    }
    result.push(folder);
  }

  return result;
};
