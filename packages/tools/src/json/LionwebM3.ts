/**
 * The types defining the structure of the lionweb JSON format.
 * @see https://lionweb-org.github.io/organization/lioncore/serialization/serialization.html
 * We use types instead of classes, because the purpose is to define the Lionweb JSON to be sent over the line.
 */
type Id = string;

export type LwMetaPointer = {
    language: Id;
    version: string;
    key: Id;
}

export function isLwMetaPointer(node: any): node is LwMetaPointer {
    const metaPointer = node as LwMetaPointer;
    return metaPointer.key !== undefined &&
        metaPointer.version !== undefined &&
        metaPointer.language !== undefined;
}

function isEqualMetaPointer(p1: LwMetaPointer, p2: LwMetaPointer): boolean {
    return p1.key === p2.key && p1.version === p2.version && p1.language === p2.language;
}

export type LwChunk = {
    serializationFormatVersion: string;
    languages: LwUsedLanguage[];
    nodes: LwNode[];
}

export function isLwChunk(box: any): box is LwChunk {
    const cnk = box as LwChunk;
    return cnk.serializationFormatVersion !== undefined &&
        cnk.languages !== undefined &&
        cnk.nodes !== undefined;
}

export type LwUsedLanguage = {
    key: Id;
    version: string;
}

export function isLwUsedLanguage(obj: any): obj is LwUsedLanguage {
    const lwUsedLanguage = obj as LwUsedLanguage;
    return lwUsedLanguage.key !== undefined &&
        lwUsedLanguage.version !== undefined
}

export type LwNode = {
    id: Id;
    concept: LwMetaPointer;
    properties: LwProperty[];
    children: LwChild[];
    references: LwReference[];
    parent: string;
}

export function isLwNode(box: any): box is LwNode {
    const lwNode = box as LwNode;
    return lwNode.id !== undefined &&
        lwNode.concept !== undefined &&
        lwNode.properties !== undefined &&
        lwNode.children !== undefined &&
        lwNode.references !== undefined &&
        lwNode.parent !== undefined;
}

export function createLwNode(): LwNode {
    return {
        id: null,
        concept: null,
        properties: [],
        children: [],
        references: [],
        parent: null
    }
}

export type LwProperty = {
    property: LwMetaPointer;
    value: string;
}

export function isLwProperty(obj: any): obj is LwProperty {
    const lwProperty = obj as LwProperty;
    return lwProperty.property !== undefined &&
        lwProperty.value !== undefined;
}

export type LwChild = {
    containment: LwMetaPointer;
    children: string[];
}

export function isLwChild(obj: any): obj is LwChild {
    const lwChild = obj as LwChild;
    return lwChild.containment !== undefined &&
        lwChild.children !== undefined;
}

export type LwReference = {
    reference: LwMetaPointer;
    targets: LwReferenceTarget[];
}

export function isLwReference(obj: any): obj is LwReference {
    const lwReference = obj as LwReference;
    return lwReference.reference !== undefined &&
        lwReference.targets !== undefined;
}

export type LwReferenceTarget = {
    resolveInfo: string;
    reference: Id;
}

export function isLwReferenceTarget (obj: any): obj is  LwReferenceTarget {
    const lwReferenceTarget = obj as LwReferenceTarget;
    return lwReferenceTarget.reference !== undefined &&
        lwReferenceTarget.resolveInfo !== undefined;
}

export type LwError = {
    errors: string[];
}

export class LwDiff {
    errors: string[]  = []; 

    error(msg: string) {
        this.errors.push(msg + "\n");
    }
    
    check(b: boolean, message: string): void {
        if (!b) {
            this.error("Check error: " + message);
        }
    }

    findNode(nodes: LwNode[], id: string): LwNode | null {
        for (const node of nodes) {
            this.check(isLwNode(node), "Expected an LwNode, but got " + JSON.stringify(node));
            if (node.id === id) {
                return node;
            }
        }
        return null;
    }

    findLwProperty(properties: LwProperty[], key: string): LwProperty | null {
        for (const property of properties) {
            this.check(isLwProperty(property), "Expected an LwProperty, but got " + JSON.stringify(property));
            if (property.property.key === key) {
                return property;
            }
        }
        return null;
    }

    findLwChild(lwChildren: LwChild[], key: string): LwChild | null {
        for (const lwChild of lwChildren) {
            this.check(isLwChild(lwChild), "Expected an LwChild, but got " + JSON.stringify(lwChild));
            if (lwChild.containment.key === key) {
                return lwChild;
            }
        }
        return null;
    }

