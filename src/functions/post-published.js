const indexFactory = require('./lib/indexFactory')
const parserFactory = require('./lib/parserFactory')

exports.handler = function(event, context, callback) {

  const algoliaSettings = {
    active: process.env.ALGOLIA_ACTIVE === 'TRUE' ? true : false,
    applicationID: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_API_KEY,
    index: process.env.ALGOLIA_INDEX
  }

  const post = JSON.parse(event.body).post.current
  const index = indexFactory(algoliaSettings)

  if(index.connect() && parserFactory().parse(post, index)) {
    index.save()
    .then(() => {
      callback(null, {
        statusCode: 200,
        body: 'GhostAlgolia: post "' + post.title + '" has been added to the index.'
      })
    })
    .catch((err) => {callback(err)});
  }
}
