const algoliaSearch = require('algoliasearch'),
      config = require('../../../../current/core/server/config'),
      algoliaSettings = config.get('algolia');


const indexFactory = () => {
  let _fragments = [];
  let index;

  return {
    connect: () => {
      if(algoliaSettings && algoliaSettings.active === true) {
        if(algoliaSettings.applicationID && algoliaSettings.apiKey && algoliaSettings.index) {
          let client = algoliaSearch(algoliaSettings.applicationID, algoliaSettings.apiKey);
          index = client.initIndex(algoliaSettings.index);
          return true;
        } else {
          // TODO better error output on frontend
          console.log('Please check your Algolia for a missing configuration option: applicationID, apiKey, index.');
          return false;
        }
      } else {
        console.log('Algolia indexing deactivated.')
      }
    },
    addFragment: (fragment) => {
      if(fragment.content !== undefined || fragment.heading !== undefined) {
        _fragments.push(fragment);
      }
    },
    hasFragments: () => {
      return _fragments.length > 0;
    },
    add: (post) => {
      return index.addObjects(_fragments);
    },
    delete: (post) => {
      return index.deleteByQuery(post.attributes.uuid, {restrictSearchableAttributes: 'post_uuid'});
    },
  }
}

module.exports = indexFactory;
