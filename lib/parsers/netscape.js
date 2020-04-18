const { JSDOM } = require('jsdom');

exports.name = 'netscape';

/**
 * Check if the parser can parse the given content.
 *
 * @param content String
 * @return boolean
 */
exports.canParse = function (content) {
  // Check if the content starts with the proper doctype tag.
  if (!/^\s*<!DOCTYPE NETSCAPE-Bookmark/i.test(content)) {
    return false;
  }

  // Check if at least one bookmark is recognisable.
  return (
    /<dl/i.test(content) &&
    /<\/dl/i.test(content) &&
    /<dt/i.test(content) &&
    /<a[^<>]href\s*=\s*/i.test(content)
  );
};

/**
 * Parse the content for bookmarks.
 *
 * @param content
 * @returns []
 */
exports.parse = function (content) {
  let rootFoldersRegEx = /^Menu|Unsorted|Toolbar$/i;

  const { window } = new JSDOM(content);
  let result = [];

  /**
   * Gets data for a current DOM node (<dt>).
   *
   * @param node
   * @return object
   */
  function _getNodeData(node) {
    let data = {};

    for (let i = 0; i !== node.childNodes.length; i++) {
      // Handle links.
      if (node.childNodes[i].tagName === 'A') {
        // Links are considered to be bookmark.
        data.type = 'bookmark';
        data.url = node.childNodes[i].getAttribute('href');
        data.title = node.childNodes[i].textContent;

        let createdAt = node.childNodes[i].getAttribute('ADD_DATE');
        if (createdAt) {
          data.createdAt = createdAt;
        }

        let icon = node.childNodes[i].getAttribute('icon');
        if (icon) {
          data.icon = icon;
        }
      } else if (node.childNodes[i].tagName === 'H3') {
        // H3 nodes are considered to be folder.
        data.type = 'folder';
        data.title = node.childNodes[i].textContent;

        let createdAt = node.childNodes[i].getAttribute('ADD_DATE');
        let updatedAt = node.childNodes[i].getAttribute('LAST_MODIFIED');

        if (createdAt) {
          data.createdAt = createdAt;
        }

        if (updatedAt) {
          data.updatedAt = updatedAt;
        }
        data.ns_root = null;
        if (node.childNodes[i].hasAttribute('personal_toolbar_folder')) {
          data.ns_root = 'toolbar';
        }
        if (node.childNodes[i].hasAttribute('unfiled_bookmarks_folder')) {
          data.ns_root = 'unsorted';
        }
      } else if (node.childNodes[i].tagName === 'DL') {
        // Store DL element reference for further processing the child nodes.
        data.__dir_dl = node.childNodes[i];
      }
    }

    // If current item is a folder, but we haven't found DL element for it inside the DT element :
    //  - check if the next sibling is DD
    //    - if yes: check if it has DL element
    //      -  if yes: we just found the DL element for the folder.
    if (data.type === 'folder' && !data.__dir_dl) {
      if (node.nextSibling && node.nextSibling.tagName === 'DD') {
        let dls = node.nextSibling.getElementsByTagName('DL');
        if (dls.length) {
          data.__dir_dl = dls[0];
        }
      }
    }

    return data;
  }

  function _processDir(dir, level) {
    let children = dir.childNodes,
      menuRoot = null;

    let items = [];

    for (let i = 0; i !== children.length; i++) {
      let child = children[i];
      if (!child.tagName) {
        continue;
      }
      if (child.tagName !== 'DT') {
        continue;
      }
      let itemData = _getNodeData(child);

      if (itemData.type) {
        if (level === 0 && !itemData.ns_root) {
          // create menu root if need
          if (!menuRoot) {
            menuRoot = {
              title: 'Menu',
              children: [],
              ns_root: 'menu',
            };
          }
          if (itemData.type === 'folder' && itemData.__dir_dl) {
            itemData.children = _processDir(itemData.__dir_dl, level + 1);
            delete itemData.__dir_dl;
          }
          menuRoot.children.push(itemData);
        } else {
          if (itemData.type === 'folder' && itemData.__dir_dl) {
            itemData.children = _processDir(itemData.__dir_dl, level + 1);
            delete itemData.__dir_dl;
          }
          items.push(itemData);
        }
      }
    }
    if (menuRoot) {
      items.push(menuRoot);
    }
    return items;
  }

  let dls = window.document.getElementsByTagName('DL');

  if (dls.length > 0) {
    return _processDir(dls[0], 0);
  } else {
    throw new Error(
      'Bookmarks file malformed(Netscape parser): no DL nodes were found'
    );
  }
};