    findLwReference(lwReferences: LwReference[], key: string): LwReference | null {
        for (const ref of lwReferences) {
            this.check(isLwReference(ref), "Expected an LwReference, but got " + JSON.stringify(ref));
            if (ref.reference.key === key) {
                return ref;
            }
        }
        return null;
    }

    findLwUsedLanguage(lwUsedLanguages: LwUsedLanguage[], key: string): LwUsedLanguage | null {
        for (const language of lwUsedLanguages) {
            this.check(isLwUsedLanguage(language), "Expected an LwUsedLanguage, but got " + JSON.stringify(language));
            if (language.key === key) {
                return language;
            }
        }
        return null;
    }

    findLwReferenceTarget(lwReferenceTargets: LwReferenceTarget[], target: LwReferenceTarget): LwReferenceTarget | null {
        for (const refTarget of lwReferenceTargets) {
            if (refTarget.reference === target.reference && refTarget.resolveInfo === target.resolveInfo) {
                return refTarget
            }
        }
        return null;
    }

    /**
     * Compare two LwNode objects and return their difference
     * @param obj1
     * @param obj2
     */
    diffLwNode(obj1: LwNode, obj2: LwNode): void {
        // console.log("Comparing nodes")
        if (!isEqualMetaPointer(obj1.concept, obj2.concept)) {
            this.error(`Object ${obj1.id} has concept ${JSON.stringify(obj1.concept)} vs ${JSON.stringify(obj2.concept)}`);
        }
        if (obj1.parent !== obj2.parent) {
            this.error(`Object ${obj1.id} has parent ${obj1.parent} vs ${obj2.parent}`);
        }
        for (const prop of obj1.properties) {
            this.check(isLwProperty(prop), "Expected an LwProperty, but got " + JSON.stringify(prop));
            const key = prop.property.key;
            // console.log(`    property ${key} of node ${obj1.id}`)
            const otherProp = this.findLwProperty(obj2.properties, key);
            if (otherProp === null) {
                this.error(`Property with concept key ${key} does not exist in second object`);
                continue;
            }
            const tmp = this.lwDiff(prop, otherProp);
        }
        for (const child of obj1.children) {
            this.check(isLwChild(child), "Expected an LwChild, but got " + JSON.stringify(child));
            const key = child.containment.key;
            // console.log(`    property ${key} of node ${obj1.id}`)
            const otherChild = this.findLwChild(obj2.children, key);
            if (otherChild === null) {
                this.error(`Child with containment key ${key} does not exist in second object`);
                continue;
            }
            const tmp = this.lwDiff(child, otherChild);
        }
        for (const ref of obj1.references) {
            this.check(isLwReference(ref), "Expected an LwReference, but got " + JSON.stringify(ref));
            const key = ref.reference.key;
            const otherref = this.findLwReference(obj2.references, key);
            if (otherref === null) {
                this.error(`Child with containment key ${key} does not exist in second object`);
                continue;
            }
            const tmp = this.lwDiff(ref, otherref);
        }
    }

    diffLwChunk(chunk1: LwChunk, chunk2: LwChunk): void {
        console.log("Comparing chuncks")
        if (chunk1.serializationFormatVersion !== chunk2.serializationFormatVersion) {
            this.error(`Serialization versions do not match: ${chunk1.serializationFormatVersion} vs ${chunk2.serializationFormatVersion}`);
        }
        // TODO check languages other wway around
        for (const language of chunk1.languages) {
            const otherLanguage = this.findLwUsedLanguage(chunk2.languages, language.key);
            if (otherLanguage === null) {
                // return { isEqual: false, diffMessage: `Node with concept key ${id} does not exist in second object`};
                this.error(`Language with  key ${language.key} does not exist in second object`);
                continue;
            }
            const tmp = this.lwDiff(language, otherLanguage);
        }
        for (const language of chunk2.languages) {
            console.log("Comparing languages")
            const otherLanguage = this.findLwUsedLanguage(chunk1.languages, language.key);
            if (otherLanguage === null) {
                // return { isEqual: false, diffMessage: `Node with concept key ${id} does not exist in second object`};
                this.error(`Language with  key ${language.key} does not exist in first object`);
            }
        }
        for (const node of chunk1.nodes) {
            this.check(isLwNode(node), "Expected an LwNode, but got " + JSON.stringify(node));
            const id = node.id;
            const otherNode = this.findNode(chunk2.nodes, id);
            if (otherNode === null) {
                // return { isEqual: false, diffMessage: `Node with concept key ${id} does not exist in second object`};
                this.error(`Node with concept key ${id} does not exist in second object`);
                continue;
            }
            const tmp = this.lwDiff(node, otherNode);
        }
        for (const node of chunk2.nodes) {
            this.check(isLwNode(node), "Expected an LwNode, but got " + JSON.stringify(node));
            const id = node.id;
            const otherNode = this.findNode(chunk1.nodes, id);
            if (otherNode === null) {
                // return { isEqual: false, diffMessage: `Node with concept key ${id} does not exist in second object`};
                this.error(`Node with concept key ${id} does not exist in first object`);
            }
        }
    }

