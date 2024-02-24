import { NodeHtmlMarkdown } from 'node-html-markdown';

export const extractHeadingTextFromHTML = (htmlString: string): string => {
  const nhm = new NodeHtmlMarkdown();
  const markdown = nhm.translate(htmlString);

  const heading = markdown
    .replace(/^#+/g, '')
    .replace(/(^\s*)|[\n\t\r]|(\s*$)/g, '');

  return heading;
};
