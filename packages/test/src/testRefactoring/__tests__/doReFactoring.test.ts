import {describe, expect, test} from "vitest";
import {RefactoringEnvironment} from "../config/gen/RefactoringEnvironment";
import {FileHandler} from "../../utils/FileHandler";
import {Attribute, AttributeRef, CheckingRule, Entity, Refactoring, Rules, Unit} from "../language/gen";
import {FreError, FreNamedNode, FreNodeReference, FreReader, FreValidator, FreWriter} from "@freon4dsl/core";
import {rename} from "../editor/refactorings/Rename";


describe("Test renaming of node", () => {
    const reader: FreReader = RefactoringEnvironment.getInstance().reader;
    const unparser: FreWriter = RefactoringEnvironment.getInstance().writer;
    const validator: FreValidator = RefactoringEnvironment.getInstance().validator;
    const fileHandler: FileHandler = new FileHandler();

    test(": replace a reference to an entity within a unit", () => {
        // first create a model by reading one file
        let model: Refactoring = Refactoring.create({name: "RefactorModel"});
        let unit1: Unit = null;
        try {
            let input1 = fileHandler.stringFromFile("src/testRefactoring/__tests__/Unit.exm");
            unit1 = reader.readFromString(input1, "Unit", model) as Unit;
        } catch (e) {
            console.log(e.message)
        }
        expect(unit1).not.toBeNull();
        const errors: FreError[] = validator.validate(model,true);
        // console.log(errors.map(err => err.message));
        expect(errors.length).toBe(0);
        // all is well
        // find a node and do a rename of that node
        let toBeRenamed: Entity = unit1!.entities.find(ent => ent.name === 'ent24');
        expect(toBeRenamed).not.toBeNull();
        expect(toBeRenamed).not.toBeUndefined();
        // get all references to this node
        let refsToEnt24: FreNodeReference<FreNamedNode>[] = unit1!.findAllReferencesTo(toBeRenamed);

        rename(toBeRenamed, 'Peter');
        // unparse unit1 to a string and write it to File
        fileHandler.stringToFile("./unparsedUnit1.exm", unparser.writeToString(unit1));
        // the entity should not have the old name
        let shouldBeUndefined: Entity = unit1!.entities.find(ent => ent.name === 'ent24');
        expect(shouldBeUndefined).toBeUndefined();
        // all references should have been replaced with the new name
        refsToEnt24.forEach(ref => {
            expect(ref.name).toBe('Peter');
        })
    });

    test(": replace a reference to an entity in two units", () => {
        // first create a model by reading two files
        let model: Refactoring = Refactoring.create({name: "RefactorModel"});
        let unit1: Unit = null;
        let unit2: Rules = null;
        try {
            let input1 = fileHandler.stringFromFile("src/testRefactoring/__tests__/Unit.exm");
            unit1 = reader.readFromString(input1, "Unit", model) as Unit;
            let input2 = fileHandler.stringFromFile("src/testRefactoring/__tests__/Rules.rules");
            unit2 = reader.readFromString(input2, "Rules", model) as Rules;
        } catch (e) {
            console.log(e.message)
        }
        expect(unit1).not.toBeNull();
        expect(unit2).not.toBeNull();
        const errors: FreError[] = validator.validate(model,true);
        console.log(errors.map(err => err.message));
        expect(errors.length).toBe(0);
        // all is well
        // find a node and do a rename of that node
        let toBeRenamed: Entity = unit1!.entities.find(ent => ent.name === 'entityNoMeths');
        expect(toBeRenamed).not.toBeNull();
        expect(toBeRenamed).not.toBeUndefined();
        // get all references to this node
        let refsToEntNoMeths: FreNodeReference<FreNamedNode>[] = model.findAllReferencesTo(toBeRenamed);

        rename(toBeRenamed, 'Peter');
        // unparse unit2 to a string and write it to File
        fileHandler.stringToFile("./unparsedRules.rules", unparser.writeToString(unit2));
        // the entity should not have the old name
        let shouldBeNull: Entity = null;
        model.units.forEach(unt => {
            let found = unt.entities.find(ent => ent.name === 'entityNoMeths');
            if (!!found) {
                shouldBeNull = found;
            }
        });
        expect(shouldBeNull).toBeNull();
        // all references should have been replaced with the new name
        refsToEntNoMeths.forEach(ref => {
            expect(ref.name).toBe('Peter');
        })
    });

    test(": replace a reference to an attribute in two units", () => {
        // first create a model by reading two files
        let model: Refactoring = Refactoring.create({name: "RefactorModel"});
        let unit1: Unit = null;
        let unit2: Rules = null;
        try {
            let input1 = fileHandler.stringFromFile("src/testRefactoring/__tests__/Unit.exm");
            unit1 = reader.readFromString(input1, "Unit", model) as Unit;
            let input2 = fileHandler.stringFromFile("src/testRefactoring/__tests__/Rules.rules");
            unit2 = reader.readFromString(input2, "Rules", model) as Rules;
        } catch (e) {
            console.log(e.message)
        }
        expect(unit1).not.toBeNull();
        expect(unit2).not.toBeNull();
        expect(unit1).not.toBeUndefined();
        expect(unit2).not.toBeUndefined();
        const errors: FreError[] = validator.validate(model,true);
        console.log(errors.map(err => err.message));
        expect(errors.length).toBe(0);
        // all is well
        // find an attribute and do a rename of that attribute
        let toBeRenamedParent: Entity = unit1!.entities.find(ent => ent.name === 'entityNoMeths');
        let toBeRenamed: Attribute = toBeRenamedParent.attributes.find(att => att.name === "attrA")
        expect(toBeRenamed).not.toBeNull();
        expect(toBeRenamed).not.toBeUndefined();
        // get all references to this attribute
        let refsToAttrA: FreNodeReference<FreNamedNode>[] = model.findAllReferencesTo(toBeRenamed);

        // do the rename
        rename(toBeRenamed, 'John');
        // unparse both units to a string and write it to File
        fileHandler.stringToFile("./unparsedUnit1.exm", unparser.writeToString(unit1));
        fileHandler.stringToFile("./unparsedUnit2.exm", unparser.writeToString(unit2));
        // the attribute should not have the old name
        expect(toBeRenamed.name).toBe("John");
        // all references should have been replaced with the new name
        refsToAttrA.forEach(ref => {
            expect(ref.name).toBe('John');
        })
        // find the method which refers to an attribute with the same name in another entity
        let unRenamed: AttributeRef = null;
        model.units.forEach(unt => {
            let found = unt.entities.find(ent => ent.name === 'ent24');
            if (!!found) {
                let exp = found.methods.find(att => att.name === 'meth24').body;
                if (!!exp && exp instanceof AttributeRef) {
                    unRenamed = exp;
                }
            }
        });
        expect(unRenamed.attribute?.name).toBe('attrA');
        // the reference in unit2 should also be replaced
        unit2!.rules.forEach(r => {
            if (r instanceof CheckingRule && r.check instanceof AttributeRef) {
                console.log(r.check.attribute.name)
                expect(r.check.attribute.name).toBe("John")
            }
        })
    });
});
