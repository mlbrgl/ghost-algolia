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

var algoliasearch = require('algoliasearch'),
    h2p = require('html2plaintext'),
    config = require('../../../current/core/server/config');

var GhostAlgolia = Object.create(null),
    algolia = config.get('algolia');


/*
 * Register (post) events to react to admin panel actions
 */
GhostAlgolia.registerEvents = function registerEvents(events) {

  if(algolia.applicationID && algolia.apiKey && algolia.index) {

    var client = algoliasearch(algolia.applicationID, algolia.apiKey),
    index = client.initIndex(algolia.index);

    // React to post being edited in a published state
    events.on('post.published.edited', function(post) {
      index.addObject(buildPostObject(post), function(err, content) {
        if(!err) {
          console.log('GhostAlgolia: post "' + post.attributes.title + '" has been updated in the index.');
        }
      });
    });

    // React to post being published (from unpublished)
    events.on('post.published', function(post) {
      index.addObject(buildPostObject(post), function(err, content) {
        if(!err) {
          console.log('GhostAlgolia: post "' + post.attributes.title + '" has been added to the index.');
        }
      });
    });

    // React to post being unpublished (from published)
    events.on('post.unpublished', function(post) {
      index.deleteObject(post.attributes.uuid, function(err) {
        if (!err) {
          console.log('GhostAlgolia: post "' + post.attributes.title + '" has been removed from the index.');
        }
      });
    });

    // React to post being deleted
    events.on('post.deleted', function(post) {
      // No need to try and remove a draft from the index as drafts are not sent
      // for indexing in the first place.
      if(post.attributes.status !== 'draft') {
        index.deleteObject(post.attributes.uuid, function(err) {
          if (!err) {
            console.log('GhostAlgolia: post "' + post.attributes.title + '" has been removed from the index.');
          }
        });
      }
    });
  } else {
    console.log('Check Algolia configuration options.')
  }
}

/*
 * Parse the post object and only expose certain attributes to Algolia.
 */
function buildPostObject(post) {
  var postToIndex = Object.create(null);

  postToIndex.objectID = post.attributes.uuid;
  postToIndex.title = post.attributes.title;
  postToIndex.slug = post.attributes.slug;
  // @TODO parse plaintext attribute in order to index paragraphs
  // (vs cramming the entire content into one record)
  postToIndex.text = h2p(post.attributes.html);

  return postToIndex;
}

module.exports = GhostAlgolia;
