import js from "@eslint/js";
import snakecasejs from "eslint-plugin-snakecasejs";

export default [
  {
    ignores: ["node_modules/**", "coverage/**", "dist/**"],
  },
  {
    files: ["**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        process: "readonly",
      },
    },
    plugins: {
      snakecasejs,
    },
    settings: {
      "snakecasejs/filter": ["NewExpression", "ClassDeclaration"],
      "snakecasejs/whitelist": [
        "externalPath",
        "setNumber",
        "NewPageClass",
      ],
    },
    rules: {
      "snakecasejs/snakecasejs": [
        "warn",
        {
          ignore: ["^connection", "^channel", "^process.env."],
        },
      ],
      semi: ["warn", "always"],
      "one-var": "off",
      "no-unused-vars": "warn",
      "prefer-const": "off",
      quotes: [
        "warn",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: false,
        },
      ],
      "snakecasejs/property-case": "off",
    },
  },
];
