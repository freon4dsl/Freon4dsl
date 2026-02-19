import type { FreNode } from "@freon4dsl/core"
import type {
    DeltaEvent,
    PartitionAddedEvent,
    PropertyAddedEvent,
    PropertyDeletedEvent,
    PropertyChangedEvent,
    ChildAddedEvent,
    ReferenceAddedEvent,
    ReferenceDeletedEvent,
    ReferenceChangedEvent,
} from "$lib/delta-mock/types"

export type ProcessedDelta = {
    delta: DeltaEvent
    originalNode: FreNode | undefined
    changedNode: FreNode | undefined
    nodeName?: string
    propertyName?: string
    propertyIndex?: number
}

class ProcessedDeltaList {
    deltas: ProcessedDelta[] = [];

    /**
     * Callback used to notify that a new Delta has been added to the list
     */
    deltaProcessed: (p : ProcessedDelta) => void = () => {}
    
    add(processedDelta: ProcessedDelta): void {
        this.deltas.push(processedDelta)
        this.deltaProcessed(processedDelta)
    }
}

export const deltaList = new ProcessedDeltaList();

export function mockDeltaList() {
        deltaList.add({
            delta: {
                messageKind: "PartitionAdded",
                newPartition: {
                    nodes: [
                        {
                            id: "Program-01",
                            parent: null,
                            properties: [],
                            containments: [],
                            references: [],
                            classifier: { language: "-key-LogoProgram", key: "-key-Program", version: "1" },
                            annotations: [],
                        },
                    ],
                },
                originCommands: [{ commandId: "AddPartition-0", participationId: "participation-0" }],
                sequenceNumber: 0,
                additionalInfos: [
                    {
                        kind: "AffectedNode",
                        message: "Node Program-01 has been changed",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                ],
            } as PartitionAddedEvent,
            originalNode: undefined,
            changedNode: undefined,
            nodeName: "Program-01",
        })

        deltaList.add({
            delta: {
                messageKind: "PropertyAdded",
                newValue: "draw rectangle",
                node: "Program-01",
                originCommands: [{ commandId: "AddProperty-4", participationId: "participation-0" }],
                property: {
                    language: "LionCore-builtins",
                    key: "LionCore-builtins-INamed-name",
                    version: "2023.1",
                },
                sequenceNumber: 4,
                additionalInfos: [
                    {
                        kind: "AffectedNode",
                        message: "Node Program-01 has been changed",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                    {
                        kind: "AffectedPartition",
                        message: "Partition Program-01 has a delta change",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                ],
            } as PropertyAddedEvent,
            originalNode: undefined,
            changedNode: undefined,
            nodeName: "Program-01",
        })

        deltaList.add({
            delta: {
                messageKind: "PropertyDeleted",
                node: "Program-01",
                originCommands: [{ commandId: "DeleteProperty-6", participationId: "participation-0" }],
                property: {
                    language: "LionCore-builtins",
                    key: "LionCore-builtins-INamed-name",
                    version: "2023.1",
                },
                sequenceNumber: 6,
                additionalInfos: [
                    {
                        kind: "AffectedNode",
                        message: "Node Program-01 has been changed",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                    {
                        kind: "AffectedPartition",
                        message: "Partition Program-01 has a delta change",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                ],
                oldValue: "draw rectangle",
            } as PropertyDeletedEvent,
            originalNode: undefined,
            changedNode: undefined,
            nodeName: "Program-01",
        })

        deltaList.add({
            delta: {
                messageKind: "PropertyAdded",
                newValue: "draw rectangle again",
                node: "Program-01",
                originCommands: [{ commandId: "AddProperty-8", participationId: "participation-0" }],
                property: {
                    language: "LionCore-builtins",
                    key: "LionCore-builtins-INamed-name",
                    version: "2023.1",
                },
                sequenceNumber: 8,
                additionalInfos: [
                    {
                        kind: "AffectedNode",
                        message: "Node Program-01 has been changed",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                    {
                        kind: "AffectedPartition",
                        message: "Partition Program-01 has a delta change",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                ],
            } as PropertyAddedEvent,
            originalNode: undefined,
            changedNode: undefined,
            nodeName: "Program-01",
            propertyName: "Property-345",
            propertyIndex: 4,
        })

        deltaList.add({
            delta: {
                messageKind: "PropertyChanged",
                newValue: "draw a rectangle",
                node: "Program-01",
                originCommands: [{ commandId: "ChangeProperty-9", participationId: "participation-0" }],
                property: {
                    language: "LionCore-builtins",
                    key: "LionCore-builtins-INamed-name",
                    version: "2023.1",
                },
                sequenceNumber: 9,
                additionalInfos: [
                    {
                        kind: "AffectedNode",
                        message: "Node Program-01 has been changed",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                    { kind: "query", message: "[]", data: [] },
                    {
                        kind: "AffectedPartition",
                        message: "Partition Program-01 has a delta change",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                ],
                oldValue: "draw rectangle again",
            } as PropertyChangedEvent,
            originalNode: undefined,
            changedNode: undefined,
            nodeName: "Program-01",
        })

        deltaList.add({
            delta: {
                messageKind: "ChildAdded",
                containment: { language: "-key-LogoProgram", key: "-key-Program-commands", version: "1" },
                index: 0,
                parent: "Program-01",
                newChild: {
                    nodes: [
                        {
                            id: "Move-01",
                            parent: "Program-01",
                            properties: [],
                            containments: [],
                            references: [],
                            classifier: { language: "-key-LogoProgram", key: "-key-Forward", version: "1" },
                            annotations: [],
                        },
                    ],
                },
                originCommands: [{ commandId: "AddChild-12", participationId: "participation-0" }],
                sequenceNumber: 12,
                additionalInfos: [
                    {
                        kind: "AffectedNode",
                        message: "Node Program-01 has been changed",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                    {
                        kind: "AffectedPartition",
                        message: "Partition Program-01 has a delta change",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                ],
            } as ChildAddedEvent,
            originalNode: undefined,
            changedNode: undefined,
            nodeName: "Program-01",
        })

        deltaList.add({
            delta: {
                messageKind: "ChildAdded",
                containment: { language: "-key-LogoProgram", key: "-key-Program-commands", version: "1" },
                index: 0,
                parent: "Program-01",
                newChild: {
                    nodes: [
                        {
                            id: "PCall-01",
                            parent: "Program-01",
                            properties: [],
                            containments: [],
                            references: [],
                            classifier: { language: "-key-LogoProgram", key: "-key-ProcedureCall", version: "1" },
                            annotations: [],
                        },
                    ],
                },
                originCommands: [{ commandId: "AddChild-24", participationId: "participation-0" }],
                sequenceNumber: 24,
                additionalInfos: [
                    {
                        kind: "AffectedNode",
                        message: "Node Program-01 has been changed",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                    {
                        kind: "AffectedPartition",
                        message: "Partition Program-01 has a delta change",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                ],
            } as ChildAddedEvent,
            originalNode: undefined,
            changedNode: undefined,
            nodeName: "Program-01",
        })

        deltaList.add({
            delta: {
                messageKind: "ReferenceAdded",
                newResolveInfo: "PROC-01",
                newTarget: "Procedure-01",
                reference: { language: "-key-LogoProgram", key: "-key-ProcedureCall-procedure", version: "1" },
                index: 0,
                parent: "PCall-01",
                originCommands: [{ commandId: "AddReference-25", participationId: "participation-0" }],
                sequenceNumber: 25,
                additionalInfos: [
                    {
                        kind: "AffectedNode",
                        message: "Node PCall-01 has been changed",
                        data: [{ key: "node", value: "PCall-01" }],
                    },
                    { kind: "MISSING", message: "AddReference missing 1", data: [] },
                    {
                        kind: "query",
                        message: "AddReference query",
                        data: [
                            {
                                key: "query",
                                value: '-- Update generated by DbChanges\\n-- updatesReferenceTable {"node_id":"PCall-01","reference":{"language":"-key-LogoProgram","key":"-key-ProcedureCall-procedure","version":"1"},"column":"targets","targets":[{"resolveInfo":"PROC-01","reference":"Procedure-01"}],"missing":1}\\n            -- insert new feature for existing node\\n                                insert into "lionweb_references"("reference","targets","node_id") values(11,array[{"resolveInfo":"PROC-01","reference":"Procedure-01"}\']::jsonb[],\'PCall-01\');',
                            },
                        ],
                    },
                    {
                        kind: "AffectedPartition",
                        message: "Partition Program-01 has a delta change",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                ],
            } as ReferenceAddedEvent,
            originalNode: undefined,
            changedNode: undefined,
            nodeName: "PCall-01",
        })

        deltaList.add({
            delta: {
                messageKind: "ReferenceDeleted",
                parent: "PCall-01",
                index: 0,
                reference: { language: "-key-LogoProgram", key: "-key-ProcedureCall-procedure", version: "1" },
                deletedResolveInfo: "PROC-01",
                deletedTarget: "Procedure-01",
                originCommands: [{ commandId: "DeleteReference-29", participationId: "participation-0" }],
                sequenceNumber: 29,
                additionalInfos: [
                    {
                        kind: "AffectedNode",
                        message: "Node PCall-01 has been changed",
                        data: [{ key: "node", value: "PCall-01" }],
                    },
                    {
                        kind: "AffectedPartition",
                        message: "Partition Program-01 has a delta change",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                ],
            } as ReferenceDeletedEvent,
            originalNode: undefined,
            changedNode: undefined,
            nodeName: "PCall-01",
        })

        deltaList.add({
            delta: {
                messageKind: "ReferenceAdded",
                newResolveInfo: "PROC-01",
                newTarget: "Procedure-01",
                reference: { language: "-key-LogoProgram", key: "-key-ProcedureCall-procedure", version: "1" },
                index: 0,
                parent: "PCall-01",
                originCommands: [{ commandId: "AddReference-33", participationId: "participation-0" }],
                sequenceNumber: 33,
                additionalInfos: [
                    {
                        kind: "AffectedNode",
                        message: "Node PCall-01 has been changed",
                        data: [{ key: "node", value: "PCall-01" }],
                    },
                    { kind: "MISSING", message: "AddReference missing 1", data: [] },
                    {
                        kind: "query",
                        message: "AddReference query",
                        data: [
                            {
                                key: "query",
                                value: '-- Update generated by DbChanges\\n-- updatesReferenceTable {"node_id":"PCall-01","reference":{"language":"-key-LogoProgram","key":"-key-ProcedureCall-procedure","version":"1"},"column":"targets","targets":[{"resolveInfo":"PROC-01","reference":"Procedure-01"}],"missing":1}\\n            -- insert new feature for existing node\\n                                insert into "lionweb_references"("reference","targets","node_id") values(11,array[\'{"resolveInfo":"PROC-01","reference":"Procedure-01"}\']::jsonb[],\'PCall-01\');',
                            },
                        ],
                    },
                    {
                        kind: "AffectedPartition",
                        message: "Partition Program-01 has a delta change",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                ],
            } as ReferenceAddedEvent,
            originalNode: undefined,
            changedNode: undefined,
            nodeName: "PCall-01",
        })

        deltaList.add({
            delta: {
                messageKind: "ReferenceChanged",
                parent: "PCall-01",
                index: 0,
                reference: { language: "-key-LogoProgram", key: "-key-ProcedureCall-procedure", version: "1" },
                oldResolveInfo: "PROC-01",
                oldTarget: "Procedure-01",
                newResolveInfo: "PROC-00",
                newTarget: "Procedure-00",
                originCommands: [{ commandId: "ChangeReference-34", participationId: "participation-0" }],
                sequenceNumber: 34,
                additionalInfos: [
                    {
                        kind: "AffectedNode",
                        message: "Node PCall-01 has been changed",
                        data: [{ key: "node", value: "PCall-01" }],
                    },
                    {
                        kind: "query",
                        message: "AddReference query",
                        data: [
                            {
                                key: "query",
                                value: '-- Update generated by DbChanges\\n-- updatesReferenceTable {"node_id":"PCall-01","reference":{"key":"-key-ProcedureCall-procedure","version":"1","language":"-key-LogoProgram"},"column":"targets","targets":[{"reference":"Procedure-01","resolveInfo":"PROC-01"}],"missing":0}\\n            -- update feature for existing node\\n                                UPDATE lionweb_references tabl\\n                                    SET "targets"=array[\'{"reference":"Procedure-01","resolveInfo":"PROC-01"}\']::jsonb[]\\n                                WHERE\\n                                    tabl.node_id = \'PCall-01\' AND\\n                                    tabl.reference = 11;\\n                              ',
                            },
                        ],
                    },
                    {
                        kind: "AffectedPartition",
                        message: "Partition Program-01 has a delta change",
                        data: [{ key: "node", value: "Program-01" }],
                    },
                ],
            } as ReferenceChangedEvent,
            originalNode: undefined,
            changedNode: undefined,
            nodeName: "PCall-01",
        })
}
