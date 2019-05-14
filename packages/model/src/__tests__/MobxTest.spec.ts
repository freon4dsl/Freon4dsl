import { BinExpression, Expression, FunctionCallExpression, ModelContext } from "./MobxModel";
import { observe, reaction } from "mobx";
import {} from "jasmine";

describe("Mobx Model", () => {
    describe("container settings", () => {
        const ctx: ModelContext = new ModelContext();
        let root: BinExpression;
        let fcall: FunctionCallExpression;
        let left: Expression;
        let right: Expression;
        let exp1: Expression;
        let exp2: Expression;
        let reaktion: number = 0;
        let observedLeft: number = 0;

        beforeEach(done => {
            root = new BinExpression("root");
            left = new Expression("left1");
            fcall = new FunctionCallExpression("max");
            right = fcall;

            root.left = left;
            root.right = right;

            exp1 = new Expression("list-exp1");
            exp2 = new Expression("list-exp2");
            fcall.args.push(exp1, exp2);

            ctx.root = root;
            /*
                root {
                    left: "left1",
                    rught: "max" [
                            "exp1",
                            "exp2"
                        ]
                }
             */
            observedLeft = 0;
            observe(ctx, "root", () => observedLeft++);
            // const observableRoot = observable(root);
            // observe(observableRoot, "left", () => observedLeft++);
            reaction(
                () => {
                    return [
                        root.right,
                        root.left,
                        fcall.args.length > 0 ? fcall.args[0] : null,
                        fcall.args.length > 1 ? fcall.args[1] : null
                    ];
                },
                element => {
                    reaktion++;
                    // console.log("React " + reaktion + " on " + element);
                },
                false
            );
            reaktion = 0;
            done();
        });

        it("of children should be set at start", () => {
            expect(left.container).toBe(root);
            expect(left.propertyName).toBe("left");
            expect(left.propertyIndex).toBe(undefined);
            expect(right.container).toBe(root);
            expect(right.propertyName).toBe("right");
            expect(right.propertyIndex).toBe(undefined);
            expect(exp1.container).toBe(fcall);
            expect(exp1.propertyName).toBe("args");
            expect(exp1.propertyIndex).toBe(0);
            expect(exp2.container).toBe(fcall);
            expect(exp2.propertyName).toBe("args");
            expect(exp2.propertyIndex).toBe(1);
            expect(fcall.args[0]).toBe(exp1);
            expect(fcall.args[1]).toBe(exp2);
            expect(fcall.args.length).toBe(2);
        });

        it("should be unset when assigned to null", () => {
            root.left = null;

            expect(root.left).toBe(null);
            expect(left.container).toBe(null);
            expect(left.propertyName).toBe("");
            expect(left.propertyIndex).toBe(undefined);
            expect(reaktion).toBe(1);
        });

        it("should be changed when moved", () => {
            root.left = right;
            expect(root.right).toBe(null);
            expect(root.left).toBe(right);

            const tmp = fcall.args[0];
            root.right = tmp;

            expect(left.container).toBe(null);
            expect(left.propertyName).toBe("");
            expect(left.propertyIndex).toBe(undefined);

            expect(right.container).toBe(root);
            expect(right.propertyName).toBe("left");
            expect(right.propertyIndex).toBe(undefined);
            expect(fcall.args[0]).toBe(exp2);
            expect(fcall.args.length).toBe(1);
            expect(reaktion).toBe(2);
        });

        it("should be changed when last element of array is moved", () => {
            root.left = fcall.args[1];

            expect(root.left).toBe(exp2);

            expect(left.container).toBe(null);
            expect(left.propertyName).toBe("");
            expect(left.propertyIndex).toBe(undefined);

            expect(exp2.container).toBe(root);
            expect(exp2.propertyName).toBe("left");
            expect(exp2.propertyIndex).toBe(undefined);

            expect(fcall.args[0]).toBe(exp1);
            expect(fcall.args.length).toBe(1);
            expect(reaktion).toBe(2);
        });
        it("should be changed when first element of array is moved 2", () => {
            root.left = fcall.args[0];

            expect(root.left).toBe(exp1);

            expect(left.container).toBe(null);
            expect(left.propertyName).toBe("");
            expect(left.propertyIndex).toBe(undefined);

            expect(exp1.container).toBe(root);
            expect(exp1.propertyName).toBe("left");
            expect(exp1.propertyIndex).toBe(undefined);

            expect(fcall.args[0]).toBe(exp2);
            expect(fcall.args.length).toBe(1);
            expect(reaktion).toBe(2);
        });
        it("should be changed when element is assigned to array", () => {
            fcall.args[0] = left;

            expect(root.left).toBe(null);

            expect(left.container).toBe(fcall);
            expect(left.propertyName).toBe("args");
            expect(left.propertyIndex).toBe(0);

            expect(exp1.container).toBe(null);
            expect(exp1.propertyName).toBe("");
            expect(exp1.propertyIndex).toBe(undefined);

            expect(fcall.args[0]).toBe(left);
            expect(fcall.args[1]).toBe(exp2);
            expect(fcall.args.length).toBe(2);
            expect(reaktion).toBe(2);
        });
        it("should be changed when array is cleared", () => {
            fcall.args.splice(0, 2);

            expect(exp1.container).toBe(null);
            expect(exp1.propertyName).toBe("");
            expect(exp1.propertyIndex).toBe(undefined);
            expect(exp2.container).toBe(null);
            expect(exp2.propertyName).toBe("");
            expect(exp2.propertyIndex).toBe(undefined);

            expect(fcall.args.length).toBe(0);
            expect(reaktion).toBe(1);
        });
        it("should be changed when array element assigned null", () => {
            fcall.args[0] = null;

            expect(exp1.container).toBe(null);
            expect(exp1.propertyName).toBe("");
            expect(exp1.propertyIndex).toBe(undefined);
            expect(fcall.args[0]).toBe(null);

            expect(exp2.container).toBe(fcall);
            expect(exp2.propertyName).toBe("args");
            expect(exp2.propertyIndex).toBe(1);
            expect(fcall.args[1]).toBe(exp2);

            expect(fcall.args.length).toBe(2);
            expect(reaktion).toBe(1);
        });
        it("should be changed when array element is removed", () => {
            fcall.args.splice(0, 1);

            expect(exp1.container).toBe(null);
            expect(exp1.propertyName).toBe("");
            expect(exp1.propertyIndex).toBe(undefined);
            expect(fcall.args[0]).toBe(exp2);

            expect(exp2.container).toBe(fcall);
            expect(exp2.propertyName).toBe("args");
            expect(exp2.propertyIndex).toBe(0);

            expect(fcall.args.length).toBe(1);
            expect(reaktion).toBe(1);

            fcall.args.splice(0, 1);
        });
        it("should be changed when array element is inserted", () => {
            const newExp = new Expression("new expression");
            fcall.args.splice(1, 0, newExp);

            expect(newExp.container).toBe(fcall);
            expect(newExp.propertyName).toBe("args");
            expect(newExp.propertyIndex).toBe(1);
            expect(fcall.args[1]).toBe(newExp);

            expect(exp1.container).toBe(fcall);
            expect(exp1.propertyName).toBe("args");
            expect(exp1.propertyIndex).toBe(0);
            expect(fcall.args[0]).toBe(exp1);

            expect(exp2.container).toBe(fcall);
            expect(exp2.propertyName).toBe("args");
            expect(exp2.propertyIndex).toBe(2);
            expect(fcall.args[2]).toBe(exp2);

            expect(fcall.args.length).toBe(3);
            // expect(reaktion).toBe(1);

            // fcall.args.splice(0, 1);
        });
    });
});
