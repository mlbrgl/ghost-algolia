import algoliaSearch from 'algoliasearch';

const indexFactory = (algoliaSettings) => {
  const fragments = [];
  let index;

  return {
    connect() {
      if (algoliaSettings && algoliaSettings.active === true) {
        if (algoliaSettings.applicationID && algoliaSettings.apiKey && algoliaSettings.index) {
          const client = algoliaSearch(algoliaSettings.applicationID, algoliaSettings.apiKey);
          index = client.initIndex(algoliaSettings.index);
          return true;
        }
        // TODO better error output on frontend
        console.log(
          'Please check your Algolia settings for a missing configuration option: applicationID, apiKey, index.',
        );
        return false;
      }
      console.log('Algolia indexing deactivated.');
      return false;
    },
    addFragment(fragment) {
      if (fragment.content !== undefined || fragment.heading !== undefined) {
        fragments.push(fragment);
      }
    },
    fragmentsCount() {
      return fragments.length;
    },
    save() {
      return index.addObjects(fragments);
    },
    // TODO
    delete(post) {
      return index.deleteByQuery(post.attributes.uuid, {
        restrictSearchableAttributes: 'post_uuid',
      });
    },
    getFragments() {
      return fragments;
    },
    countRecords() {
      return index.search({ query: '', hitsPerPage: 0 }).then(queryResult => queryResult.nbHits);
    },
  };
};

export default indexFactory;
