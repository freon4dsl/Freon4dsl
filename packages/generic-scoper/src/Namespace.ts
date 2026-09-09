/**
 * Class Namespace is a wrapper for a model node that is a namespace (as defined in the scoper definition).
 * It provides the implementation of the algorithm used to search for all names that are visible in the namespace.
 */

/* TODO This code is not adapted to resolving a FreNodeReference that has as pathname a fully qualified name which contains
    '<anonymous>'. This situation might occur when there is a namespace whose 'target' does not have a name, i.e. it is not a FreNamedNode.
*/

/*
To clarify the algorithm, we include the pseudocode for this class.
Namespace {
    getDeclaredNodes(publicOnly: boolean): FreNamedNode[] {
        return all AST nodes in the subtree of which this namespace is the top,
        and the leaves are AST nodes that are themselves namespaces.
        The parameter 'publicOnly' indicates whether to include AST nodes that are marked private.
    }
    getParentNodes(): FreNamedNode[] {
        THIS.parentNamespace.getVisibleNodes();
    }
    getImportedNodes(list: NamespaceInfo[]): FreNamedNode[] {
        list.forEach(import => {
            import.namespace.getDeclaredNodes(PUBLIC_ONLY)
        plus
            if (import is recursive) {
                import.namespace.getImportedNodes(import.namespace.imports)
            }
        })
    }
    getAlternativeNodes(): FreNamedNode[] {
            getDeclaredNodes(ALL) plus
            getImportedNodes(THIS.alternatives)
    }
    getVisibleNodes(): FreNamedNode[] {
        if (has replacement) then
            getAlternativeNodes()
        else
            getDeclaredNodes(ALL) plus
            getParentNodes() plus
            getImportedNodes(THIS.imports)
        endif
    }
}

*/

import { isNullOrUndefined, notNullOrUndefined } from "./SimpleUtils.js";
import type { CompositeScoper } from './CompositeScoper.js';
import { resolvePathStartingInNamespace } from './ScoperUtil.js';
import type { NamespaceInfo } from './NamespaceInfo.js';
import {
    type DeclaredNodeProvider,
    type ScoperNamedNode,
    type ScoperNode,
    type ScoperReference,
    isScoperNamedNode,
    isScoperReference,
} from "./internal.js"
import type { NamespaceRegistry } from "./internal.js"

export const PUBLIC_AND_PRIVATE: boolean = false;
export const PUBLIC_ONLY: boolean = true;

/**
 * Represents a model node that acts as a namespace during scoping.
 *
 * Namespace is a wrapper around a model node. It provides the namespace-specific
 * behavior needed by the generic scoping algorithm, such as collecting declared,
 * imported, inherited, and alternative visible nodes.
 *
 * Namespace instances are created and managed by NamespaceRegistry, which ensures
 * that the same model node is represented by the same Namespace instance.
 *
 * The type parameter T represents the common base type of all nodes
 * participating in scoping.
 */
export class Namespace<T extends ScoperNode<T>> {
    /**
     * The model node represented by this namespace.
     */
    public readonly target: T

    /**
     * Registry used to obtain Namespace wrappers for other model nodes.
     */
    private readonly registry: NamespaceRegistry<T>

    /**
     * Provides the named nodes declared directly in a namespace.
     */
    private readonly declaredNodeProvider: DeclaredNodeProvider<T>

    constructor(target: T, registry: NamespaceRegistry<T>, declaredNodeProvider: DeclaredNodeProvider<T>) {
        this.target = target
        this.registry = registry
        this.declaredNodeProvider = declaredNodeProvider
    }

    /**
     * Returns the named nodes declared directly in this namespace.
     *
     * When publicOnly is true, only declarations that are visible outside
     * the namespace are returned.
     *
     * @param publicOnly Whether private declarations should be excluded.
     */
    public getDeclaredNodes(publicOnly: boolean): Set<ScoperNamedNode<T>> {
        return this.declaredNodeProvider.getDeclaredNodes(this, publicOnly)
    }

