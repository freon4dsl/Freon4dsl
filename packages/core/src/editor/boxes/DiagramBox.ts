import { Box } from "./Box.js";
import { FreNode } from "../../ast/index.js";
import { FreUtils } from "../../util/index.js";

export type DiagramEdge =   {
    /**
     * The id required by Svelte Flow
     */
    id: string,
    /**
     * The diagram node id of the source of the edge
     */
    source: string,
    /**
     * The diagram node id of the target of the edge
     */
    target: string,
    animated: boolean,
    style: string,
    /**
     * The node containing the reference/part for the edge.
     */
    startFreNode?: FreNode,
    /**
     * The target node of the reference/part for the edge.
     */
    endFreNode?: FreNode,
    /**
     * The property name in the start node 
     * TODO Might also need the index.
     */
    propertyName: string

}

export type DiagramNode = {
    /**
     * The id required by Svelte Flow
     */
    id:string,
    /**
     * Used for mapping to the Svelte component for the node
     */
    type: string,
    /**
     * Position of the node in the diagram
     */
    position: { x: number, y: number },
    /**
     * User provided data
     */
    data: object
    /**
     * The Freon node for this Diagram Node
     */
    freNode?: FreNode
}

export type NodeDef = {
    startNode: FreNode;
    endNode: FreNode;
}

export type CreateTool = {
    label: string;
    creator: () => FreNode;
}
export type SvelteFlowConnection = {
    sourceNode: FreNode;
    targetNode: FreNode;
    sourceHandle: string | null;
    targetHandle: string | null;
};

export type EdgeDefinition = {
    sourceType: string;
    targetType: string;
    sourceProperty: string;
}
export type DiagramDef = {
    /**
     * The Ast node corresponding to the diagram.
     */
    astNode: FreNode;
    // one part[] property containing all Ast nodes to be shown as diagram nodes
    // astNode[diagramNodesAsProperty] => FreNode[]
    diagramNodesAsProperty: string;
    // more generic, a function returning all nodes 
    diagramNodes: (astNode: FreNode) => FreNode[]
    /**
     * A function returning all edges for each ast node where
     * _astNode_ is the start of the edge.
     */
    nodeEdges(astNode: FreNode): DiagramEdge[]
    /**
     * Create buttons for creating new nodes in the toolbar
     */
    tools: CreateTool[]
    // NOTE: if _diagramNodesAsProperty_ is used, automatic
    // All allowable types of the _diagramNodesAsProperty_
    /**
     * 
     */
    edgeCreator: (edge: SvelteFlowConnection) => void
}


/**
 * TODO A DiagramBox shows 
 */
export class DiagramBox extends Box {
    protected _children: Box[] = [];
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list
    kind = "DiagramBox"
    edges: DiagramEdge[]
    createActions: CreateTool[]
    
    constructor(
        node: FreNode,
        propertyName: string,
        conceptName: string,
        role: string,
        children: Box[],
        edges: DiagramEdge[],
        createActions: CreateTool[],
        initializer?: Partial<DiagramBox>,
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        if (!!children) {
            children.forEach((b) => this.addChild(b));
        }
        this.edges = edges
        this.propertyName = propertyName;
        this.conceptName = conceptName;
        this.createActions = createActions
        this.selectable = false;
        this.isDirty()
    }
    
    findCreateActionForLabel(label: string): () => FreNode {
        return this.createActions.find(cr =>cr.label === label).creator
    }

    get children(): Box[] {
        return this._children;
    }

    replaceChildren(children: Box[]): DiagramBox {
        this._children.splice(0, this._children.length);
        if (!!children) {
            children.forEach((child) => {
                if (!!child) {
                    this._children.push(child);
                    child.parent = this;
                }
            });
        }
        this.isDirty();
        return this;
    }

    clearChildren(): void {
        this._children.forEach((ch) => (ch.parent = null));
        const dirty: boolean = this._children.length !== 0;
        this._children.splice(0, this._children.length);
        if (dirty) {
            this.isDirty();
        }
    }

    addChild(child: Box | null): DiagramBox {
        if (!!child) {
            this._children.push(child);
            child.parent = this;
            // console.log("TableBox addChild dirty " + this.role)
            this.isDirty();
        }
        return this;
    }

    insertChild(child: Box | null): DiagramBox {
        if (!!child) {
            this._children.splice(0, 0, child);
            child.parent = this;
            // console.log("TableBox insertChild dirty " + this.role)
            this.isDirty();
        }
        return this;
    }

    addChildren(children?: Box[]): DiagramBox {
        if (!!children) {
            children.forEach((child) => this.addChild(child));
            // console.log("TableBox addChildren dirty")
            this.isDirty();
        }
        return this;
    }

    nextSibling(box: Box): Box | null {
        const index = this.children.indexOf(box);
        if (index !== -1) {
            if (index + 1 < this.children.length) {
                return this.children[index + 1];
            }
        }
        return null;
    }

    previousSibling(box: Box): Box | null {
        const index = this.children.indexOf(box);
        if (index > 0) {
            return this.children[index - 1];
        }
        return null;
    }

    toString() {
        let result: string = "List: " + this.role + "<";
        for (const child of this.children) {
            result += "\n    " + child.toString();
        }
        result += ">";
        return result;
    }
}

export function isDiagramBox(box: Box): box is DiagramBox {
    return box?.kind === "DiagramBox"
}
