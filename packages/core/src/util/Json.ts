/**
 * To be used as argument for JSON.stringify, so it will print Maps as a string (the default ignores maps)
 *
 * @param key
 * @param value
 */
function runtimeReplacer(value: any) {
    if (value instanceof Map) {
        return Array.from(value.entries());
    }
    return value;
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key: string, value: any) => {
        if (key === "$$owner" || key === "$$propertyName" || key === "$$propertyIndex" || key === "_FRE_referred") {
            return undefined;
        }
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                const nameOrId = value["id"] ?? value["name"] ?? ""
                return "<circular> " + nameOrId;
            }
            seen.add(value);
        }
        return runtimeReplacer(value);
    };
};

/**
 * stringify that will never get into a loop.
 * @param object
 * @param indent
 */
export function jsonAsString(object: any, indent?: number): string {
    return JSON.stringify(object, getCircularReplacer(), indent);
}
