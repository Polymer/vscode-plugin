/**
 * Hello from VanillaElement's documentation!
 */
class VanillaElement extends HTMLElement {
  static get observedAttributes() {
    return [
      /** @type {boolean} When given the element is totally inactive */
      'disabled',
      /** @type {boolean} When given the element is expanded */
      'open'
    ];
  }
}

customElements.define('vanilla-elem', VanillaElement);