    /**
     * Returns all named nodes visible in the parent namespace of this namespace.
     *
     * The complete set of visible nodes from the parent namespace is included,
     * not only the nodes declared directly in that namespace.
     *
     * A parent namespace that has already been visited is ignored to prevent
     * cycles while calculating visibility.
     *
     * @param mainScoper Composite scoper used to calculate visibility.
     * @param visitedNamespaces Namespaces already visited during this calculation.
     */
    public getParentNodes(mainScoper: CompositeScoper<T>, visitedNamespaces: Namespace<T>[]): ScoperNamedNode<T>[] {
        const parentNamespace: Namespace<T> | undefined = this.findParentNamespace(this, mainScoper)
        const result: Set<ScoperNamedNode<T>> = new Set()

        if (notNullOrUndefined(parentNamespace) && !visitedNamespaces.includes(parentNamespace)) {
            /*
             * Include all nodes visible from the parent, not only the nodes
             * declared directly in it.
             *
             * There is no need to add parentNamespace to visitedNamespaces here;
             * parentNamespace.getVisibleNodes() does that itself.
             */
            parentNamespace.getVisibleNodes(mainScoper, visitedNamespaces, PUBLIC_AND_PRIVATE).forEach((node) => result.add(node))
        }

        return Array.from(result)
    }

    /**
     * Returns all named nodes made visible by namespace imports.
     *
     * Direct namespace imports are processed first. Imports expressed through
     * ScoperReferences are resolved afterwards, because their resolution may
     * depend on nodes contributed by the direct imports.
     *
     * Reference-based imports are resolved iteratively until either all imports
     * have been resolved or no further progress can be made.
     *
     * @param mainScoper Composite scoper used to resolve namespace imports.
     * @param visitedNamespaces Namespaces already visited during this calculation.
     * @param resultSoFar Visible nodes collected so far. Newly imported nodes are
     *                    added to this set and may be used to resolve later imports.
     */
    public getImportedNodes(mainScoper: CompositeScoper<T>, visitedNamespaces: Namespace<T>[], resultSoFar: Set<ScoperNamedNode<T>>): ScoperNamedNode<T>[] {
        const imports: NamespaceInfo<T>[] = mainScoper.importedNamespaces(this.target)

        /*
         * First process imports that directly identify a namespace node.
         *
         * These may contribute nodes that are needed later to resolve
         * reference-based imports.
         */
        imports.forEach((namespaceInfo) => {
            const target = namespaceInfo.target

            if (notNullOrUndefined(target) && !isScoperReference(target)) {
                this.internalAddSingleImport(mainScoper, target, visitedNamespaces, resultSoFar, namespaceInfo.recursive).forEach((node) =>
                    resultSoFar.add(node),
                )
            }
        })

        /*
         * Collect imports represented by references.
         */
        let unresolvedImports: NamespaceInfo<T>[] = imports.filter((namespaceInfo) => isScoperReference(namespaceInfo.target))

        /*
         * Repeatedly try to resolve reference-based imports.
         *
         * Resolving one import may add new visible nodes, which in turn may make
         * another import resolvable during the next iteration.
         */
        while (unresolvedImports.length > 0) {
            const resolvedImports: NamespaceInfo<T>[] = []
            unresolvedImports.forEach((namespaceInfo) => {
                if (isScoperReference(namespaceInfo.target)) {
                    const node = this.findInResultSoFar(mainScoper, namespaceInfo.target, resultSoFar)
                    if (notNullOrUndefined(node)) {
                        this.internalAddSingleImport(mainScoper, node, visitedNamespaces, resultSoFar, namespaceInfo.recursive).forEach((importedNode) =>
                            resultSoFar.add(importedNode),
                        )
                        resolvedImports.push(namespaceInfo)
                    }
                }
            })

            if (resolvedImports.length === 0) {
                /*
                 * No progress was made, so the remaining imports cannot currently
                 * be resolved.
                 */
                const referenceSeparator = "##" // TODO get value from .edit file
                console.error(
                    `getImportedNodes: cannot resolve imported namespaces for ${
                        isScoperNamedNode(this.target) ? this.target.name : this.target.scoperTypeName()
                    } => ${unresolvedImports.map((namespaceInfo) =>
                        isScoperReference(namespaceInfo.target)
                            ? namespaceInfo.target.pathname.join(referenceSeparator)
                            : isScoperNamedNode(namespaceInfo.target)
                              ? namespaceInfo.target.name
                              : namespaceInfo.target.scoperTypeName(),
                    )}`,
                )
                break
            }
            unresolvedImports = unresolvedImports.filter((namespaceInfo) => !resolvedImports.includes(namespaceInfo))
        }
        return Array.from(resultSoFar)
    }

