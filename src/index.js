import { Formio } from "formiojs";
Formio.Evaluator.noeval = true;
import React, { useState, useRef, useEffect } from "react";
import { FormBuilder, Form } from "@formio/react";
import ReactDOM from "react-dom/client";
import "./style.css";
import "./Components/button/button.js";
import { Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AceEditor from "react-ace";
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import MyCustomComponent from "./Components/MyCustomComponent/MyCustomComponent.js";
import dragula from "dragula";
import { Liquid } from "liquidjs";
import { main } from "@popperjs/core";
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-html';
import apiService from './backend-service.js';

const STORE_VALUE_REGEX = /^storeValue\((["'])(.*?)\1,\s*(["'])(.*?)\3\);?$/;
/**
 
matched = `storeValue('Key', 'Value');`.match(regexstring)
if(matched){
    console.log({
          "type": "storeValue",
          "onSuccess": {
            "type": ""
          },
          "onFailure": {
            "type": ""
          },
          "storeKey": matched[2],
          "storeValue": matched[4],
          "liquidjs": "{{storeValue('Key', 'Value');}}"
        })
}
 */

const engine = new Liquid();

Formio.Components.addComponent("mycustomcomponent", MyCustomComponent);

ace.config.set(
  "basePath",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.12/src-noconflict"
);

const App = () => {
  const [form, setForm] = useState({ display: "form", components: [] });
  const [rendererData, setRendererData] = useState({});
  const isMounted = useRef(true);
  const [formId, setFormId] = useState();
  const [clonedForm, setClonedForm] = useState()

  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Clean up any subscriptions or asynchronous tasks here
      // For example:
      // cancelSubscription();
      // clearAsyncTask();
    };
  }, []);

  const handleFormChange = async (updatedSchema) => {
    // console.log(">>>", updatedSchema);

    // if (
    //   updatedSchema.components[0].key === "myCustomCompText" &&
    //   updatedSchema.components[0].alertMessage &&
    //   updatedSchema.components[0].action === "showAlert"
    // ) {
    //   updatedSchema.components[0].logic = [
    //     {
    //       name: "T1",
    //       trigger: {
    //         type: "javascript",
    //         javascript: `alert('${updatedSchema.components[0].alertMessage}')`
    //       },
    //       actions: []
    //     }
    //   ];
    // }

    // Liquidjs builder start
    // TODO: Need to extend more for make every thing dynamic
    const cloneComponents = updatedSchema.components;
    console.log("updated", cloneComponents);

    cloneComponents.forEach((item) => {
      if (item.actions && item?.actions?.length) {
        let liquidjs = [];
        item.actions.forEach((i) => {
          if (i.type === "showAlert") {
            let onSuccess = "";
            let onFailure = "";

            if (
              i.onSuccess &&
              i.onSuccess.type &&
              i.onSuccess.type === "showAlert"
            ) {
              onSuccess = `.then(()=>{showAlert('${i.onSuccess.alertMessage}')})`;
            }
            if (
              i.onFailure &&
              i.onFailure.type &&
              i.onFailure.type === "showAlert"
            ) {
              onFailure = `.catch(()=>{showAlert('${i.onFailure.alertMessage}')})`;
            }
            if (
              i.onSuccess &&
              i.onSuccess.type &&
              i.onSuccess.type === "storeValue"
            ) {
              onSuccess = `.then(()=>{storeValue('${i.onSuccess.storeKey}', '${i.onSuccess.storeValue}')})`;
            }
            if (
              i.onFailure &&
              i.onFailure.type &&
              i.onFailure.type === "storeValue"
            ) {
              onFailure = `.catch(()=>{storeValue('${i.onFailure.storeKey}', '${i.onSuccess.storeValue}')})`;
            }

            Object.assign(i, {
              liquidjs: `showAlert('${i.alertMessage}')${onSuccess}${onFailure};`
            });
            liquidjs.push(
              `showAlert('${i.alertMessage}')${onSuccess}${onFailure}`
            );
          }

          if (i.type === "storeValue") {
            let onSuccess = "";
            let onFailure = "";
            if (
              i.onSuccess &&
              i.onSuccess.type &&
              i.onSuccess.type === "storeValue"
            ) {
              onSuccess = `.then(()=>{storeValue('${i.onSuccess.storeKey}', '${i.onSuccess.storeValue}')})`;
            }
            if (
              i.onFailure &&
              i.onFailure.type &&
              i.onFailure.type === "storeValue"
            ) {
              onFailure = `.catch(()=>{storeValue('${i.onFailure.storeKey}', '${i.onSuccess.storeValue}')})`;
            }
            if (
              i.onSuccess &&
              i.onSuccess.type &&
              i.onSuccess.type === "showAlert"
            ) {
              onSuccess = `.then(()=>{showAlert('${i.onSuccess.alertMessage}')})`;
            }
            if (
              i.onFailure &&
              i.onFailure.type &&
              i.onFailure.type === "showAlert"
            ) {
              onFailure = `.catch(()=>{showAlert('${i.onFailure.alertMessage}')})`;
            }

            Object.assign(i, {
              liquidjs: `storeValue('${i.storeKey}', '${i.storeValue}')${onSuccess}${onFailure};`
            });
            liquidjs.push(
              `storeValue('${i.storeKey}', '${i.storeValue}')${onSuccess}${onFailure}`
            );
          }
        });

        // const tpl = engine.parse(
        //   `showAlert('alert').then(()=>{showAlert('success')});`
        // );
        // engine.render(tpl, {}).then(console.log);

        Object.assign(item, {
          liquidjs: `${liquidjs.join(";")}`
        });
      }
      if (item.liquidjs) {
        item.actions = [mainFunc(item.liquidjs)];
      }
    });

    // Liquidjs builder end

    // if (true) {

    //   const formData = {
    //     display: "form",
    //     components: cloneComponents
    //   }

    //   const res = await apiService.postData(formData);
    //   setFormId(res._id)

    //   setForm(formData);
    // }

    setClonedForm(cloneComponents)
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await apiService.fetchData(formId);
      setForm(data.schemajson);
      setRendererData(data.schemajson);
    }

    if(formId) {
      fetchData();
    }
    
  }, [formId])

  const handleCustomEvent = (event) => {
    // console.log("<<<", event);
    // if (event.type === "button" && event.action === "event") {
    //   console.log('Button with action "event" was clicked');
    // } else {
    //   console.log("button, with no match");
    // }
  };

  const handleAceEditorChanges = (value) => {
    // console.log(value);
    // Handle the change event for AceEditor
  };

  async function saveFormSchema () {
      const formData = {
        display: "form",
        components: clonedForm
      }

      const res = await apiService.postData(formData);
      setFormId(res._id)
    }

  return (
    <div className="App">
      <button className="btn btn-primary btn-md saveButton" style={{background: "green"}} onClick={saveFormSchema}>Save Schema</button>
      <div className="form-builder-wrapper">
        <FormBuilder
          form={form}
          onChange={handleFormChange}
          onCustomEvent={handleCustomEvent}
        />
      </div>

      <div className="form-preview-wrapper">
        <Card>
          <Card.Header>Rendered Form</Card.Header>
          <Card.Body>
            <Form key={JSON.stringify(rendererData)} form={rendererData} />
          </Card.Body>
        </Card>
      </div>

      <div className="form-schema-wrapper">
        <Card className="text-center">
          <Card.Header>Real-time Schema</Card.Header>
          <Card.Body className="text-left">
            <AceEditor
              mode="json"
              theme="github"
              value={JSON.stringify(form, null, 2)}
              onChange={() => handleAceEditorChanges()} // Handle the change event
              name="UNIQUE_ID_OF_DIV"
              fontSize={14}
              showPrintMargin={true}
              showGutter={true}
              editorProps={{ $blockScrolling: true }}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: false,
                enableSnippets: false,
                showLineNumbers: true,
                tabSize: 2
              }}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};


