import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

const config = [
  {
    input: 'index.js',
    output: {
      format: 'iife',
      file: "dist/date-fns-limited.js",
      sourcemap: true,
      name: 'DateFns'
      
    },
    plugins: [
      // The 'node-resolve' plugin allows Rollup to resolve bare module imports like
      // in `import pathToRegexp from 'path-to-regexp'`
      resolve(),
    
      // The 'commonjs' plugin allows Rollup to convert CommonJS exports on the fly
      // into ES module imports (so that `import pathToRegexp from 'path-to-regexp'`
      // works even though the exports are done via `module.exports = {}`)
      commonjs(),
      babel({
        runtimeHelpers: true,
      })]
  }];

export default config;
