export function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
    return obj == null // catches both null and undefined
}

export function notNullOrUndefined<T>(obj: T | null | undefined): obj is NonNullable<T> {
    return obj != null // catches both null and undefined
}