const rootElement = ReactDOM.createRoot(document.getElementById('root'));
rootElement.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// -----------------------------------------------------------------

function extractChainedFunctions(inputString) {
  const thenKeyword = ".then(";
  const catchKeyword = ".catch(";

  let currentIndex = 0;
  let mainFunction = "";
  let thenFunction = "";
  let catchFunction = "";

  // Extract the main function
  const thenIndex = inputString.indexOf(thenKeyword);
  const catchIndex = inputString.indexOf(catchKeyword);

  if (thenIndex !== -1 && (thenIndex < catchIndex || catchIndex === -1)) {
    mainFunction = inputString.substring(0, thenIndex);
  } else if (catchIndex !== -1) {
    mainFunction = inputString.substring(0, catchIndex);
  } else {
    mainFunction = inputString; // If no .then() or .catch() found, consider the entire input as the main function
  }

  // Extract the then function
  if (thenIndex !== -1 && (thenIndex < catchIndex || catchIndex === -1)) {
    const endBracketIndex = findMatchingClosingBracket(
      inputString,
      thenIndex + thenKeyword.length
    );
    if (endBracketIndex !== -1) {
      thenFunction = inputString
        .substring(thenIndex + thenKeyword.length, endBracketIndex)
        .trim();

      // Remove the anonymous function block
      const arrowIndex = thenFunction.indexOf("=>");
      if (arrowIndex !== -1) {
        thenFunction = thenFunction.substring(arrowIndex + 2).trim();
        if (thenFunction.startsWith("{")) {
          thenFunction = thenFunction
            .substring(1, thenFunction.length - 1)
            .trim();
        }
      }
    }
  }

  // Extract the catch function
  if (catchIndex !== -1) {
    const endBracketIndex = findMatchingClosingBracket(
      inputString,
      catchIndex + catchKeyword.length
    );
    if (endBracketIndex !== -1) {
      catchFunction = inputString
        .substring(catchIndex + catchKeyword.length, endBracketIndex)
        .trim();

      // Remove the anonymous function block
      const arrowIndex = catchFunction.indexOf("=>");
      if (arrowIndex !== -1) {
        catchFunction = catchFunction.substring(arrowIndex + 2).trim();
        if (catchFunction.startsWith("{")) {
          catchFunction = catchFunction
            .substring(1, catchFunction.length - 1)
            .trim();
        }
      }
    }
  }
  return {
    main: extractFunctions(mainFunction.trim()),
    then: extractFunctions(thenFunction),
    catch: extractFunctions(catchFunction)
  };
}

