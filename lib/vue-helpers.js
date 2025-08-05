import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template: cloneTemplate, utils } = ham;

export const defineComponent = (template, setupFn = () => {}, options = {}) => {
  return {
    template,
    props: setupFn.props || [],
    components: options.components || {},
    setup: setupFn,
  }
}

export const getTemplate = (name, asOuterHTML = true) => {
  const t = document.querySelector(`[data-component="${name}"]`)
    .content.firstElementChild
    .cloneNode(true);
  
  return asOuterHTML ? t.outerHTML : t;
}