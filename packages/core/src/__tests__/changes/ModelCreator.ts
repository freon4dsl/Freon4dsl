import {
    CalculatorModel,
    Calculator,
    InputField,
    OutputField,
    InputFieldReference,
    NumberLiteralExpression,
    PlusExpression,
} from "./reference-change-model/internal.js";
import { AST } from "../../change-manager/index.js";
import { FreNodeReference } from "../../ast/index.js"

export class ModelCreator {

    static createSimpleModel(): CalculatorModel {
        let model: CalculatorModel;
        AST.change( () => {
            let inputField: InputField = InputField.create({name: "x"})
            let outputField: OutputField = OutputField.create({expression:
                InputFieldReference.create({field: FreNodeReference.create(inputField, "InputField")})})
            let inputs: InputField[] = [inputField];
            let outputs: OutputField[] = [outputField];
            const unit1 = Calculator.create({name: "SimpleUnit",
                                        inputFields: inputs,
                                        outputFields: outputs})
            model = CalculatorModel.create({name: "SimpleModel", calc: [unit1]})
        })
        return model;
    }

    static createModelWithMultipleReferences(): CalculatorModel {
        let model: CalculatorModel;
        AST.change( () => {
            let inputField1: InputField = InputField.create({name: "x"})
            let inputField2: InputField = InputField.create({name: "y"})
            let outputField1: OutputField = OutputField.create({
                    expression: PlusExpression.create({
                            left:  InputFieldReference.create({
                                    field: FreNodeReference.create(inputField1, "InputField")}),
                            right:  InputFieldReference.create({
                                    field: FreNodeReference.create(inputField2, "InputField")})})
            })
            let outputField2: OutputField = OutputField.create({
                expression: PlusExpression.create({
                    left: NumberLiteralExpression.create({value: "10"}),
                    right: InputFieldReference.create({
                        field: FreNodeReference.create(inputField2, "InputField")
                    })
                })
            })
            let outputField3: OutputField = OutputField.create({
                expression: InputFieldReference.create({
                    field: FreNodeReference.create(inputField2, "InputField")})
            })
            let inputs: InputField[] = [inputField1, inputField2];
            let outputs: OutputField[] = [outputField1, outputField2, outputField3];
            const unit1 = Calculator.create({
                                        name: "MultipleReferencesUnit",
                                        inputFields: inputs,
                                        outputFields: outputs})
            model = CalculatorModel.create({name: "MultipleReferencesModel",
                                            calc: [unit1]})
        })
        return model;
    }

    static createModelWithCrossUnitReferences(): CalculatorModel {
        let model: CalculatorModel;
        AST.change( () => {
            let inputField1: InputField = InputField.create({name: "x"})
            let inputField2: InputField = InputField.create({name: "y"})
            let outputField1: OutputField = OutputField.create({
                expression: PlusExpression.create({
                    left:  InputFieldReference.create({
                        field: FreNodeReference.create(inputField1, "InputField")}),
                    right:  InputFieldReference.create({
                        field: FreNodeReference.create(inputField2, "InputField")})})
            })
            let outputField2: OutputField = OutputField.create({
                expression: PlusExpression.create({
                    left: NumberLiteralExpression.create({value: "100"}),
                    right: InputFieldReference.create({
                        field: FreNodeReference.create(inputField1, "InputField")
                    })
                })
            })
            let inputs: InputField[] = [inputField1, inputField2];
            let outputs: OutputField[] = [outputField1, outputField2];
            const unit1 = Calculator.create({
                name: "unit1",
                inputFields: inputs,
                outputFields: []})
            const unit2 = Calculator.create({
                name: "unit2",
                inputFields: [],
                outputFields: outputs})
            model = CalculatorModel.create({
                name: "CrossUnitReferences",
                calc: [unit1, unit2]})
        })
        return model;
    }

    static createModelWithClashingNames(): CalculatorModel {
        let model: CalculatorModel;
        AST.change(()=>{
            let inputField1: InputField = InputField.create({name: "x"})
            let inputField2: InputField = InputField.create({name: "x"})
            let outputField1: OutputField = OutputField.create({expression:
                    InputFieldReference.create({field: FreNodeReference.create(inputField1, "InputField")})})
            let outputField2: OutputField = OutputField.create({expression:
                    InputFieldReference.create({field: FreNodeReference.create(inputField2, "InputField")})})

            const unit1 = Calculator.create({
                name: "unit1",
                inputFields: [inputField1],
                outputFields: []})
            const unit2 = Calculator.create({
                name: "unit2",
                inputFields: [inputField2],
                outputFields: [outputField1, outputField2]})
            model = CalculatorModel.create({
                name: "ReferredFieldsHaveTheSameName",
                calc: [unit1, unit2]})
        })
        return model;
    }
}
