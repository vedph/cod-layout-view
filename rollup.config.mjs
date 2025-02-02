import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser"; // Optional: Minification (for production)
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts", // Entry point for your library
  output: [
    {
      file: "dist/index.js", // Output file for ES6 modules
      format: "es",
    },
    {
      file: "dist/index.cjs.min.js", // Output file for CommonJS (minified)
      format: "cjs",
      sourcemap: true,
      plugins: [terser()], // Minify for production
    },
  ],
  plugins: [
    typescript({ tsconfig: "./tsconfig.json" }), // Use your existing tsconfig.json
    commonjs(), // Convert CommonJS modules to ES6 (for GSAP),
    nodeResolve(), // Resolve node_modules
  ],
};
