import { PiElement } from "@projectit/core";
import { MPSServerClient } from "mpssserver-client";
import type { NodeInfo, NodeInfoDetailed, NodeReference, PropertyChange } from "mpssserver-client/dist/gen/messages";
import { Accenture_study_core_Form } from "../../mps/language/gen";

export class MpsServer {
    static MODEL_NAME = "org.projectit.mps.structure.to.ast.example.model1";

    public static the = new MpsServer();

    private constructor() {
    }

    client: MPSServerClient = new MPSServerClient('ws://localhost:2905/jsonrpc');
    connected: boolean = false;

    async tryToConnect() {
        if (!this.connected) {
            await this.client.connect().catch((reason: any) => {
                console.error("unable to connect to server", reason);
                process.exit(1);
            });
            console.log("CLIENT CONNECTED");
            await this.client.registerForChanges(MpsServer.MODEL_NAME, {
                onPropertyChange: (event: PropertyChange) => { console.log("INCOMING PROPERTY CHANGE [" + event.propertyName + "] := " + event.propertyValue)}
            })
            this.connected = true;
        }
    }

    async getInfo() {
        const projectName = await this.client.getProjectInfo();
        console.log("project name", projectName);
        const modulesStatus = await this.client.getModulesStatus();
        console.log("got modules status");
        for (const module of modulesStatus.modules) {
            if (module.name.startsWith("accenture.study.gen")) {
                console.log(" - got module", module.name);
                const moduleInfos = await this.client.getModuleInfo(module.name)
                for (const model of moduleInfos) {
                    console.log("   - got model", model.qualifiedName);
                    if (model.qualifiedName.endsWith("@descriptor")) {
                        console.log("     skipping descriptor")
                    } else if (model.qualifiedName.endsWith("@java_stub")) {
                        console.log("     skipping java_stub")
                    } else if (model.qualifiedName.endsWith("@generator")) {
                        console.log("     skipping generator")
                    }  else if (model.qualifiedName.endsWith("@tests")) {
                        console.log("     skipping tests")
                    } else {
                        const answer = await this.client.getInstancesOfConcept(model.qualifiedName,
                            "accenture.study.WebSocketsAPIsGroup")
                        const nodes = answer.nodes;
                        nodes.forEach((node: NodeInfo) => {
                            console.log("     APIS group", node.name);
                        })
                    }
                }
            }
        }

    }

    public async getReferenceName(modelFQN: string, regularId: string): Promise<string> {
        console.log("getReferenceName for " + regularId);
        // await this.core();
        // this.getInfo();
        const nodeDetail: NodeInfoDetailed = await this.client.getNode( {model: MpsServer.MODEL_NAME, id: {"regularId": regularId}});
        console.log("NODE DETAIL " + (!!nodeDetail ? nodeDetail.name : "NULL") );
        return nodeDetail.name;
    }

    // TODO Shoulc be connctet
    public async changedPrimitiveProperty(node: PiElement, propertyName: string, value: string) {
        const nodeid: NodeReference = { model: MpsServer.MODEL_NAME, id: { regularId: node.piId()}};
        await this.client.requestForPropertyChange(nodeid, propertyName, value );
    }

    public async AddedChild(parent: PiElement, propertyName: string, conceptName: string) {
        const parentid: NodeReference = this.mpsid(parent);
        await this.client.addChild(parentid, propertyName, conceptName, 0);
    }

    private mpsid(elem: PiElement): NodeReference {
        return { model: MpsServer.MODEL_NAME, id: { regularId: elem.piId()}}
    }
}
