import {describe, expect, test} from "vitest";
import {RefactoringEnvironment} from "../config/gen/RefactoringEnvironment";
import {FileHandler} from "../../utils/FileHandler";
import {Entity, Refactoring, Rules, Unit} from "../language/gen";
import {FreError, FreNamedNode, FreNodeReference, FreReader, FreValidator, FreWriter} from "@freon4dsl/core";
import {rename} from "../editor/refactorings/Rename";


describe("Test renaming of node", () => {
    const reader: FreReader = RefactoringEnvironment.getInstance().reader;
    const unparser: FreWriter = RefactoringEnvironment.getInstance().writer;
    const validator: FreValidator = RefactoringEnvironment.getInstance().validator;
    const fileHandler: FileHandler = new FileHandler();

    test(": replace a reference within a unit", () => {
        // first create a model by reading one file
        let model: Refactoring = new Refactoring();
        let unit1: Unit = null;
        try {
            let input1 = fileHandler.stringFromFile("src/testRefactoring/__tests__/Unit.exm");
            unit1 = reader.readFromString(input1, "Unit", model) as Unit;
        } catch (e) {
            console.log(e.message)
        }
        expect(unit1).not.toBeNull;
        const errors: FreError[] = validator.validate(unit1,true);
        // console.log(errors.map(err => err.message));
        expect(errors.length).toBe(0);
        // all is well
        // find a node and do a rename of that node
        let toBeRenamed: Entity = unit1!.entities.find(ent => ent.name === 'ent24');
        expect(toBeRenamed).not.toBeNull;
        expect(toBeRenamed).not.toBeUndefined;
        // get all references to this node
        let refsToEnt24: FreNodeReference<FreNamedNode>[] = unit1!.findAllReferencesTo(toBeRenamed);

        rename(toBeRenamed, 'Peter');
        // unparse unit1 to a string and write it to File
        fileHandler.stringToFile("./unparsedUnit1.exm", unparser.writeToString(unit1));
        // the entity should not have the old name
        let shouldBeNull: Entity = unit1!.entities.find(ent => ent.name === 'ent24');
        expect(shouldBeNull).toBeNull;
        expect(shouldBeNull).toBeUndefined;
        // all references should have been replaced with the new name
        refsToEnt24.forEach(ref => {
            expect(ref.name).toBe('Peter');
        })
    });

    test.skip(": replace a reference in two units", () => {
        // first create a model by reading two files
        let model: Refactoring = new Refactoring();
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
        expect(unit1).not.toBeNull;
        expect(unit2).not.toBeNull;
        const errors: FreError[] = validator.validate(model,true);
        // console.log(errors.map(err => err.message));
        expect(errors.length).toBe(0);
        // all is well
        // find a node and do a rename of that node
        let toBeRenamed: Entity = unit1!.entities.find(ent => ent.name === 'ent24');
        expect(toBeRenamed).not.toBeNull;
        expect(toBeRenamed).not.toBeUndefined;
        // get all references to this node
        let refsToEnt24: FreNodeReference<FreNamedNode>[] = model.findAllReferencesTo(toBeRenamed);

        rename(toBeRenamed, 'Peter');
        // unparse unit1 to a string and write it to File
        fileHandler.stringToFile("./unparsedUnit1.exm", unparser.writeToString(unit1));
        // the entity should not have the old name
        let shouldBeNull: Entity = null;
        model.units.forEach(unt => {
            let found = unt.entities.find(ent => ent.name === 'ent24');
            if (!!found) {
                shouldBeNull = found;
            }
        });
        expect(shouldBeNull).toBeNull;
        expect(shouldBeNull).toBeUndefined;
        // all references should have been replaced with the new name
        refsToEnt24.forEach(ref => {
            expect(ref.name).toBe('Peter');
        })
    });
});
