export const copyTextToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};