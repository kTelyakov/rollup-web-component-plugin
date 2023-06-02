import fs from "fs";
import path from "path";

const ENTRY_FUNCTION_NAME = "init";

function getTemplate(inlinedCss, app) {
  return `
  function ${ENTRY_FUNCTION_NAME} (tag) {
    class MyWebComponent extends HTMLElement {
      connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = ${JSON.stringify(inlinedCss)};
        shadowRoot.appendChild(style);

        const mountPoint = document.createElement('div');
        mountPoint.setAttribute('id', 'app')
        shadowRoot.appendChild(mountPoint);
        ${app}.mount(mountPoint);
      }
    }

    // Define the custom element for the Web Component
    customElements.define(tag, MyWebComponent);
  }`;
}

export default function rollupWebComponentPlugin() {
  return {
    name: "web-component",

    generateBundle(outputOptions, bundle) {
      const { format } = outputOptions;

      // Check if the format is compatible with Web Components
      if (format !== "es" && format !== "umd") {
        console.warn(
          "[rollupWebComponentPlugin] The output format is not compatible with Web Components. Skipping..."
        );
        return;
      }

      // Get the bundle output file
      const bundleFile = Object.keys(bundle)[0];

      // Get the bundle code
      const bundleCode = bundle[bundleFile].code;
      const withUpdatedImports = bundleCode.replace(
        /(export\s*{[\s\S]*?)(};)/,
        `$1,${ENTRY_FUNCTION_NAME}$2`
      );

      // Create the Web Component wrapper code
      const wrapperCode = `${withUpdatedImports}{{PASTE_WRAPPER}}`;

      // Update the bundle code with the Web Component wrapper code
      bundle[bundleFile].code = wrapperCode;
    },

    writeBundle(options, bundle) {
      const bundles = Object.keys(bundle);
      const cssFileName = bundles.find((key) => key.endsWith(".css"));
      const entrySourceName = Object.keys(bundle)[0];
      const entrySource = bundle[entrySourceName]?.code;
      const cssSource = bundle[cssFileName]?.source;

      if (cssSource && entrySource) {
        const match = entrySource.match(/export\s*{\s*(\w+)\s+as\s+app\s*,/);
        const appVariable = match?.[1];
        const output = entrySource.replace(
          "{{PASTE_WRAPPER}}",
          getTemplate(cssSource, appVariable)
        );

        // Read the file content
        const bundledEntryFilePath =
          path.resolve() + "/dist/" + entrySourceName;

        // // Write the modified content back to the output file
        fs.writeFileSync(bundledEntryFilePath, output, "utf-8");
      }
    },
  };
}
