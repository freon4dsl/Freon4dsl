import { DemoAttribute, DemoAttributeType, DemoEntity, DemoUnit, PiElementReference } from "../language/gen";
import { DemoStdlib } from "../stdlib/gen/DemoStdlib";

const stdlib = DemoStdlib.getInstance();

export function createDemoUnit(data: Partial<DemoUnit>): DemoUnit {
    return DemoUnit.create(data);
}

export function createDemoEntity(data: Partial<DemoEntity>): DemoEntity {
    return DemoEntity.create(data);
}

export function createDemoAttribute(data: Partial<DemoAttribute>): DemoAttribute {
    return DemoAttribute.create(data);
}

export function createDemoEntityReference(data: string): PiElementReference<DemoEntity> {
    return PiElementReference.create<DemoEntity>(data, "DemoEntity");
}

export function createDemoAttributeTypeReference(data: string): PiElementReference<DemoAttributeType> {
    return PiElementReference.create<DemoAttributeType>(stdlib.find(data, "DemoAttributeType") as DemoAttributeType, "");
}
