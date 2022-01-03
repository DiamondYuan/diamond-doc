import typescript from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";



const plugins = [
  typescript({
    tsconfig: 'tsconfig.json',
    tsconfigOverride: {
      compilerOptions: {
        target: "ESNext",
        "module": "ESNext",
      },
    }
  }),
  babel(),
];


export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
  ],
  plugins: plugins,
};
