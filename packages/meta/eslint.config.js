import prettier from 'eslint-config-prettier';
import nPlugin from "eslint-plugin-n";
import { includeIgnoreFile } from '@eslint/compat';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
const gitignorePath = fileURLToPath(new URL('../../.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
    // We seem to need a ts.config.<anything> here, otherwise eslint complains that @typescript-eslint (as used below) is unknown.
    ts.configs.base,
    // The "n" plugin contains all kind of import rules
    nPlugin.configs["flat/recommended-module"],
    {
        "rules": { 
            // Extra rule to find missing "type" in imports
            "@typescript-eslint/consistent-type-imports": "error",
            // catches missing.js extension in import
            "n/no-missing-import": "error",
            /** Below are the ts.configs.recommendedTypeChecked rules as defined in
             *  https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/recommended-type-checked.ts 
             *  
             *  TODO Turn these rules on and fix the problems they show
             */
            // '@typescript-eslint/await-thenable': 'error',
            // '@typescript-eslint/ban-ts-comment': 'error',
            // 'no-array-constructor': 'off',
            // '@typescript-eslint/no-array-constructor': 'error',
            // '@typescript-eslint/no-array-delete': 'error',
            // '@typescript-eslint/no-base-to-string': 'error',
            // '@typescript-eslint/no-duplicate-enum-values': 'error',
            // '@typescript-eslint/no-duplicate-type-constituents': 'error',
            // '@typescript-eslint/no-empty-object-type': 'error',
            // '@typescript-eslint/no-explicit-any': 'error',
            // '@typescript-eslint/no-extra-non-null-assertion': 'error',
            // '@typescript-eslint/no-floating-promises': 'error',
            // '@typescript-eslint/no-for-in-array': 'error',
            // 'no-implied-eval': 'off',
            // '@typescript-eslint/no-implied-eval': 'error',
            // '@typescript-eslint/no-misused-new': 'error',
            // '@typescript-eslint/no-misused-promises': 'error',
            // '@typescript-eslint/no-namespace': 'error',
            // '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            // '@typescript-eslint/no-redundant-type-constituents': 'error',
            // '@typescript-eslint/no-require-imports': 'error',
            // '@typescript-eslint/no-this-alias': 'error',
            // '@typescript-eslint/no-unnecessary-type-assertion': 'error',
            // '@typescript-eslint/no-unnecessary-type-constraint': 'error',
            // '@typescript-eslint/no-unsafe-argument': 'error',
            // '@typescript-eslint/no-unsafe-assignment': 'error',
            // '@typescript-eslint/no-unsafe-call': 'error',
            // '@typescript-eslint/no-unsafe-declaration-merging': 'error',
            // '@typescript-eslint/no-unsafe-enum-comparison': 'error',
            // '@typescript-eslint/no-unsafe-function-type': 'error',
            // '@typescript-eslint/no-unsafe-member-access': 'error',
            // '@typescript-eslint/no-unsafe-return': 'error',
            // '@typescript-eslint/no-unsafe-unary-minus': 'error',
            // 'no-unused-expressions': 'off',
            // '@typescript-eslint/no-unused-expressions': 'error',
            // '@typescript-eslint/no-unused-vars': 'error',
            // '@typescript-eslint/no-wrapper-object-types': 'error',
            // 'no-throw-literal': 'off',
            // '@typescript-eslint/only-throw-error': 'error',
            // '@typescript-eslint/prefer-as-const': 'error',
            // '@typescript-eslint/prefer-namespace-keyword': 'error',
            // 'prefer-promise-reject-errors': 'off',
            // '@typescript-eslint/prefer-promise-reject-errors': 'error',
            // 'require-await': 'off',
            // '@typescript-eslint/require-await': 'error',
            // '@typescript-eslint/restrict-plus-operands': 'error',
            // '@typescript-eslint/restrict-template-expressions': 'error',
            // '@typescript-eslint/triple-slash-reference': 'error',
            // '@typescript-eslint/unbound-method': 'error'
        },
    },
	prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.ts', '**/*.js'],

		languageOptions: {
			parserOptions: {
				parser: ts.parser, 
                // Setting necessary to get type information from the typescript compiler for typing rules to work.
                projectService: true
			}
		}
	}
);
