/**
 * To be used as argument for JSON.stringify, so it will print Maps as a string (the default ignores maps)
 *
 * @param key
 * @param value
 */
function runtimeReplacer(key: string, value: any) {
    if (key === "declaration") {
        return "REF-" + value?.declaration?.name;
    }
    if (value instanceof Map) {
        return Array.from(value.entries());
    }
    return value;
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key: string, value: any) => {
        if (key === "$$owner" || key === "$$propertyName" || key === "$$propertyIndex") {
            return undefined;
        }
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return "SELF";
            }
            seen.add(value);
        }
        return runtimeReplacer(key, value);
    };
};

/**
 * stringify that will never get into a loop.
 * @param object
 * @param indent
 */
export function jsonAsString(object: any, indent?: number) {
    return JSON.stringify(object, getCircularReplacer(), indent);
}
