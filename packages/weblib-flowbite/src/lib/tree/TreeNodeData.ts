import type { FreNode } from "@freon4dsl/core"

export class TreeNodeData {
    name: string;
    aboutNode?: FreNode;
    children?: TreeNodeData[];

    constructor(name: string, aboutNode?: FreNode, children?: TreeNodeData[]) {
        this.name = name;
        this.aboutNode = aboutNode;
        this.children = children;
    }
}

export interface TreeViewProps {
    title?: string;
    dataList?: TreeNodeData[];
}

export interface TreeNodeProps {
    data: TreeNodeData;
}
