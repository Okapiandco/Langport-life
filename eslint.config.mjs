// ESLint v9 flat config.
// `eslint-config-next/core-web-vitals` is a flat-config array (Next 15+/16)
// that bundles eslint-plugin-react, react-hooks, jsx-a11y, import, typescript-eslint,
// and @next/eslint-plugin-next core-web-vitals rules.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextCoreWebVitals,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "next-env.d.ts",
      "scripts/**", // one-off operational scripts; lint separately if/when stabilised
    ],
  },
];

export default config;
