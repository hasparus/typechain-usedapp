module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2019,
    module: true,
    project: "./tsconfig.json",
  },
  extends: ["@hasparus"],
  ignorePatterns: ["*.js", "dist"],
  rules: {
    // Good rule, but it's a proof of concept, so we don't really care about it here
    "@typescript-eslint/restrict-template-expressions": "off",
  },
};
