import js from "@eslint/js";

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
    rules: {
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
    },
  },
];