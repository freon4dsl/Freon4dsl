import { isNullOrUndefined } from "./SimpleUtils.js"
import {
    Namespace,
    type ScoperLanguage,
    type ScoperNamedNode,
    type CompositeScoper,
    NamespaceRegistry,
    type ScoperNode,
} from "./internal.js"

/**
 * Utility functions used by the generic scoping implementation.
 *
 * These functions contain reusable algorithms for locating namespaces,
 * resolving qualified paths, and finding visible nodes.
 */

/**
 * Finds the namespace containing the given node.
 *
 * If the node itself represents a namespace, that namespace is returned.
 * Otherwise the owner hierarchy is followed until a namespace is found.
 *
 * Returns undefined when the node has no enclosing namespace.
 *
 * @param node Node for which the enclosing namespace should be found.
 * @param registry Registry containing all known namespaces.
 * @param scoperLanguage Language-specific information used to determine
 *                       whether a node represents a namespace.
 */
export function findEnclosingNamespace<T extends ScoperNode<T>>(
    node: T | undefined,
    registry: NamespaceRegistry<T>,
    scoperLanguage: ScoperLanguage<T>,
): Namespace<T> | undefined {
    if (isNullOrUndefined(node)) {
        return undefined
    }

    // console.log(`findEnclosingNamespace: ${node.scoperTypeName()}`)

    if (scoperLanguage.isNamespace(node)) {
        // console.log(`  found namespace: ${node.scoperTypeName()}`)
        return registry.getOrCreate(node)
    }

    return findEnclosingNamespace(
        node.scoperOwner(),
        registry,
        scoperLanguage,
    )
}

/**
 * Resolves a qualified pathname starting in the given namespace.
 *
 * Every pathname segment except the last must resolve to a namespace.
 * The final segment may resolve to any named node, but must conform to
 * the requested type.
 *
 * The first pathname segment must be visible in currentNamespace.
 * Visibility of private declarations depends on whether currentNamespace
 * is the same namespace as baseNamespace.
 *
 * @param baseNamespace Namespace in which the complete pathname is being
 *                      resolved. Used to determine whether private nodes
 *                      are visible.
 * @param currentNamespace Namespace in which the next pathname segment
 *                         should be resolved.
 * @param pathname Remaining pathname segments to resolve.
 * @param mainScoper Composite scoper used to calculate visible nodes.
 * @param typeName Language type that the final resolved node must conform to.
 * @param registry Registry containing all known namespaces.
 * @param scoperLanguage Language-specific information required during
 *                       namespace and type checks.
 */
export function resolvePathStartingInNamespace<T extends ScoperNode<T>>(
    baseNamespace: Namespace<T>,
    currentNamespace: Namespace<T>,
    pathname: string[],
    mainScoper: CompositeScoper<T>,
    typeName: string,
    registry: NamespaceRegistry<T>,
    scoperLanguage: ScoperLanguage<T>,
): ScoperNamedNode<T> | undefined {
    // console.log(`resolve path: ${pathname.join(".")} as ${typeName}`)

    let result: ScoperNamedNode<T> | undefined

    for (let index = 0; index < pathname.length; index++) {
        const publicOnly = baseNamespace !== currentNamespace
        const currentName = pathname[index]

        // console.log(`  resolving '${currentName}'`)

        if (index !== pathname.length - 1) {
            /*
             * Every intermediate pathname segment must resolve to a namespace.
             *
             * typeName is deliberately not used here because the intermediate
             * result is only required to be a namespace, regardless of the
             * requested type of the final result.
             */
            result = getFromVisibleNodes(
                currentNamespace,
                currentName,
                mainScoper,
                publicOnly,
            )

            // TODO:
            // If a namespace may contain multiple nodes with the same name but
            // different types, this lookup needs to be adjusted.

            if (
                isNullOrUndefined(result) ||
                !scoperLanguage.isNamespace(result)
            ) {
                // console.log(`  '${currentName}' does not resolve to a namespace`)
                return undefined
            }

            /*
             * The result represents the next namespace in the path.
             * Convert the node into its Namespace representation.
             */
            currentNamespace = registry.getOrCreate(result)
        } else {
            /*
             * The final pathname segment need not resolve to a namespace.
             * It must, however, conform to the requested type.
             */
            result = getFromVisibleNodes(
                currentNamespace,
                currentName,
                mainScoper,
                publicOnly,
                typeName,
            )
        }
    }

    return result
}

/**
 * Finds a visible node with the given name in the specified namespace.
 *
 * Built-in nodes are considered visible in addition to nodes contributed
 * by the namespace itself.
 *
 * When typeName is provided, the result must also conform to that
 * language type.
 *
 * @param namespace Namespace in which visibility is calculated.
 * @param name Name of the node to find.
 * @param mainScoper Composite scoper used to calculate visible nodes.
 * @param publicOnly Whether only public declarations should be considered.
 * @param typeName Optional language type that the result must conform to.
 */
export function getFromVisibleNodes<T extends ScoperNode<T>>(
    namespace: Namespace<T>,
    name: string,
    mainScoper: CompositeScoper<T>,
    publicOnly: boolean,
    typeName?: string,
): ScoperNamedNode<T> | undefined {
    // console.log(`getFromVisibleNodes: searching for '${name}', type '${typeName}'`)

    let visibleNodes: ScoperNamedNode<T>[] =
        mainScoper.scoperLanguage.builtInNodes()

    visibleNodes = visibleNodes.concat(
        namespace.getVisibleNodes(
            mainScoper,
            [],
            publicOnly,
        ),
    )

    for (const node of visibleNodes) {
        if (
            name === node.name &&
            hasCorrectType(mainScoper, node, typeName)
        ) {
            return node
        }
    }

    return undefined
}

/**
 * Determines whether the given node conforms to the requested language type.
 *
 * When no typeName is provided, every node is considered to have the
 * correct type.
 *
 * @param mainScoper Composite scoper providing language-specific type checks.
 * @param node Node whose type should be checked.
 * @param typeName Optional requested language type.
 */
export function hasCorrectType<T extends ScoperNode<T>>(
    mainScoper: CompositeScoper<T>,
    node: T,
    typeName?: string,
): boolean {
    if (typeName) {
        return mainScoper.scoperLanguage.conformsToType(
            node,
            typeName,
        )
    }

    return true
}
