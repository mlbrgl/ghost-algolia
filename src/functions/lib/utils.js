// The cleaned up html only contains headings and text nodes (#text).
// All nodes whose name start with 'h' are necessarily headings.
export const isHeading = node => node.nodeName.startsWith('h');

export const getHeadingLevel = nodeName => nodeName.charAt(1);