    diffLwChild(obj1: LwChild, obj2: LwChild): void {
        if (!isEqualMetaPointer(obj1.containment, obj2.containment)) {
            // return { isEqual: false, diffMessage: `Property Object has concept ${JSON.stringify(obj1.property)} vs ${JSON.stringify(obj2.property)}`}
            this.error(`Child Object has concept ${JSON.stringify(obj1.containment)} vs ${JSON.stringify(obj2.containment)}`);
        }
        // Check whether children exist in both objects (two for loops)
        for (const childId1 of obj1.children) {
            if (!obj2.children.includes(childId1)) {
                this.error(`Child ${childId1} is missing in other object`);
            }
        }
        for (const childId2 of obj2.children) {
            if (!obj1.children.includes(childId2)) {
                console.error(`Child ${childId2} is missing in first object`);
            }
        }
    }

    diffLwReference(ref1: LwReference, ref2: LwReference): void {
        if (!isEqualMetaPointer(ref1.reference, ref2.reference)) {
            // return { isEqual: false, diffMessage: `Property Object has concept ${JSON.stringify(obj1.property)} vs ${JSON.stringify(obj2.property)}`}
            this.error(`Reference has concept ${JSON.stringify(ref1.reference)} vs ${JSON.stringify(ref2.reference)}`);
        }
        for (const target of ref1.targets) {
            const otherTarget = this.findLwReferenceTarget(ref2.targets, target);
            if (otherTarget === null) {
                console.error(`REFERENCE Target ${JSON.stringify(target)} missing in second `)
            } else {
                if (target.reference !== otherTarget.reference || target.resolveInfo !== otherTarget.resolveInfo) {
                    this.error(`REFERENCE target ${JSON.stringify(target)} vs ${JSON.stringify(otherTarget)}`)
                }
            }
        }
        for (const target of ref2.targets) {
            if (this.findLwReferenceTarget(ref1.targets, target) === null) {
                this.error(`REFERENCE Target ${JSON.stringify(target)} missing in first `)
            }
        }
    }

    lwDiff(obj1: any, obj2: any): void {
        if (isLwChunk(obj1) && isLwChunk(obj2)) {
            this.diffLwChunk(obj1, obj2);
        } else if (isLwNode(obj1) && isLwNode(obj2)) {
            this.diffLwNode(obj1, obj2);
        } else if (isLwProperty(obj1) && isLwProperty(obj2)) {
            if (!isEqualMetaPointer(obj1.property, obj2.property)) {
                this.error(`Property Object has concept ${JSON.stringify(obj1.property)} vs ${JSON.stringify(obj2.property)}`)
            }
            if (obj1.value !== obj2.value) {
                this.error(`Property ${obj1.property.key} has value ${obj1.value} vs ${obj2.value}`);
            }
        } else if (isLwChild(obj1) && isLwChild(obj2)) {
            this.diffLwChild(obj1, obj2);
        } else if (isLwReference(obj1) && isLwReference(obj2)) {
            this.diffLwReference(obj1, obj2);
        } else if (isLwUsedLanguage(obj1) && isLwUsedLanguage(obj2)) {
            if (obj1.key !== obj2.key || obj1.version !== obj2.version) {
            }
            this.error(`Different used languages ${JSON.stringify(obj1)} vs ${JSON.stringify(obj2)}`);
        } else if (isLwReferenceTarget(obj1) && isLwReferenceTarget(obj2)) {
            // return diffLwReferenceTarget(obj1, obj2)
        } else {
            console.log(`lwDiff: unkown objects: ${JSON.stringify(obj1)} and ${JSON.stringify(obj2)}`);
            this.error(`lwDiff: unkown objects: ${JSON.stringify(obj1)} and ${JSON.stringify(obj2)}`);
        }
        // console.log(JSON.stringify(obj1));
    }
}
