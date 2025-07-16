import type { FreNode } from "../ast/index.js"
import { FreLanguage } from "../language/index.js"

/**
 * Generate a string with graphviz dot code representing the tree for which `node` is the root.
 * @param node
 */
export function ast2dot(node: FreNode): string {
    return `
digraph {
    ${ast2dotRecursive(node)}
}`
}

/**
 * Generate a string with graphviz dot code representing the tree for which `node` is the root.
 * @param node
 */
function ast2dotRecursive(node: FreNode): string {
    const isNS = FreLanguage.getInstance().classifier(node.freLanguageConcept()).isNamespace
     let index= 1
     const hasNameProp = Array.from(FreLanguage.getInstance().classifier(node.freLanguageConcept())
         .properties).filter(prop => prop[1].propertyKind === "primitive" && prop[1].name === "name").length > 0 
     const name = (hasNameProp ? node["name"] : node.freId())
    return `    "${node.freId()}" ${(isNS ? ` [peripheries=2, label="${name}\n${node.freLanguageConcept()}"]` : `[label="${name}\n${node.freLanguageConcept()}"]`)}
      ${children(node).map(ch => `"${node.freId()}" -> "${ch.freId()}" [minlen=${index++}]`).join("\n")}
      ${children(node).map(ch => `${ast2dotRecursive(ch)}`).join("\n")}
    `
}

/**
 * Find all children of `node`.
 * Needs to use the language info in FreLanguage, as there is no _children()_ getter in FreNode.
 * @param node
 */
function children(node: FreNode): FreNode[] {
    const partProperties =
    Array.from(FreLanguage.getInstance().classifier(node.freLanguageConcept())
        .properties).filter(prop => prop[1].propertyKind === "part")
        .map(p => p[1])
    return partProperties.flatMap(pp => node[pp.name])
}
