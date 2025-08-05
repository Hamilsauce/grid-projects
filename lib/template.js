export const getTemplate = (name, asOuterHTML = true) => {
  const t = document.querySelector(`[data-component="${name}"]`)
    .content.firstElementChild
    .cloneNode(true);
  
  return asOuterHTML ? t.outerHTML : t;
}