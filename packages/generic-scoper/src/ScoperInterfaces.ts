import { Namespace } from "./internal.js"

/**
 * Minimal interface that a model node must implement in order to participate
 * in the generic scoping infrastructure.
 *
 * The generic scoper deliberately knows as little as possible about the
 * concrete AST implementation. It only needs to know:
 *
 * - the language concept/type represented by a node;
 * - the owner of a node, so that the scoper can walk upwards through the model.
 *
 * The type parameter T represents the common base type of all nodes
 * participating in scoping.
 */
export interface ScoperNode<T> {
    /**
     * Returns the language type name of this node.
     *
     * The returned name is used by the scoper when checking whether a node
     * conforms to a requested language type.
     */
    scoperTypeName(): string

    /**
     * Returns the containing node, or undefined when this node has no owner.
     *
     * This is used, among other things, to locate enclosing namespaces.
     */
    scoperOwner(): T | undefined
}

/**
 * A scoper node that has a name.
 *
 * Not every node participating in scoping needs to be named. Named nodes
 * can be declared in namespaces and can be candidates for reference resolution.
 */
export type ScoperNamedNode<T extends ScoperNode<T>> = T & {
    name: string
}

/**
 * Type guard for determining whether a scoper node is a named node.
 */
export function isScoperNamedNode<T extends ScoperNode<T>>(node: T): node is ScoperNamedNode<T> {
    return "name" in node
}

/**
 * Provides the language-specific information required by the generic scoper.
 *
 * The scoper itself is independent of a concrete language or AST. An
 * implementation of this interface bridges that gap by telling the scoper
 * which nodes are namespaces, which built-in nodes exist, and how language
 * types relate to one another.
 */
export interface ScoperLanguage<T extends ScoperNode<T>> {
    /**
     * Returns whether the given node acts as a namespace.
     *
     * Namespace nodes introduce a scope in which named nodes can be declared
     * and from which other namespaces may be reached.
     */
    isNamespace(node: T): boolean

    /**
     * Returns the named nodes that are implicitly available in the language.
     *
     * Built-in nodes do not need to be declared explicitly in the model.
     */
    builtInNodes(): ScoperNamedNode<T>[]

    /**
     * Returns whether the given node conforms to the requested language type.
     *
     * This operation is language-specific because the generic scoper does not
     * know about inheritance, interfaces, subtyping, or other type relations
     * defined by the language.
     */
    conformsToType(element: T, requestedType: string): boolean
}

/**
 * Provides the nodes that are declared directly in a namespace.
 *
 * Declaration lookup is kept behind this interface because the generic
 * scoper does not make assumptions about how declarations are represented
 * or stored in a concrete AST.
 */
export interface DeclaredNodeProvider<T extends ScoperNode<T>> {
    /**
     * Returns the named nodes declared in the given namespace.
     *
     * @param namespace  Namespace whose declarations should be returned.
     * @param publicOnly When true, only declarations visible outside the
     *                   namespace should be returned.
     */
    getDeclaredNodes(namespace: Namespace<T>, publicOnly: boolean): Set<ScoperNamedNode<T>>
}

/**
 * Represents an unresolved reference used by the scoper while calculating
 * namespace visibility.
 *
 * It contains only the information required for scoping and intentionally
 * does not contain or resolve a concrete model-reference object. This keeps
 * the generic scoper independent of a particular AST/reference implementation
 * and prevents recursive reference resolution while scopes are being built.
 */
export interface ScoperReference {
    /**
     * Discriminator used to distinguish scoper references from other values.
     */
    kind: "reference"

    /**
     * Qualified name of the referenced node, represented as its individual
     * path segments.
     */
    pathname: string[]

    /**
     * Language type that the resolved node must conform to.
     */
    typeName: string
}

/**
 * Type guard for determining whether an arbitrary value is a
 * ScoperReference.
 */
export function isScoperReference(value: unknown): value is ScoperReference {
    return typeof value === "object" && value !== null && "kind" in value && value.kind === "reference"
}
