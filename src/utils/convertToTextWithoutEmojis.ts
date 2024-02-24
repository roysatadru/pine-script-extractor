export const convertToTextWithoutEmojis = (text: string) => {
  return text.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
};
