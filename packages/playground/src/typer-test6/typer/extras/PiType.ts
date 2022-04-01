import { PiContainerDescriptor, PiElement, PiNamedElement } from "@projectit/core";
import { ProjectXEnvironment } from "../../environment/gen/ProjectXEnvironment";

class NamedElement implements PiNamedElement {
    name: string = "ANY_TYPE";

    piContainer(): PiContainerDescriptor {
        return undefined;
    }

    piId(): string {
        return "";
    }

    piIsBinaryExpression(): boolean {
        return false;
    }

    piIsExpression(): boolean {
        return false;
    }

    piIsModel(): boolean {
        return false;
    }

    piIsUnit(): boolean {
        return false;
    }

    piLanguageConcept(): string {
        return "NamedElement";
    }
}

export class PiType {
    internal: PiElement;

    static create(data: Partial<PiType>): PiType {
        const result: PiType = new PiType;
        if (data.internal) {
            result.internal = data.internal;
        }
        return result;
    }

    static ANY: PiType = PiType.create({internal: new NamedElement()})

    toPiString(): string {
        return "PiType<" + ProjectXEnvironment.getInstance().writer.writeToString(this.internal) + ">";
    }
}
