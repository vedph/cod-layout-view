# CodLayoutView

Codicological layout formulas services and view web component in a framework-independent Typescript library.

- building: `npm run build`.
- testing: use VSCode extensions or just `npm run test`.

## Setup

These steps were used to build this workspace for a pure Typescript library:

1. create a new folder.
2. enter it and run `npm init`.
3. install these packages:

    ```bash
    npm i typescript

    npm i --save-dev lite-server
    npm i --save-dev concurrently

    npm i --save-dev jest
    npm i --save-dev @types/jest
    npm i --save-dev ts-jest
    ```

4. create in `.vscode` [tasks.json](./.vscode/tasks.json) for building (ctrl+shift+B in VSCode) and [launch.json](./.vscode/launch.json) for debugging:

5. add main entrypoint, script commands and exports in [package.json](package.json).

6. add [index.html](index.html) to the root to host your controls for testing, e.g.:

    ```html
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Test Component</title>
        <script type="module" src="./dist/components/mock.component.js"></script>
        <script type="module" src="./dist/services/roman-number.js"></script>
      </head>
      <body>
        <h1>Library Development Shell</h1>
        <article>
          <h2>Mock component</h2>
          <div style="border: 1px solid silver">
            <mock-component></mock-component>
          </div>
        </article>
      </body>
    </html>
    ```

    >Optionally you can also add some JS client code by adding `index.js` and importing it into this page.

7. add your code (services and components) under `src`.
8. export all the required objects from the `src/index.ts` API entrypoint.

### Lite Server

The `lite-server` does not automatically rebuild your TypeScript files when they change. It only refreshes the browser when HTML or JavaScript files change.

To have your TypeScript files automatically recompile when you make changes, you can use `tsc --watch` command. This command starts the TypeScript compiler in watch mode; the compiler watches for file changes and recompiles when it sees them.

Then, you can run `npm run watch` in a separate terminal to start the TypeScript compiler in watch mode.

However, this will not refresh your browser when your TypeScript files are recompiled. To do this, you can use a tool like `concurrently` to run both `lite-server` and `tsc --watch` at the same time, and have `lite-server` refresh the browser whenever your compiled JavaScript files change.

Once installed this Update your start script to run both commands:

```json
"scripts": {
  "start": "concurrently \"tsc --watch\" \"lite-server\""
}
```

Now, when you run `npm start`, it will start both the TypeScript compiler in watch mode and lite-server. When you make changes to your TypeScript files, they will be automatically recompiled, and `lite-server` will refresh your browser.
