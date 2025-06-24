FreNamespace {
    getDeclaredNodes(publicOnly: boolean): FreNamedNode[] {
        return all AST nodes in the subtree of which this namespace is the top,
        and the leafs are AST nodes that are themselves namespaces.
        The parameter 'publicOnly' indicates whether to include AST nodes that are marked private.
    }
    getParentNodes(): FreNamedNode[] {
        THIS.parentNamespace.getVisibleNodes();
    }
    getImportedNodes(list: NamespaceImports): FreNamedNode[] {
        list.forEach( NS => {
            NS.getDeclaredNodes(PUBLIC_ONLY) 
        plus 
            if (import is recursive) {
                NS.getImportedNodes(NS.imports)
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
