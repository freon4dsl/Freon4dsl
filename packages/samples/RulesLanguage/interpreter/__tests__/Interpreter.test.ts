import { PiElementReference, RtNumber, RtObject } from "@freon4dsl/core";
import { RulesLanguageEnvironment } from "../../config/gen/RulesLanguageEnvironment";
import {
    CheckingRule,
    RulesModel,
    Rules,
    Plus,
    NumberLiteral,
    RuleExpression,
    Multiply, Entity, Data, RFunction, Parameter, FunctionCall, ParameterRef, initializeLanguage
} from "../../language/gen/index";
import { MainRulesLanguageInterpreter } from "../MainRulesLanguageInterpreter";

describe("Demo Model", () => {
    beforeEach(done => {
        // RulesLanguageEnvironment.getInstance();
        done();
    });
    describe("Checking Interpreter", () => {
        RulesLanguageEnvironment.getInstance();
        const model: RulesModel = RulesModel.create({
            name: "rules 1",
            parse_location: null,
            entity: [Data.create({
                        name: "Data",
                        entities: [Entity.create({
                            name: "Person"
                        })],
                        functions: [RFunction.create({
                            name: "func",
                            parameters: [
                                Parameter.create({
                                    name: "par1"
                                }),
                                Parameter.create({
                                    name: "par2"
                                })
                            ],
                            body: Plus.create({
                                left:
                                    ParameterRef.create({
                                        par: PiElementReference.create<Parameter>("par1", "Parameter")
                                    }),
                                right:
                                    ParameterRef.create({
                                        par: PiElementReference.create<Parameter>("par2", "Parameter")
                                    })
                            })
                        })]
                    })],
            rules: [
                Rules.create({
                    name: "rules 1",
                    Rules: [
                        CheckingRule.create({
                            name: "aaa",
                            check: Plus.create({
                                left: Multiply.create({
                                    left: NumberLiteral.create({ value: "10" }),
                                    right: FunctionCall.create({
                                        func: PiElementReference.create<RFunction>("func", "RFunction"),
                                        arguments: [
                                            NumberLiteral.create({ value: "5" }),
                                            NumberLiteral.create({ value: "7" })
                                        ]
                                    })
                                }),
                                right: Multiply.create({
                                    left: NumberLiteral.create({ value: "30" }),
                                    right: NumberLiteral.create({ value: "3" })
                                })
                            })
                        })
                    ]
                })
            ]
        });

        beforeEach(done => {
            done();
        });

        test("Generated interpreter Check 10 * func(5, 7) + 30 * 3 === 210", () => {
            expect(model.name).not.toBeNull();
            const rexp: RuleExpression = (model.rules[0].Rules[0] as CheckingRule).check;
            const intp: MainRulesLanguageInterpreter = new MainRulesLanguageInterpreter();
            intp.setTracing(true);
            let result: RtObject = null;
            try {
                result =  intp.evaluate(rexp);
            } catch (e) {
                // console.log("E: " + e.toString())
                result = e;
            }
            console.log(intp.getTrace().root.toStringRecursive());
            expect(result?.rtType).toBe("RtNumber");
            expect((result as RtNumber).value).toBe(210);
        });

    });
});
