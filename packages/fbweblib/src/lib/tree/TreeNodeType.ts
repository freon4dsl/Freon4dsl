export class TreeNodeType {
    name: string;
    children?: TreeNodeType[];

    constructor(name: string, children?: TreeNodeType[]) {
        this.name = name;
        this.children = children;
    }
};

export interface TreeViewProps {
    title?: string;
    data?: TreeNodeType[];
}

export interface TreeNodeProps {
    node: TreeNodeType;
}
