import { AST, ReferenceUpdateManager } from "../../change-manager/index.js";
import { describe, test, expect, beforeEach } from "vitest";
import {
    CalculatorModel,
    Calculator,
    InputField,
    OutputField,
    InputFieldReference,
    CalcExpression,
    LiteralExpression,
    NumberLiteralExpression,
    BinaryExpression,
    PlusExpression,
    type INamedConcept,
    initializeLanguage,
} from "./reference-change-model/internal.js";
import { ModelCreator } from "./ModelCreator";


describe("Update references when name changes", () => {
    initializeLanguage();
    // Reference updater needs to be initialized
    ReferenceUpdateManager.getInstance()

    test(" for simple model", () => {
        let model: CalculatorModel = ModelCreator.createSimpleModel();
        AST.change(() => {
            model.calc[0].inputFields[0].name = "z"
        })
        expect(model.calc[0].inputFields[0].name).toBe("z");
        expect((model.calc[0].outputFields[0].expression as InputFieldReference).field.name).toBe("z");
    })

    test(" for multiple references", () => {
        let model: CalculatorModel = ModelCreator.createModelWithMultipleReferences();
        AST.change(() => {
            model.calc[0].inputFields[1].name = "z"
        })
        expect(model.calc[0].inputFields[1].name).toBe("z");
        expect(((model.calc[0].outputFields[0].expression as
            PlusExpression).right as InputFieldReference).field.name).toBe("z");
        expect(((model.calc[0].outputFields[1].expression as
            PlusExpression).right as InputFieldReference).field.name).toBe("z");
        expect((model.calc[0].outputFields[2].expression as InputFieldReference).field.name).toBe("z");
    })

    test(" for cross-unit references", () => {
        let model: CalculatorModel = ModelCreator.createModelWithCrossUnitReferences();
        AST.change(() => {
            model.calc[0].inputFields[0].name = "z"
            model.calc[0].inputFields[1].name = "t"
        })
        expect(model.calc[0].inputFields[0].name).toBe("z");
        expect(model.calc[0].inputFields[1].name).toBe("t");
        expect(((model.calc[1].outputFields[0].expression as
            PlusExpression).left as InputFieldReference).field.name).toBe("z");
        expect(((model.calc[1].outputFields[0].expression as
            PlusExpression).right as InputFieldReference).field.name).toBe("t");
        expect(((model.calc[1].outputFields[1].expression as
            PlusExpression).right as InputFieldReference).field.name).toBe("z");
    })

    test(" for referred fields with the same name", ()=>{
        let model: CalculatorModel = ModelCreator.createModelWithClashingNames();
        AST.change(() => {
            model.calc[0].inputFields[0].name = "z"
        })
        expect(model.calc[0].inputFields[0].name).toBe("z");
        expect(model.calc[1].inputFields[0].name).toBe("x");
        expect((model.calc[1].outputFields[0].expression as InputFieldReference).field.name).toBe("z");
        expect((model.calc[1].outputFields[1].expression as InputFieldReference).field.name).toBe("x");
    })
})
