
export type Constructor22 = new (...args: any[]) => {};

/**
 * Extends original with extension.
 *
 * @param extension
 * @param original
 */
export function extension(extension: Constructor22, original: Constructor22) {
    const extensionPrototype = extension.prototype;
    const originalPrototype = original.prototype
    for (const property of Object.getOwnPropertyNames(extensionPrototype)) {
        if (property !== "constructor") {
            console.log("Extending " + originalPrototype.constructor.name + " with property " + property);
            originalPrototype[property] = extensionPrototype[property];
        }
    }
}
