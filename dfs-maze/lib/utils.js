export const copyTextToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};

export const dispatchPointerEvent = (target, type = 'click') => {
  const ev = new PointerEvent(type, {
    view: window,
    bubbles: true,
    cancelable: true
  });
  target.dispatchEvent(ev);
};