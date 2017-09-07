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
      indexFactory = require('./lib/indexFactory'),
      parserFactory = require('./lib/parserFactory');

const GhostAlgolia = {};


/*
 * Register (post) events to react to admin panel actions
 */
GhostAlgolia.registerEvents = function registerEvents(events) {

  // React to post being published (from unpublished)
  events.on('post.published', function(post) {
    let index = indexFactory();
    if(index.connect() && parserFactory().parse(post, index)) {
      index.add(post)
      .then(() => { console.log('GhostAlgolia: post "' + post.attributes.title + '" has been added to the index.'); })
      .catch((err) => console.log(err));
    };
  });

  // React to post being edited in a published state
  events.on('post.published.edited', function(post) {
    let index = indexFactory();
    if(index.connect()) {
      let promisePublishedEdited;
      if(parserFactory().parse(post, index)) {
        promisePublishedEdited = index.delete(post)
                                 .then(() => { index.add(post) });
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
    let index = indexFactory();
    if(index.connect()) {
      index.delete(post)
      .then(() => { console.log('GhostAlgolia: post "' + post.attributes.title + '" has been removed from the index.'); })
      .catch((err) => console.log(err));
    };
  });

}

module.exports = GhostAlgolia;
