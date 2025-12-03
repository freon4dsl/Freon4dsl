// tests/testPath.ts
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

/**
 * Resolves an absolute path to a test data subfolder.
 *
 * @param currentModuleUrl Always pass `import.meta.url` from the test file.
 *   It is the full file URL of the module being executed, and will differ
 *   for each test file. This ensures the correct base folder is used.
 * @param subfolder Name of the subfolder containing test files (relative to the test file's folder).
 * @returns Absolute path to the requested subfolder.
 */
export function resolveTestDir(currentModuleUrl: string, subfolder: string): string {
	const __filename = fileURLToPath(currentModuleUrl);
	const __dirname = dirname(__filename);
	return join(__dirname, subfolder);
}

/**
 * Resolves a relative output directory path for a test.
 *
 * @param currentModuleUrl Always pass `import.meta.url` from the test file.
 *   It is the full file URL of the module being executed, and will differ
 *   for each test file.
 * @param subfolder Name of the output folder (relative to the test file's folder).
 * @returns A relative path string (with `/` separators) suitable for createDirIfNotExisting.
 */
export function resolveOutDir(currentModuleUrl: string, subfolder: string): string {
	const __filename = fileURLToPath(currentModuleUrl);
	const __dirname = dirname(__filename);

	// Absolute target folder
	const absOutDir = join(__dirname, subfolder);

	// Make it relative to the project’s current working directory, with forward slashes
	let rel = relative(process.cwd(), absOutDir).replace(/\\/g, "/");

	// Preserve trailing slash if caller passed one
	if (subfolder.endsWith("/") && !rel.endsWith("/")) {
		rel += "/";
	}
	return rel;
}

/**
 * Resolves the absolute path to an AST definition file located in a sibling folder
 * (e.g. `commonAstFiles`) next to the test folder.
 *
 * Example folder layout:
 *   src/__tests__/scoper-tests/mytest.test.ts
 *   src/__tests__/commonAstFiles/test-language.ast
 *
 * Usage in mytest.test.ts:
 *   const astPath = resolveAstFile(import.meta.url, "../commonAstFiles", "test-language.ast");
 *   const language = new LanguageParser().parse(astPath);
 *
 * @param currentModuleUrl Always pass `import.meta.url` from the test file.
 * @param subfolder Relative path from the test file’s folder to the AST files folder
 *   (for a sibling folder, prefix with "../").
 * @param filename The AST file name, e.g. "test-language.ast".
 * @returns Absolute path to the AST file.
 */
export function resolveAstFile(
	currentModuleUrl: string,
	subfolder: string,
	filename: string
): string {
	return join(resolveTestDir(currentModuleUrl, subfolder), filename);
}
