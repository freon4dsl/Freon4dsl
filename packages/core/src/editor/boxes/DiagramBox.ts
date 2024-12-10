import { Box } from "./Box.js";
import { FreNode } from "../../ast/index.js";
import { FreUtils } from "../../util/index.js";

export type DiagramEdge =   {
    id: string,
    source: string,
    target: string,
    animated: boolean,
    style: string,
    // Freon
    startFreNode?: FreNode,
    endFreNode?: FreNode,
    propertyName: string

}

export type DiagramNode = {
    id:string,
    type: string,
    position: { x: number, y: number },
    // data is used to store the current color value
    data: object
    // Freon
    freNode?: FreNode
}

// type DiagramDef = {
//     astNode: FreNode;
//     // one part[] property containing all Ast nodes to be shown as diagram nodes
//     // astNode[diagramNodesAsProperty] => FreNode[]
//     diagramNodesAsProperty: string;
//     // more generic, a function returning all nodes 
//     diagramNodes: (astNode: FreNode) => FreNode[]
//     /**
//      * A function returning all edges for each ast node
//      */
//     nodeEdges(astNode: FreNode): DiagramEdge[]
//     /**
//      * Create node buttons for types:
//      */
//     create: string[]
//     // if _diagramNodesAsProperty_ is used, automatic
//     // All allowable types of the _diagramNodesAsProperty_
//
// }


/**
 * TODO A DiagramBox shows 
 */
export class DiagramBox extends Box {
    protected _children: Box[] = [];
    conceptName: string = "unknown-type"; // the name of the type of the elements in the list
    kind = "DiagramBox"
    edges: DiagramEdge[]
    createActions: { label: string, creator: () => FreNode }[]
    
    constructor(
        node: FreNode,
        propertyName: string,
        conceptName: string,
        role: string,
        children: Box[],
        edges: DiagramEdge[],
        createActions: { label: string, creator: () => FreNode }[],
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
