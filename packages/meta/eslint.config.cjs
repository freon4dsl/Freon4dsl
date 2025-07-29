/* eslint-env node */
module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    root: true,
    rules: {
        "@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "^_"}],
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/prefer-spread": ["off"],
        "@typescript-eslint/no-wrapper-object-types": "off",
        "@typescript-eslint/ban-types": "off"
    },
    env: {
        browser: true,
        node: true
    }
}
