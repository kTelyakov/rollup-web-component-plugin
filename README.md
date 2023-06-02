# rollup-web-component-plugin

<p align="center"><img width="400px" alt="rollup-web-component-plugin" src="https://rollupjs.org/rollup-logo.svg" width="100%">
</p>

# **rollup-web-component-plugin**

💻 Wrap your widget or microfrontend into isolated web component!

This package will wrap your app into web component. 
Automatically inlined all styles from your app into shadow root.
Render your app into isolated shadow dom


## Usage
1. Install rollup-web-component-plugin using `npm install --save-dev rollup-web-component-plugin`
2. import plugin `import rollupWebComponentPlugin from 'rollupWebComponentPlugin'`
3. add to your config into plugins section `plugins: [rollupWebComponentPlugin()]`
4. Now, your package export init function )
5. In the place, when you will use your library - you will import { init } from 'myLibrary'
6. init('my-web-component')
7. Paste in your app <my-web-component></my-web-component>
8. Done

## Contributing
We'd love for you to contribute to rollup-web-component-plugin! Here's how:

1. Fork the repository
2. Clone your fork to your local machine
3. Create a new branch
4. Make your changes
5. Commit your changes and push to your fork
6. Create a pull request to the repository