import { BinExpression, Expression, ModelContext } from "./Model";

describe("Model", () => {
    describe("container settings", () => {
        let ctx: ModelContext = new ModelContext();
        let root: BinExpression;
        let left: Expression;
        let right: Expression;
        let exp1: Expression;
        let exp2: Expression;

        beforeEach(function (done) {
            root = new BinExpression("root");
            left = new Expression("left1");
            right = new Expression("right1");

            root.left = left;
            root.right = right;

            exp1 = new Expression("list-exp1");
            exp2 = new Expression("list-exp2");
            root.somes.push(exp1, exp2);

            ctx.root = root;
            /*
                root {
                    left: "left1",
                    rught: "right1",
                    somes: [
                        "exp1",
                        "exp2"
                    ]
                }
             */
            done();
        });

        it("of children should be set at start", () => {
            expect(left.container).toBe(root);
            expect(left.propertyName).toBe("left");
            expect(left.propertyIndex).toBe(undefined);
            expect(right.container).toBe(root);
            expect(right.propertyName).toBe("right");
            expect(right.propertyIndex).toBe(undefined);
            expect(exp1.container).toBe(root);
            expect(exp1.propertyName).toBe("somes");
            expect(exp1.propertyIndex).toBe(0);
            expect(exp2.container).toBe(root);
            expect(exp2.propertyName).toBe("somes");
            expect(exp2.propertyIndex).toBe(1);
        });

        it("should be unset when assigned to null", () => {
            root.left = null;

            expect(root.left).toBe(null);
            expect(left.container).toBe(null);
            expect(left.propertyName).toBe("");
            expect(left.propertyIndex).toBe(undefined);
        });

        it("should be changed when moved", () => {
            root.left = right;
            root.right = root.somes[0];
            expect(root.left).toBe(right);
            // expect(root.right).toBe(null);

            expect(left.container).toBe(null);
            expect(left.propertyName).toBe("");
            expect(left.propertyIndex).toBe(undefined);

            expect(right.container).toBe(root);
            expect(right.propertyName).toBe("left");
            expect(right.propertyIndex).toBe(undefined);
        });

        it("should be changed when last element of array is moved", () => {
            root.left = root.somes[1];

            expect(root.left).toBe(exp2);

            expect(left.container).toBe(null);
            expect(left.propertyName).toBe("");
            expect(left.propertyIndex).toBe(undefined);

            expect(exp2.container).toBe(root);
            expect(exp2.propertyName).toBe("left");
            expect(exp2.propertyIndex).toBe(undefined);

            expect(root.somes[0]).toBe(exp1);
            expect(root.somes[1]).toBe(undefined);
            expect(root.somes.length).toBe(1);
        });
        it("should be changed when first element of array is moved 2", () => {
            root.left = root.somes[0];

            expect(root.left).toBe(exp1);

            expect(left.container).toBe(null);
            expect(left.propertyName).toBe("");
            expect(left.propertyIndex).toBe(undefined);

            expect(exp1.container).toBe(root);
            expect(exp1.propertyName).toBe("left");
            expect(exp1.propertyIndex).toBe(undefined);

            expect(root.somes[0]).toBe(exp2);
            expect(root.somes[1]).toBe(undefined);
            expect(root.somes.length).toBe(1);
        });
        it("should be changed when element is assigned to array", () => {
            root.somes[0] = left;

            expect(root.left).toBe(null);

            expect(left.container).toBe(root);
            expect(left.propertyName).toBe("somes");
            expect(left.propertyIndex).toBe(0);

            expect(exp1.container).toBe(null);
            expect(exp1.propertyName).toBe("");
            expect(exp1.propertyIndex).toBe(undefined);

            expect(root.somes[0]).toBe(left);
            expect(root.somes[1]).toBe(exp2);
            expect(root.somes.length).toBe(2);
        });
    });
});
