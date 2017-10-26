// Apps not ready yet - Not used for now
// https://github.com/TryGhost/Ghost/wiki/Apps-Getting-Started-for-Ghost-Devs
//
// var App = require('ghost-app'),
//     GhostAlgolia;
//
// GhostAlgolia = App.extend({
//
//     install: function () {},
//
//     uninstall: function () {},
//
//     activate: function () {},
//
//     deactivate: function () {},
// });
//
// module.exports = GhostAlgolia;

const converter = require('../../../current/core/server/utils/markdown-converter'),
      client = require('../../../current/core/server/models').Client,
      indexFactory = require('./lib/indexFactory'),
      parserFactory = require('./lib/parserFactory');

const GhostAlgolia = {
  init: (events, config, utils) => {
    bulkIndex(events, config, utils);
    registerEvents(events, config);
  }
};

/*
 * Index all published posts at server start if Algolia indexing activated in config
 */
function bulkIndex(events, config, utils){

  // Emitted in ghost-server.js
  events.on('server:start', function(){
    client.findOne({slug: 'ghost-frontend'}, {context: {internal: true}})
    .then((client) => getContent(utils.url.urlFor('api', true) + 'posts/?formats=mobiledoc&client_id=ghost-frontend&client_secret=' + client.attributes.secret))
    .then((data) => {
      let posts = JSON.parse(data).posts;
      if(posts.length > 0) {
        let index = indexFactory(config);
        if(index.connect()) {
          index.countRecords().then((nbRecords) => {
            if(nbRecords === 0) {
              let parser = parserFactory(),
                  nbFragments = 0;

              posts.forEach((post) => {
                post.attributes = post; // compatibility with posts returned internally in events (below)
                nbFragments += parser.parse(post, index);
              });
              if(nbFragments) { index.save(); }
            }
          })
          .catch((err) => console.error(err));
        }
      }
    })
    .catch((err) => console.error(err));
  });
}


/*
 * Register (post) events to react to admin panel actions
 */
function registerEvents(events, config){

  // React to post being published (from unpublished)
  events.on('post.published', function(post) {
    let index = indexFactory(config);
    if(index.connect() && parserFactory().parse(post, index)) {
      index.save()
      .then(() => { console.log('GhostAlgolia: post "' + post.attributes.title + '" has been added to the index.'); })
      .catch((err) => console.log(err));
    };
  });

  // React to post being edited in a published state
  events.on('post.published.edited', function(post) {
    let index = indexFactory(config);
    if(index.connect()) {
      let promisePublishedEdited;
      if(parserFactory().parse(post, index)) {
        promisePublishedEdited = index.delete(post)
        .then(() => index.save());
      } else {
        promisePublishedEdited = index.delete(post);
      }
      promisePublishedEdited
      .then(() => { console.log('GhostAlgolia: post "' + post.attributes.title + '" has been updated in the index.'); })
      .catch((err) => console.log(err));
    };
  });

  // React to post being unpublished (from published)
  // Also handles deletion of published posts as the unpublished event is emitted
  // before the deleted event which becomes redundant. Deletion of unpublished posts
  // is of no concern as they never made it to the index.
  events.on('post.unpublished', function(post) {
    let index = indexFactory(config);
    if(index.connect()) {
      index.delete(post)
      .then(() => { console.log('GhostAlgolia: post "' + post.attributes.title + '" has been removed from the index.'); })
      .catch((err) => console.log(err));
    };
  });
}

// https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies/
function getContent (url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
};

module.exports = GhostAlgolia;
