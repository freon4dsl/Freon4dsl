import * as AGL from "net.akehurst.language-agl-processor";

export class SimpleSpptWalker implements AGL.SpptWalker {
    readonly __doNotUseOrImplementIt;

    beginBranch(nodeInfo: AGL.SpptDataNodeInfo): void {
        let xx: AGL.SpptDataNode = nodeInfo.node;
        console.log(xx.rule.constructor.name); // results in 'RuntimeRule', which is not in the public api of AGL
        // console.log(xx.tag) // results in 'undefined'
        console.log(`start branch: ${xx.rule}`)
        if (xx.rule.toString().startsWith("Calculator")) {
            console.log("Found Calculator")
            // transformCalculator(xx);
        } else if (xx.rule.toString().startsWith("InputField")) {
            console.log("Found InputField")
            // transformInputField(xx)
        } else if (xx.rule.toString().startsWith("OutputField")) {
            console.log("Found OutputField")
            // transformOutputField(xx);
        }
    }

    beginEmbedded(nodeInfo: AGL.SpptDataNodeInfo): void {
        console.log("start embedded")
    }

    beginTree(): void {
        console.log("start of SPPT")
    }

    endBranch(nodeInfo: AGL.SpptDataNodeInfo): void {
        console.log(`end branch: ${nodeInfo.node.rule.tag}`)
    }

    endEmbedded(nodeInfo: AGL.SpptDataNodeInfo): void {
        console.log("end embedded")
    }

    endTree(): void {
        console.log("end of SPPT")
    }

    error(msg: string, path: () => any): void {
        console.log(`error ${msg}`)
    }

    leaf(nodeInfo: AGL.SpptDataNodeInfo): void {
        console.log(`leaf node: ${nodeInfo.node.rule.tag} ${nodeInfo.node.startPosition}-${nodeInfo.node.nextInputPosition}`)
    }

    skip(startPosition: number, nextInputPosition: number): void {
        console.log(`a skip node: ${startPosition}-${nextInputPosition}`)
    }
}
