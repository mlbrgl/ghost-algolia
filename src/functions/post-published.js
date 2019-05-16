import indexFactory from './lib/indexFactory';
import parserFactory from './lib/parserFactory';

exports.handler = (event, context, callback) => {
  const algoliaSettings = {
    active: process.env.ALGOLIA_ACTIVE === 'TRUE',
    applicationID: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_API_KEY,
    index: process.env.ALGOLIA_INDEX,
  };

  const post = JSON.parse(event.body).post.current;
  const index = indexFactory(algoliaSettings);

  if (index.connect() && parserFactory().parse(post, index)) {
    index
      .save()
      .then(() => {
        callback(null, {
          statusCode: 200,
          body: `GhostAlgolia: post "${post.title}" has been added to the index.`,
        });
      })
      .catch((err) => {
        callback(err);
      });
  }
};