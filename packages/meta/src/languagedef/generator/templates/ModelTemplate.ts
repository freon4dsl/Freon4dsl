import { ConceptUtils } from "./ConceptUtils.js"
import { Names, FREON_CORE, ImportsUtil } from "../../../utils/index.js"
import { FreMetaModelDescription } from "../../metalanguage/FreMetaLanguage.js";
import { ClassifierUtil } from "./ClassifierUtil.js";

export class ModelTemplate {
    // Note: a model may not have other properties than units
    public generateModel(modelDescription: FreMetaModelDescription): string {
        const language = modelDescription.language;
        const myName = Names.classifier(modelDescription);
        const extendsClass = "MobxModelElementImpl";
        const coreImports: Set<string> = ClassifierUtil.findMobxImports(modelDescription)
            .add(Names.FreModel)
            .add(Names.FreLanguage)
            .add(Names.FreParseLocation)
            .add("AST")
        const modelImports = this.findModelImports(modelDescription, myName);
        const metaType = Names.metaType();

        // Template starts here. Note that the imports are gathered during the generation, and added later.
        const result: string = `
            import { makeObservable, action, runInAction } from "mobx"

            /**
             * Class ${myName} is the implementation of the model with the same name in the language definition file.
             * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react
             * to any changes in the state of its properties.
             */
            export class ${myName} extends ${extendsClass} implements ${Names.FreModel} {

                ${ConceptUtils.makeStaticCreateMethod(modelDescription, myName)}

                ${ConceptUtils.makeBasicProperties(metaType, myName, false)}
                ${modelDescription.primProperties.map((p) => ConceptUtils.makePrimitiveProperty(p)).join("\n")}
                ${modelDescription
                    .parts()
                    .map((p) => ConceptUtils.makePartProperty(p))
                    .join("\n")}

                ${ConceptUtils.makeConstructor(false, modelDescription.properties, coreImports)}
                ${ConceptUtils.makeBasicMethods(false, metaType, true, false, false, false)}
                ${ConceptUtils.makeCopyMethod(modelDescription, myName, false)}
                ${ConceptUtils.makeMatchMethod(false, modelDescription, myName, coreImports)}

                /**
                 * A convenience method that finds a unit of this model based on its name and 'metatype'.
                 * @param name
                 * @param metatype
                 */
                findUnit(name: string, metatype?: ${metaType} ): ${Names.modelunit()} {
                    let result: ${Names.modelunit()} = null;
                    const checkType = metatype !== undefined
                    result = this.getUnits().find((mod) => mod.name === name && 
                        (checkType ? FreLanguage.getInstance().metaConformsToType(mod, metatype): true));
                    if (!!result) {
                        return result;
                    }
                    return null;
                }                 
                
                /**
                 * Replaces a model unit by a new one. Used for swapping between complete units and unit public interfaces.
                 * Returns false if the replacement could not be done, e.g. because 'oldUnit' is not a child of this object.
                 * @param oldUnit
                 * @param newUnit
                 */
                replaceUnit(oldUnit: ${Names.modelunit()}, newUnit: ${Names.modelunit()}): boolean {
                    if ( oldUnit.freLanguageConcept() !== newUnit.freLanguageConcept()) {
                        return false;
                    }
                    if ( oldUnit.freOwnerDescriptor().owner !== this) {
                        return false;
                    }
                    // we must store the interface in the same place as the old unit, which info is held in FreContainer()
                    ${modelDescription
                        .parts()
                        .map(
                            (part) =>
                                `if ( oldUnit.freLanguageConcept() === "${Names.classifier(part.type)}" && oldUnit.freOwnerDescriptor().propertyName === "${part.name}" ) {
                                    AST.changeNamed("removeUnit", () => {
                                        ${
                                            part.isList
                                                ? `const index = this.${part.name}.indexOf(oldUnit as ${Names.classifier(part.type)});
                                        this.${part.name}.splice(index, 1, newUnit as ${Names.classifier(part.type)});`
                                                : `this.${part.name} = newUnit as ${Names.classifier(part.type)};`
                                        }
                                    })
                            } else`,
                        )
                        .join(" ")}
                    {
                        return false;
                    }
                    return  true;
                }

                    /**
                     * Adds a model unit. Returns false if anything goes wrong.
                     *
                     * @param newUnit
                     */
                    addUnit(newUnit: ${Names.modelunit()}): boolean {
                        if (!!newUnit) {
                            const myMetatype = newUnit.freLanguageConcept();
                            switch (myMetatype) {
                            ${language.modelConcept
                                .allParts()
                                .map(
                                    (part) =>
                                        `case "${Names.classifier(part.type)}": {
                                            AST.changeNamed("addUnit", () => {
                                                ${
                                                    part.isList
                                                        ? `this.${part.name}.push(newUnit as ${Names.classifier(part.type)});`
                                                        : `this.${part.name} = newUnit as ${Names.classifier(part.type)}`
                                                }
                                            })
                                            return true;
                                }`,
                                )
                                .join("\n")}
                            }
                        }
                        return false;
                    }

                    /**
                     * Removes a model unit. Returns false if anything goes wrong.
                     *
                     * @param oldUnit
                     */
                    removeUnit(oldUnit: ${Names.modelunit()}): boolean {
                        if (!!oldUnit) {
                            const myMetatype = oldUnit.freLanguageConcept();
                            switch (myMetatype) {
                            ${language.modelConcept
                                .allParts()
                                .map(
                                    (part) =>
                                        `case "${Names.classifier(part.type)}": {
                                            AST.changeNamed("removeUnit", () => {
                                                ${
                                                    part.isList
                                                        ? `this.${part.name}.splice(this.${part.name}.indexOf(oldUnit as ${Names.classifier(part.type)}), 1);`
                                                        : `this.${part.name} = null;`
                                                }
                                            })
                                            return true;
                                        }`,
                                )
                                .join("\n")}
                            }
                        }
                        return false;
                    }

                /**
                 * Returns an empty model unit of type 'typeName' within 'model'.
                 *
                 * @param typename
                 */
                newUnit(typename: ${Names.metaType()}) : ${Names.modelunit()}  {
                    switch (typename) {
                        ${language.modelConcept
                            .allParts()
                            .map(
                                (part) =>
                                    `case "${Names.classifier(part.type)}": {
                                        let unit: ${Names.classifier(part.type)};
                                        runInAction( () => {
                                            unit = ${Names.classifier(part.type)}.create({});
                                        })
                                        AST.changeNamed("newUnit", () => {
                                            ${
                                                part.isList
                                                    ? `this.${part.name}.push(unit as ${Names.classifier(part.type)});`
                                                    : `this.${part.name} = unit as ${Names.classifier(part.type)}`
                                            }
                                        })
                                        return unit;
                                    }`,
                            )
                            .join("\n")}
                    }
                    return null;
                }

                    /**
                     * Returns a list of model units.
                     */
                    getUnits(): ${Names.modelunit()}[] {
                        let result : ${Names.modelunit()}[] = [];
                        ${language.modelConcept
                            .allParts()
                            .map(
                                (part) =>
                                    `${
                                        part.isList
                                            ? `result = result.concat(this.${part.name});`
                                            : `if (!!this.${part.name}) {
                    result.push(this.${part.name});
                 }`
                                    }`,
                            )
                            .join("\n")}
                        return result;
                    }

                    /**
                     * Returns a list of model units of type 'type'.
                     */
                    getUnitsForType(type: string): ${Names.modelunit()}[] {
                        switch (type) {
                        ${language.modelConcept
                            .allParts()
                            .map(
                                (part) =>
                                    `${
                                        part.isList
                                            ? `case "${Names.classifier(part.type)}": {
                                    return this.${part.name};
                                }`
                                            : `case "${Names.classifier(part.type)}": {
                                    let result : ${Names.modelunit()}[] = [];
                                    result.push(this.${part.name});
                                    return result;
                                }`
                                    }`,
                            )
                            .join("\n")}
                        }
                        return [];
                    }
                }`;

        return `
            import { ${Names.modelunit()}, ${coreImports.values().toArray().map(v => ImportsUtil.imports(v)).join(",")} } from "${FREON_CORE}";
            import { ${modelImports.join(", ")} } from "./internal.js";

            ${result}`;
    }

    private findModelImports(modelDescription: FreMetaModelDescription, myName: string): string[] {
        return Array.from(
            new Set(
                modelDescription
                    .parts()
                    .map((part) => Names.classifier(part.type))
                    // .concat(Names.metaType(modelDescription.language))
                    .filter((name) => !(name === myName))
                    .filter((r) => r !== null && r.length > 0),
            ),
        );
    }
}