function findMatchingClosingBracket(str, startIndex) {
  let count = 1;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === "(") {
      count++;
    } else if (str[i] === ")") {
      count--;
      if (count === 0) {
        return i;
      }
    }
  }
  return -1; // No matching closing bracket found
}

// const input =
//   'showAlert("Test").then(()=>{storeValue("Test","Val")}).catch(()=>{apiCall("TestingURL")})';
// const chainedFunctions = extractChainedFunctions(input);

// console.log(chainedFunctions);

// To Parse the splitted arguments with its correct data type
function parseArgument(arg) {
  if (/^"(.+)"$/.test(arg) || /^'(.+)'$/.test(arg)) {
    return arg.slice(1, -1); // Remove the quotes for string
  } else if (/^-?\d*\.?\d+$/.test(arg)) {
    if (arg.includes(".")) {
      return parseFloat(arg); // Treat as float
    } else {
      return parseInt(arg, 10); // Treat as integer
    }
  } else if (arg.toLowerCase() === "true") {
    return true; // Treat as boolean true
  } else if (arg.toLowerCase() === "false") {
    return false; // Treat as boolean false
  } else {
    return arg; // Default: treat as a regular string
  }
}

function extractFunctions(str) {
  const regex = /(\w+)\((.*?)\)/g;
  const matches = [];

  let match = regex.exec(str);
  while (match !== null) {
    const functionName = match[1];
    const params = match[2]
      ? match[2].split(",").map((arg) => parseArgument(arg.trim()))
      : [];
    matches.push({ functionName, params });
    match = regex.exec(str);
  }

  return matches;
}

// 'showAlert("Test").then(()=>{storeValue("Test","Val")}).catch(()=>{apiCall("TestingURL")})'
function mainFunc(liquidjs) {
  // return arr.map((x) => submain());
  // let str = `showAlert("Test").then(()=>{storeValue("Test","Val")}).catch(()=>{apiCall("TestingURL")})`;
  return submain(extractChainedFunctions(liquidjs));
}
// then : [{
//   "functionName": "apiCall",
//   "arguments": [
//       "TestingURL"
//   ]
// },
// {}
// ]
function submain(obj) {
  // TODO :Currently Taking 0 index for then and catch
  // later onSuccess and Failure can have multiple functions
  console.log(obj);

  return {
    ...createCompnentSchemaFromFunctionBlock(obj.main[0]),
    onSuccess: createCompnentSchemaFromFunctionBlock(obj.then[0]),
    onFailure:
      obj.catch.length > 0
        ? createCompnentSchemaFromFunctionBlock(obj.catch[0])
        : {}
  };
}

// {
//   "functionName": "apiCall",
//   "params": [
//       "TestingURL"
//   ]
// },
function createCompnentSchemaFromFunctionBlock(functionBlock) {
  // Expected Output
  // {
  //   "type": "showAlert",
  //   "modal": "",
  //   "navigateUrl": "",
  //   "alertMessage": "Alert Msg",
  //   "javascript": "",
  //   "storeKey": "",
  //   "storeValue": ""
  // },

  if (!functionBlock?.functionName) {
    return;
  }

  let output = {
    type: functionBlock.functionName,
    modal: "",
    navigateUrl: "",
    alertMessage: "",
    javascript: "",
    storeKey: "",
    storeValue: ""
  };
  switch (functionBlock.functionName) {
    case "showAlert":
      output.alertMessage = functionBlock.params[0];
      break;
    case "storeValue":
      output.storeKey = functionBlock.params[0]; //As key will be at index 0
      output.storeValue = functionBlock.params[1]; //As key will be at index 0

    default:
      break;
  }
  return output;
}
