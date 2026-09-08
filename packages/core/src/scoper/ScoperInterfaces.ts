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
