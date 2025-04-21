const { Utils } = require("formiojs");
const formiojs = require("formiojs");
const TextFieldComponent = formiojs.Components.components.textfield;
const ButtonFieldComponent = formiojs.Components.components.button;

const MyCustomComponentForm = require("./editForm/MyCustomComponent.form.js");

// Hide the original TextFieldComponent from the form builder
TextFieldComponent.builderInfo = null;

class MyCustomComponent extends TextFieldComponent {
  static schema(...extend) {
    return TextFieldComponent.schema(...extend, {
      type: "mycustomcomponent",
      label: "Custom Component New",
      key: "myCustomCompText",
      prefix: "MyCustomText"
      // Other default properties for your component...
      // components: [
      //   // Define your custom tabs here
      // ]
    });
  }

  // Define the builder info for MyCustomComponent
  static get builderInfo() {
    return {
      title: "Custom Component",
      group: "basic",
      icon: "fas fa-i-cursor",
      weight: 70,
      documentation: "http://help.form.io/userguide/#textfield",
      schema: MyCustomComponent.schema()
    };
  }

  constructor(component, options, data) {
    super(component, options, data);
    this.checks = [];
  }

  /**
   * Called immediately after the component has been instantiated to initialize
   * the component.
   */
  addFocusBlurEvents() {}
  init() {
    super.init();
  }

  attach(element) {
    super.attach(element);
    var inputId = `${this.component.id}-${this.component.key}`;
    let elementRef = { [inputId]: "single" };
    this.loadRefs(element, elementRef);
    this.removeAllEvents();

    if (!this.refs.input) return;

    if (this.component.ontextchanged) {
      this.addEventListener(element, "keydown", () =>
        this.getAction(this.component.ontextchanged)
      );
    }
    if (this.component.onclick) {
      this.addEventListener(element, "click", () => {
        this.getAction(this.component.onclick);
      });
    }

    // console.log("Comp", this.refs);
    // console.log("option", this.);

    // // if (this.component.action === "showAlert") {

    // this.addEventListener(element, "blur", () => console.log("BLurr"));
    // this.addEventListener(element, "focus", () => console.log("Focus"));
    // this.addEventListener(this.refs.input, "focus", () => console.log("Focus"));
    // this.addEventListener(this.refs.input, "blur", () => console.log("Focus"));
    // this.addEventListener(element, "onFocus", () => console.log("Focus"));

    // if (this.component.alertMessage) {
    // }

    // keydown,keyup,drag,click,close,keypress,input,dragover,dragleave,drop,choice
    //   this.addEventListener(this.refs.input["0"], "chnage", () => {
    //     console.log("Here3");
    //   });
    // }
    // this.on(
    //   "change",
    //   (value, flags) => {
    //     // alert(this.component.alertMessage);
    //   },
    //   true
    // );
    // }
  }

  getAction(data) {
    switch (data.action) {
      case "showAlert":
        return alert(data.alertMessage);

      case "showModal":
        return alert("Later this will be internal Modal");

      case "navigateTo":
        return alert("Later this will be internal Modal");

      default:
        break;
    }
  }

  detach() {
    return super.detach();
  }

  destroy() {
    return super.destroy();
  }

  getValue() {
    return super.getValue();
  }

  createInput(container) {
    super.createInput(container);
    const inputField = this.refs.input;
    if (inputField) {
      // Add a prefix (e.g., 'MyCustomPrefix - ') to the input field value
      inputField.value = `MyCustomPrefix - ${inputField.value}`;

      // Alternatively, you can add a placeholder as a prefix (this doesn't affect the actual value)
      inputField.setAttribute('placeholder', 'MyCustomPrefix - Enter Text Here');
    }
  }

  setValue(value, flags = {}) {
    // console.log({ value, flags });
    return `MyCustomPrefix - ${super.setValue(value, flags)}`;
  }

  // Define your other methods like render(), attach(), getValue(), setValue() here...
  render(content) {
    return super.render();
  }
}

MyCustomComponent.editForm = (...args) => {
  const editForm = TextFieldComponent.editForm(...args);

  // Remove the existing tabs from editForm.components
  editForm.components = editForm.components.filter(
    (component) => component.type !== "tabs"
  );

  // Add the new tabs from MyCustomComponentForm to editForm.components
  // as of today 5/30/23 the editform extends the class which brings all of the default tabs as an array
  const customForm = MyCustomComponentForm();
  editForm.components.push(...customForm.components); //add .components to convert array to object

  // Remove the existing tabs from editForm.components
  let tabs = editForm.components.find((component) => component.type === "tabs")
    .components;

  const unwantedTabs = [
    "data",
    "validation",
    "api",
    // "logic",
    "layout",
    "addons"
  ];
  for (let i = tabs.length - 1; i >= 0; i--) {
    if (unwantedTabs.includes(tabs[i].key)) {
      tabs.splice(i, 1);
    }
  }

  return editForm;
};

module.exports = MyCustomComponent;
