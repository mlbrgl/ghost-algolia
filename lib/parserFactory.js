const parse = require('markdown-to-ast').parse,
      removeMd = require('remove-markdown');
      slug = require('slug');

const parserFactory = () => {
  return {

    // Returns true if any fragments have been successfully parsed
    parse: (post, index) => {
      let fragment = {},
          headingCount = 0;

      const markdown = JSON.parse(post.attributes.mobiledoc).cards[0][1].markdown,
            astChildren = parse(markdown).children;

      if(astChildren.length !== 0) {
        // Set first hypothetical headless fragment attributes.
        if(astChildren[0].type !== 'Header') {
          fragment.id = post.attributes.slug;
          fragment.importance = 0; // we give a higher importance to the intro
          // aka the first headless fragment.
          fragment.post_uuid = post.attributes.uuid;
          fragment.post_title = post.attributes.title;
          fragment.post_published_at = post.attributes.published_at;
        }

        astChildren.forEach(function(element){
          if(element.type === 'Header') {
            // Send previous fragment
            index.addFragment(fragment);

            fragment = {};
            headingCount ++;
            fragment.heading = element.children[0].value;
            fragment.id = post.attributes.slug + '#card-markdown--' + slug(fragment.heading) + '--' + headingCount;
            fragment.importance = element.depth;
            fragment.post_uuid = post.attributes.uuid;
            fragment.post_title = post.attributes.title;
            fragment.post_published_at = post.attributes.published_at;
          } else {
            if(fragment.content === undefined) fragment.content = '';
            fragment.content += removeMd(element.raw) + '\n';
          }
        });

        // Saving the last fragment (as saving only happens as a new heading
        // is found). This also takes care of heading-less articles.
        index.addFragment(fragment);
      }

      return index.hasFragments();
    }
  }
}

module.exports = parserFactory;
