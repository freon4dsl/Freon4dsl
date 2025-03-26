export type TreeNodeType = {
    name: string;
    children?: TreeNodeType[];
};

export interface TreeViewProps {
    title?: string;
    data: TreeNodeType[];
}

export interface TreeNodeProps {
    node: TreeNodeType;
}
