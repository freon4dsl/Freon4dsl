import { net } from "net.akehurst.language-agl-processor";
import SPPTNode = net.akehurst.language.api.sppt.SPPTNode;
import SPPTBranch = net.akehurst.language.api.sppt.SPPTBranch;
import SPPTLeaf = net.akehurst.language.api.sppt.SPPTLeaf;

export class ParseHelpers {
    static printTree(node: SPPTNode, indent?: number): string {
        let result: string = '';
        if (node !== null && node !== undefined) {
            if (indent === null || indent === undefined) {
                indent = 0;
            }
            if (node.isLeaf) {
                result += ParseHelpers.printLeaf(node as SPPTLeaf, indent);
            } else if (node.isBranch) {
                result += ParseHelpers.printBranch(node as SPPTBranch, indent);
            } else if (Array.isArray(node)) {
                node.forEach(n => {
                    result += ParseHelpers.printTree(n, indent) + "\n";
                })
            } else {
                result += 'UNKNOWN node TYPE: ' + node.constructor.name + ' (' + node.matchedText?.trimEnd() + ')';
            }
        }
        return result;
    }

    private static printLeaf(node: SPPTLeaf, indent: number): string {
        let tmp = node?.nonSkipMatchedText.trim();
        return "LEAF [" + tmp + "]";
    }

    private static printBranch(branch: SPPTBranch, indent: number): string {
        let tmp: string = '';
        let indentStr: string = '';
        for (let i = 0; i < indent; i++) {
            indentStr += '\t';
        }
        const children = branch.nonSkipChildren.toArray();
        indent++;
        for (const child of children) {
            tmp += '\n\t' + indentStr + ParseHelpers.printTree(child, indent);
        }
        return `BRANCH ${branch.name} #children[${children?.length}] [ ${tmp} \n${indentStr}]`;
    }
}
