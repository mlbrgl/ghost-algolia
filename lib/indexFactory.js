const algoliaSearch = require('algoliasearch');

const indexFactory = (config) => {
  const algoliaSettings = config.get('algolia');
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
    fragmentsCount: () => {
      return _fragments.length;
    },
    save: () => {
      return index.addObjects(_fragments);
    },
    delete: (post) => {
      return index.deleteByQuery(post.attributes.uuid, {restrictSearchableAttributes: 'post_uuid'});
    },
    getFragments: () => {
      return _fragments;
    },
    countRecords: () => {
      return index.search({query: '', hitsPerPage: 0}).then((queryResult) => queryResult.nbHits);
    }
  }
}

module.exports = indexFactory;
