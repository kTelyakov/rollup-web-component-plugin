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

    customElements.define(tag, MyWebComponent);
  }`;
}

export default function rollupWebComponentPlugin() {
  return {
    name: "web-component",

    generateBundle(outputOptions, bundle) {
      const { format } = outputOptions;

      if (format !== "es" && format !== "umd") {
        console.warn(
          "[rollupWebComponentPlugin] The output format is not compatible with Web Components. Skipping..."
        );
        return;
      }

      const bundleFile = Object.keys(bundle)[0];

      const bundleCode = bundle[bundleFile].code;
      const withUpdatedImports = bundleCode.replace(
        /(export\s*{[\s\S]*?)(};)/,
        `$1,${ENTRY_FUNCTION_NAME}$2`
      );

      const wrapperCode = `${withUpdatedImports}{{PASTE_WRAPPER}}`;
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

        const bundledEntryFilePath =
          path.resolve() + "/dist/" + entrySourceName;

        fs.writeFileSync(bundledEntryFilePath, output, "utf-8");
      }
    },
  };
}
