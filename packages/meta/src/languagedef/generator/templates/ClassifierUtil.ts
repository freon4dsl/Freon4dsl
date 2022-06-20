import { PiConcept, PiModelDescription, PiProperty, PiUnitDescription } from "../../metalanguage";

export class ClassifierUtil {
    public static findMobxImportsForConcept(hasSuper: boolean, concept: PiConcept): string[] {
        const mobxImports: string[] = [];
        if (!hasSuper) {
            mobxImports.push("MobxModelElementImpl");
        }
        this.getObserveFunctions(concept.implementedProperties(), mobxImports);
        return mobxImports;
    }

    public static findMobxImports(unit: PiUnitDescription | PiModelDescription): string[] {
        const mobxImports: string[] = [];
        mobxImports.push("MobxModelElementImpl");
        this.getObserveFunctions(unit.allProperties(), mobxImports);
        return mobxImports;
    }

    private static getObserveFunctions(props: PiProperty[], mobxImports: string[]) {
        if (props.some(prop => !prop.isList && prop.isPrimitive)) {
            // for non-list primitive properties include "observablePrim"
            mobxImports.push("observablePrim");
        }
        if (props.some(prop => !prop.isList && !prop.isPrimitive)) {
            // for non-list non-primitive properties include "observablepart"
            mobxImports.push("observablepart");
        }
        if (props.some(prop => prop.isList && !prop.isPrimitive)) {
            // for list properties include "observablelistpart"
            mobxImports.push("observablelistpart");
        }
    }
}