    /**
     * Returns all named nodes made visible through alternative namespaces.
     *
     * Alternative namespaces are resolved relative to the parent namespace of
     * this namespace. The declarations of this namespace itself are always
     * included first.
     *
     * Each alternative may either directly identify a namespace node or refer
     * to one through a ScoperReference. When the alternative is recursive,
     * imported namespaces of that alternative are included as well.
     *
     * @param mainScoper Composite scoper used to resolve alternative namespaces.
     * @param visitedNamespaces Namespaces already visited during this calculation.
     */
    public getAlternativeNodes(mainScoper: CompositeScoper<T>, visitedNamespaces: Namespace<T>[]): ScoperNamedNode<T>[] {
        const alternatives: NamespaceInfo<T>[] = mainScoper.alternativeNamespaces(this.target)
        const resultSoFar: Set<ScoperNamedNode<T>> = this.getDeclaredNodes(PUBLIC_AND_PRIVATE)
        alternatives.forEach((namespaceInfo) => {
            const target = namespaceInfo.target
            if (isNullOrUndefined(target)) {
                return
            }
            const parentNamespace: Namespace<T> | undefined = this.findParentNamespace(this, mainScoper)
            if (isNullOrUndefined(parentNamespace)) {
                return
            }
            const visibleInParent = new Set<ScoperNamedNode<T>>(parentNamespace.getVisibleNodes(mainScoper, [], PUBLIC_AND_PRIVATE))
            if (isScoperReference(target)) {
                /*
                 * A reference used as an alternative namespace must be resolvable
                 * from the parent namespace of this namespace.
                 */
                const resolvedNode = resolvePathStartingInNamespace(
                    this,
                    parentNamespace,
                    target.pathname,
                    mainScoper,
                    target.typeName,
                    this.registry,
                    mainScoper.scoperLanguage,
                )
                if (isNullOrUndefined(resolvedNode)) {
                    console.error(
                        `Namespace defined via reference '${target.pathname.join(".")}' ` +
                            `must be resolvable in the parent namespace of ` +
                            `'${isScoperNamedNode(this.target) ? this.target.name : this.target.scoperTypeName()}'.`,
                    )
                    return
                }
                this.internalAddSingleImport(mainScoper, resolvedNode, visitedNamespaces, visibleInParent, namespaceInfo.recursive).forEach((node) =>
                    resultSoFar.add(node),
                )
            } else {
                this.internalAddSingleImport(mainScoper, target, visitedNamespaces, visibleInParent, namespaceInfo.recursive).forEach((node) =>
                    resultSoFar.add(node),
                )
            }
        })
        return Array.from(resultSoFar)
    }

    /**
     * Returns all named nodes visible from this namespace.
     *
     * Visibility is calculated in the following order:
     *
     * 1. If alternative namespaces are defined, visibility is determined through
     *    those alternatives.
     * 2. Otherwise, declarations from this namespace are included first.
     * 3. Visible nodes from the parent namespace are then added.
     * 4. Finally, nodes contributed by imported namespaces are added.
     *
     * The visitedNamespaces parameter is used to prevent cycles while traversing
     * namespace relationships.
     *
     * @param mainScoper Composite scoper used to calculate visibility.
     * @param visitedNamespaces Namespaces already visited during this calculation.
     * @param publicOnly Whether private declarations from this namespace should
     *                   be excluded.
     */
    public getVisibleNodes(mainScoper: CompositeScoper<T>, visitedNamespaces: Namespace<T>[], publicOnly: boolean): ScoperNamedNode<T>[] {
        // console.log(
        //     `Namespace.getVisibleNodes: ${
        //         isScoperNamedNode(this.target)
        //             ? this.target.name
        //             : this.target.scoperTypeName()
        //     }`,
        // )
        visitedNamespaces.push(this)
        const alternatives: NamespaceInfo<T>[] = mainScoper.alternativeNamespaces(this.target)
        if (alternatives.length > 0) {
            return this.getAlternativeNodes(mainScoper, visitedNamespaces)
        }
        /*
         * Start with the nodes declared directly in this namespace.
         */
        const resultSoFar: Set<ScoperNamedNode<T>> = this.getDeclaredNodes(publicOnly)
        // console.log(
        //     `  declared nodes: [${Array.from(resultSoFar)
        //         .map((node) => node.name)
        //         .join(", ")}]`,
        // )
        /*
         * Add everything visible from the parent namespace.
         */
        this.getParentNodes(mainScoper, visitedNamespaces).forEach((node) => resultSoFar.add(node))
        /*
         * Add nodes contributed through namespace imports.
         */
        this.getImportedNodes(mainScoper, visitedNamespaces, resultSoFar).forEach((node) => resultSoFar.add(node))
        return Array.from(resultSoFar)
    }

