import * as AGL from "net.akehurst.language-agl-processor";
import { FreNode } from "@freon4dsl/core";

export class SimpleSpptVisitor implements AGL.SharedPackedParseTreeVisitor<FreNode, any>{
    readonly __doNotUseOrImplementIt;

    visitBranch(target: AGL.SPPTBranch, arg: any): FreNode {
        console.log(`visiting branch`);
        return undefined;
    }

    visitLeaf(target: AGL.SPPTLeaf, arg: any): FreNode {
        console.log(`leaf node: ${target.matchedText} ${target.startPosition}-${target.nextInputPosition}`)
        return undefined;
    }

    visitNode(target: AGL.SPPTNode, arg: any): FreNode {
        if (target.isLeaf) {
            return this.visitLeaf(target as AGL.SPPTLeaf, null);
        } else if (target.isBranch) {
            return this.visitBranch(target as AGL.SPPTBranch, null);
        }
        return undefined;
    }

    visitTree(target: AGL.SharedPackedParseTree, arg: any): FreNode {
        console.log(`visiting tree`);
        // Todo PROBLEM: types do not match
        // if (!!target.treeData.root) {
        //     return this.visitNode(target.treeData.root, null) as unknown as FreNode;
        // } else {
        //     return null;
        // }
        return undefined;
    }
}
