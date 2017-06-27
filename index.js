import { h, render, Component } from "preact";

export default function registerElement(name, CustomComponent) {
  let registeredName = name;

  // This lets hot reloading work, otherwise it will try to register the same named
  // element which is not allowed.
  if (process.env.NODE_ENV !== "production") {
    registeredName = `${name}-${Math.random().toString().substring(2)}`;
  }

  window.customElements.define(
    registeredName,
    class extends HTMLElement {
      static get observedAttributes() {
        return Object.keys(CustomComponent.propTypes || {});
      }

      constructor() {
        super();

        this.root = this.attachShadow({ mode: "closed" });
      }

      attributeChangedCallback(name, oldVal, val) {
        if (this.wrapper) {
          this.wrapper.setState({
            [name]: val
          });
        }
      }

      render() {
        const args = Array.from(this.attributes).reduce((prev, next) => {
          prev[next.name] = next.value;
          return prev;
        }, {});

        const el = this;

        class Wrapper extends Component {
          constructor(props) {
            super();
            el.wrapper = this;
            this.state = { ...props };
          }
          render() {
            return h(CustomComponent, this.state);
          }
        }

        return h(Wrapper, args);
      }

      connectedCallback() {
        render(this.render(), this.root);
      }
    }
  );

  return registeredName;
}