    /**
     * Adds the nodes contributed by a single imported namespace.
     *
     * The declarations of the imported namespace are always added as public-only
     * declarations. When recursive is true, nodes contributed by that namespace's
     * own imports are included as well.
     *
     * Namespaces that have already been visited are skipped to prevent cycles.
     *
     * @param mainScoper Composite scoper used to resolve recursive imports.
     * @param namespaceNode Model node representing the imported namespace.
     * @param visitedNamespaces Namespaces already visited during this calculation.
     * @param resultSoFar Visible nodes collected so far.
     * @param recursive Whether imports of the imported namespace should also be followed.
     */
    private internalAddSingleImport(
        mainScoper: CompositeScoper<T>,
        namespaceNode: T,
        visitedNamespaces: Namespace<T>[],
        resultSoFar: Set<ScoperNamedNode<T>>,
        recursive: boolean,
    ): Set<ScoperNamedNode<T>> {
        if (isScoperReference(namespaceNode)) {
            throw new Error(`ScoperReference reached internalAddSingleImport: ${namespaceNode.pathname}`)
        }
        const result: Set<ScoperNamedNode<T>> = new Set<ScoperNamedNode<T>>()
        const importedNamespace = this.registry.getOrCreate(namespaceNode)
        if (!visitedNamespaces.includes(importedNamespace)) {
            importedNamespace.getDeclaredNodes(PUBLIC_ONLY).forEach((node) => result.add(node))
            if (recursive) {
                importedNamespace.getImportedNodes(mainScoper, visitedNamespaces, resultSoFar).forEach((node) => result.add(node))
            }
            visitedNamespaces.push(importedNamespace)
        }
        return result
    }

    /**
     * Finds the nearest parent namespace of the given namespace.
     *
     * Starting at the owner of the namespace's target node, the owner hierarchy
     * is followed until a node that represents a namespace is found.
     *
     * Returns undefined when no parent namespace exists.
     *
     * @param child Namespace whose parent namespace should be found.
     * @param mainScoper Composite scoper providing language-specific namespace information.
     */
    private findParentNamespace(child: Namespace<T>, mainScoper: CompositeScoper<T>): Namespace<T> | undefined {
        let owner: T | undefined = child.target.scoperOwner()
        while (notNullOrUndefined(owner)) {
            if (mainScoper.scoperLanguage.isNamespace(owner)) {
                return this.registry.getOrCreate(owner)
            }
            owner = owner.scoperOwner()
        }
        return undefined
    }

    /**
     * Resolves a ScoperReference against the nodes collected so far.
     *
     * The first pathname segment is searched directly in foundSoFar. If the
     * reference contains additional path segments, the first resolved node must
     * represent a namespace. Resolution then continues from that namespace for
     * the remainder of the path.
     *
     * @param mainScoper Composite scoper used for namespace and type information.
     * @param reference Reference that should be resolved.
     * @param foundSoFar Named nodes available for resolving the first path segment.
     */
    private findInResultSoFar(mainScoper: CompositeScoper<T>, reference: ScoperReference, foundSoFar: Set<ScoperNamedNode<T>>): ScoperNamedNode<T> | undefined {
        let result: ScoperNamedNode<T> | undefined
        const pathname = reference.pathname

        /*
         * Resolve the first segment of the path from the nodes already visible.
         */
        foundSoFar.forEach((node) => {
            if (node.name === pathname[0]) {
                result = node
            }
        })

        /*
         * If the path contains more than one segment, the first resolved node
         * must represent a namespace. Continue resolving the remaining segments
         * from that namespace.
         */
        if (pathname.length > 1 && notNullOrUndefined(result) && mainScoper.scoperLanguage.isNamespace(result)) {
            const currentNamespace: Namespace<T> = this.registry.getOrCreate(result)

            result = resolvePathStartingInNamespace(
                this,
                currentNamespace,
                pathname.slice(1),
                mainScoper,
                reference.typeName,
                this.registry,
                mainScoper.scoperLanguage,
            )
        }

        return result
    }
}
