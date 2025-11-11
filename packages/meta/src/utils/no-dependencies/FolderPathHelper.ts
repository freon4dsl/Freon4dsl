import * as path from 'path';

/**
 * Returns the portion of `outputFolder` that comes after the common ancestor
 * of `outputFolder` and `customFolder` (where `customFolder` is relative to `outputFolder`).
 *
 * Example:
 *  outputFolder = "src/freon"
 *  customFolder = "../custom"
 * *  → "freon/"
 *  *
 *  *  output = "a/b/c/d", custom = "../../x/y"  → "c/d/"
 *  *  output = "a/b/c",   custom = "./x/y"     → "c/"
 */
export function getOutputForUseInCustom(outputFolder: string, customFolder: string): string {
	const absOutput = path.resolve(outputFolder);
	const absCustom = path.resolve(outputFolder, customFolder);

	const outParts = path.normalize(absOutput).split(path.sep).filter(Boolean);
	const cusParts = path.normalize(absCustom).split(path.sep).filter(Boolean);

	// Find common prefix (case-sensitive)
	let i = 0;
	while (i < outParts.length && i < cusParts.length && outParts[i] === cusParts[i]) {
		i++;
	}

	// The tail of output after the common ancestor
	let tail = outParts.slice(i).join(path.sep);

	// Normalize to forward slashes for consistency
	tail = tail.replace(/\\/g, "/");

	// Ensure it ends with a '/'
	if (!tail.endsWith("/")) {
		tail += "/";
	}

	return tail;
}
