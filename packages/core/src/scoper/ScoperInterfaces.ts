import type { FreOwnerDescriptor } from "../ast/index.js"
import { FreNamespace } from "./internal.js"

export interface FreScoperNode<T> {
    freLanguageConcept(): string
    freOwner(): T | undefined
    freOwnerDescriptor(): FreOwnerDescriptor | undefined
}

export type FreScoperNamedNode<T extends FreScoperNode<T>> = T & {
    name: string
}

export function isScoperNamedNode<T extends FreScoperNode<T>>(node: FreScoperNode<T>): node is FreScoperNamedNode<T> {
    return "name" in node
}

export interface FreScoperLanguage<T extends FreScoperNode<T>> {
    isNamespace(node: FreScoperNode<T>): boolean
}

export interface FreDeclaredNodeProvider<T extends FreScoperNode<T>> {
    getDeclaredNodes(namespace: FreNamespace<T>, publicOnly: boolean): Set<FreScoperNamedNode<T>>
}

/**
 * Represents an unresolved reference used by the scoper while calculating namespace visibility.
 * It contains only the information needed for scoping and intentionally does not hold or resolve
 * a model reference object. This prevents the scoper from depending on a particular AST/reference
 * implementation and avoids recursive resolution while scopes are still being constructed.
 */
export interface FreScoperReference {
    kind: "reference"
    pathname: string[]
    typeName: string
}

export function isScoperReference(value: unknown): value is FreScoperReference {
    return typeof value === "object" && value !== null && "kind" in value && value.kind === "reference"
}
