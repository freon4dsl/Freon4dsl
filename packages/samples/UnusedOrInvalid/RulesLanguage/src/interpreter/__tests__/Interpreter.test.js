"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@freon4dsl/core");
var RulesLanguageEnvironment_1 = require("../../config/gen/RulesLanguageEnvironment");
var index_1 = require("../../language/gen/index");
var MainRulesLanguageInterpreter_1 = require("../MainRulesLanguageInterpreter");
describe("Demo Model", function () {
    beforeEach(function (done) {
        // RulesLanguageEnvironment.getInstance();
        done();
    });
    describe("Checking Interpreter", function () {
        RulesLanguageEnvironment_1.RulesLanguageEnvironment.getInstance();
        var model = index_1.RulesModel.create({
            name: "rules 1",
            parse_location: null,
            entity: [index_1.Data.create({
                    name: "Data",
                    entities: [index_1.Entity.create({
                            name: "Person"
                        })],
                    functions: [index_1.RFunction.create({
                            name: "func",
                            parameters: [
                                index_1.Parameter.create({
                                    name: "par1"
                                }),
                                index_1.Parameter.create({
                                    name: "par2"
                                })
                            ],
                            body: index_1.Plus.create({
                                left: index_1.ParameterRef.create({
                                    par: core_1.PiElementReference.create("par1", "Parameter")
                                }),
                                right: index_1.ParameterRef.create({
                                    par: core_1.PiElementReference.create("par2", "Parameter")
                                })
                            })
                        })]
                })],
            rules: [
                index_1.Rules.create({
                    name: "rules 1",
                    Rules: [
                        index_1.CheckingRule.create({
                            name: "aaa",
                            check: index_1.Plus.create({
                                left: index_1.Multiply.create({
                                    left: index_1.NumberLiteral.create({ value: "10" }),
                                    right: index_1.FunctionCall.create({
                                        func: core_1.PiElementReference.create("func", "RFunction"),
                                        arguments: [
                                            index_1.NumberLiteral.create({ value: "5" }),
                                            index_1.NumberLiteral.create({ value: "7" })
                                        ]
                                    })
                                }),
                                right: index_1.Multiply.create({
                                    left: index_1.NumberLiteral.create({ value: "30" }),
                                    right: index_1.NumberLiteral.create({ value: "3" })
                                })
                            })
                        })
                    ]
                })
            ]
        });
        beforeEach(function (done) {
            done();
        });
        test("Generated interpreter Check 10 * func(5, 7) + 30 * 3 === 210", function () {
            expect(model.name).not.toBeNull();
            var rexp = model.rules[0].Rules[0].check;
            var intp = new MainRulesLanguageInterpreter_1.MainRulesLanguageInterpreter();
            intp.setTracing(true);
            var result = null;
            try {
                result = intp.evaluate(rexp);
            }
            catch (e) {
                // console.log("E: " + e.toString())
                result = e;
            }
            console.log(intp.getTrace().root.toStringRecursive());
            expect(result === null || result === void 0 ? void 0 : result.rtType).toBe("RtNumber");
            expect(result.value).toBe(210);
        });
    });
});
