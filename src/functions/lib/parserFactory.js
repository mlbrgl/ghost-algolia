import { parseFragment } from 'parse5';
import striptags from 'striptags';
import slug from 'slug';
import { isHeading, getHeadingLevel } from './utils';

const parserFactory = () => ({
  // Returns the number of fragments successfully parsed
  parse(post, index) {
    let fragment = {};
    let headingCount = 0;

    const cleanhtml = striptags(post.html, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
    const nodes = parseFragment(cleanhtml).childNodes;

    if (nodes.length !== 0) {
      // can that be true even with an empty doc?
      // Set first hypothetical headless fragment attributes.
      if (!isHeading(nodes[0])) {
        fragment.id = post.slug;
        // we give a higher importance to the intro (the first headless fragment)
        fragment.importance = 0;
        fragment.post_uuid = post.uuid;
        fragment.post_title = post.title;
        fragment.post_published_at = post.published_at;
      }

      nodes.forEach((node) => {
        if (isHeading(node)) {
          // Send previous fragment
          index.addFragment(fragment);

          fragment = {};
          headingCount += 1;
          fragment.heading = node.childNodes[0].value;
          fragment.id = `${post.slug}#${slug(fragment.heading, { lower: true })}--${headingCount}`;
          fragment.importance = getHeadingLevel(node.nodeName);
          fragment.post_uuid = post.uuid;
          fragment.post_title = post.title;
          fragment.post_published_at = post.published_at;
        } else {
          if (fragment.content === undefined) fragment.content = '';
          // If node not a heading, then it is a text node and always has a value property
          fragment.content += `${node.value} `;
        }
      });

      // Saving the last fragment (as saving only happens as a new heading
      // is found). This also takes care of heading-less articles.
      index.addFragment(fragment);
    }

    return index.fragmentsCount();
  },
});

export default parserFactory;
