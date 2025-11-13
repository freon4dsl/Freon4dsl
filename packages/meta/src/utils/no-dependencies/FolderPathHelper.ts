import * as path from 'path';

/**
 * Combines two folder paths and returns the relative subfolder path.
 *
 * Example:
 *  outputFolder = "src/freon"
 *  customFolder = "../custom"
 *  → returns "../freon/"
 */
export function getCombinedFolderPath(outputFolder: string, customFolder: string): string {
	// Resolve both paths to absolute
	const absOutput = path.resolve(outputFolder);
	const absCustom = path.resolve(outputFolder, customFolder);

	// Compute the relative path from outputFolder to customFolder
	let relative = path.relative(absCustom, absOutput);

	// Normalize to forward slashes for consistency
	relative = relative.replace(/\\/g, "/");

	// Ensure it ends with a '/'
	if (!relative.endsWith("/")) {
		relative += "/";
	}

	return relative;
}
