import { NodeHtmlMarkdown } from 'node-html-markdown';

export const extractHeadingTextFromHTML = (htmlString: string): string => {
  const nhm = new NodeHtmlMarkdown();
  const markdown = nhm.translate(htmlString);

  let heading = markdown
    .replace(/^#+/g, '')
    .replace(/(^\s*)|[\n\t\r]|(\s*$)/g, '');

  // replace some word: with " -" to avoid file naming issues while not losing the emojis
  heading = heading.replace(/(\w): /g, '$1 - ');

  // replace "some word?" with "some word❔" to avoid file naming issues but don't replace ? within emojis
  heading = heading.replace(/(\w)\?/g, '$1❔');

  // replace "some word / some word" with "some word - some word" to avoid file naming issues but don't replace / within emojis
  heading = heading.replace(/(\w) \/ (\w)/g, '$1 - $2');

  // replace "some word/some word" with "some wordxsome word" to avoid file naming issues but don't replace / within emojis
  heading = heading.replace(/(\w)\/(\w)/g, '$1x$2');

  return heading;
};
