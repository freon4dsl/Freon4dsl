import { AstWalker } from "../ast-utils/index.js"
import { FreLanguage } from "../language/index.js"
import type { FreNamedNode, FreNode } from "../ast/index.js"
import type { FreScoperNamedNode, FreDeclaredNodeProvider, FreNamespace } from "@freon4dsl/generic-scoper"
import { CollectDeclaredNodesWorker } from "./CollectDeclaredNodesWorker.js"

export class FreonDeclaredNodeProvider implements FreDeclaredNodeProvider<FreNode> {
    public getDeclaredNodes(namespace: FreNamespace<FreNode>, publicOnly: boolean): Set<FreScoperNamedNode<FreNode>> {
        // console.log('FreonDeclaredNodeProvider getDeclaredNodes for ', namespace.target.name, ' publicOnly', publicOnly);
        let result: FreNamedNode[] = []
        // Set up the 'worker' of the visitor pattern.
        const myNamesCollector = new CollectDeclaredNodesWorker()
        myNamesCollector.namesList = result

        // Set up the 'walker' of the visitor pattern.
        const myWalker = new AstWalker()
        myWalker.myWorkers.push(myNamesCollector)

        // Walk over the AST and collect the nodes from the namespace, but not from any child namespace.
        // If 'publicOnly', do not gather the children from any nodes that are marked 'private',
        // not even the 'public' ones.
        myWalker.walk(namespace._myNode, (node: FreNode) => {
            // To not go into nested private nodes, we also check whether the property is public.
            return (
                !FreLanguage.getInstance().classifier(node.freLanguageConcept()).isNamespace &&
                (!publicOnly ||
                    (!!node.freOwner() &&
                        FreLanguage.getInstance().classifierProperty(node.freOwner().freLanguageConcept(), node.freOwnerDescriptor().propertyName).isPublic))
            )
        })

        // Filter the nodes on being 'public'.
        if (publicOnly) {
            result = result.filter((node) => {
                return (
                    !!node.freOwner() &&
                    FreLanguage.getInstance().classifierProperty(node.freOwner().freLanguageConcept(), node.freOwnerDescriptor().propertyName).isPublic
                )
            })
        }

        // Transform the result to the required type.
        return new Set<FreNamedNode>(result)
    }
}
