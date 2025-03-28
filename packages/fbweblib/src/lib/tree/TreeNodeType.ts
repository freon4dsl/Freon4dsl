import type { FreNode } from "@freon4dsl/core"

export class TreeNodeType {
    name: string;
    children?: TreeNodeType[];

    constructor(name: string, children?: TreeNodeType[]) {
        this.name = name;
        this.children = children;
    }
};

export class FreTreeNodeType extends TreeNodeType {
    location: FreNode;

    constructor(name: string, location: FreNode, children?: TreeNodeType[]) {
        super(name, children);
        this.location = location;
    }
}

export interface TreeViewProps<T extends TreeNodeType> {
    title?: string;
    data?: T[];
}

export interface TreeNodeProps<T extends TreeNodeType> {
    node: T;
}
