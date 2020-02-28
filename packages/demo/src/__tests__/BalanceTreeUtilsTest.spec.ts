import {
    Box,
    PiContext,
    AFTER_BINARY_OPERATOR,
    BEFORE_BINARY_OPERATOR,
    LEFT_MOST,
    RIGHT_MOST,
    BTREE,
    PiEditor,
    PiLogger,
    PiUtils
} from "@projectit/core";
import { DemoContext, DemoProjection, DemoActions } from "../editor/index";
import {
    DemoBinaryExpression,
    DemoComparisonExpression,
    DemoIfExpression,
    DemoMultiplyExpression,
    DemoNumberLiteralExpression,
    DemoPlusExpression,
    DemoPowerExpression,
    DemoStringLiteralExpression,
    DemoVariableRefExpression
} from "../model/index";

describe("BalanceTree", () => {
    describe("insertBinaryExpression without binary child", () => {
        let context: DemoContext;
        let root: DemoBinaryExpression;
        let left: DemoStringLiteralExpression;
        let right: DemoStringLiteralExpression;
        let rootBox: Box;
        let editor: PiEditor;
        let projection: DemoProjection;
        const action = new DemoActions();

        beforeEach(done => {
            PiLogger.muteAllLogs();
            root = new DemoPlusExpression();
            left = new DemoStringLiteralExpression();
            left.value = "rootLeft";
            right = new DemoStringLiteralExpression();
            right.value = "rootRight";
            root.left = left;
            root.right = right;
            context = new DemoContext(root);
            projection = new DemoProjection();
            rootBox = projection.getBox(root);
            editor = new PiEditor(context, projection, action);
            done();
        });

        describe("with lower priority", () => {
            it("should insert to the left of the operator correctly: <left> Insertion-point <operator> <right>", () => {
                const box = rootBox.findBox(root.piId(), BEFORE_BINARY_OPERATOR);
                const newExp = DemoComparisonExpression.create("<");

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(newExp);
                expect(context.rootElement.asString()).toBe('("rootLeft" < (... + "rootRight"))');
            });

            it("should insert to the right of the operator correctly: <left> <operator> Insertion-point <right>", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = DemoComparisonExpression.create("<");

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(newExp);
                expect(context.rootElement.asString()).toBe('(("rootLeft" + ...) < "rootRight")');
            });

            it("should insert at left most of the expression correctly: Insertion-point <left> <operator> <right>", () => {
                const box = rootBox.findBox(left.piId(), LEFT_MOST);
                const newExp = DemoComparisonExpression.create("<");

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement.asString()).toBe('(... < ("rootLeft" + "rootRight"))');
            });

            it("should insert at right most of the expression correctly", () => {
                const box = rootBox.findBox(right.piId(), RIGHT_MOST);
                const newExp = DemoComparisonExpression.create("<");

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement.asString()).toBe('(("rootLeft" + "rootRight") < ...)');
            });
        });

        describe("with equal priority", () => {
            it("should insert left of the operator correctly: <left> Insertion-point <operator> <right>", () => {
                const box = rootBox.findBox(root.piId(), BEFORE_BINARY_OPERATOR);
                const newExp = new DemoPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(root);
                expect(context.rootElement.asString()).toBe('(("rootLeft" + ...) + "rootRight")');
            });

            it("should insert 'right' correctly", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new DemoPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(newExp);
                expect(context.rootElement.asString()).toBe('(("rootLeft" + ...) + "rootRight")');
            });

            it("should insert 'pre' correctly", () => {
                const box = rootBox.findBox(left.piId(), LEFT_MOST);
                const newExp = new DemoPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(root);
                expect(context.rootElement.asString()).toBe('((... + "rootLeft") + "rootRight")');
            });

            it("should insert 'post' correctly", () => {
                const box = rootBox.findBox(right.piId(), RIGHT_MOST);
                const newExp = new DemoPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(newExp);
                expect(context.rootElement.asString()).toBe('(("rootLeft" + "rootRight") + ...)');
            });
        });

        describe("with higher priority", () => {
            it("should insert 'left' correctly", () => {
                const box = rootBox.findBox(root.piId(), BEFORE_BINARY_OPERATOR);
                const newExp = new DemoMultiplyExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(root);
                expect(context.rootElement.asString()).toBe('(("rootLeft" * ...) + "rootRight")');
            });

            it("should insert 'right' correctly", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new DemoMultiplyExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(root);
                expect(context.rootElement.asString()).toBe('("rootLeft" + (... * "rootRight"))');
            });

            it("should insert 'pre' correctly", () => {
                const box = rootBox.findBox(left.piId(), LEFT_MOST);
                const newExp = new DemoMultiplyExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(root);
                expect(context.rootElement.asString()).toBe('((... * "rootLeft") + "rootRight")');
            });

            it("should insert 'post' correctly", () => {
                const box = rootBox.findBox(right.piId(), RIGHT_MOST);
                const newExp = new DemoMultiplyExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(root);
                expect(context.rootElement.asString()).toBe('("rootLeft" + ("rootRight" * ...))');
            });
        });
    });

    describe("insertBinaryExpression with binaryExpression child", () => {
        let context: DemoContext;
        let root: DemoBinaryExpression;
        let left: DemoStringLiteralExpression;
        let multiLeft: DemoStringLiteralExpression;
        let multiRight: DemoStringLiteralExpression;
        let rootBox: Box;
        let multiply: DemoMultiplyExpression;
        let projection: DemoProjection;
        let editor: PiEditor;

        beforeEach(done => {
            root = DemoComparisonExpression.create("<");
            left = new DemoStringLiteralExpression();
            left.value = "rootLeft";
            multiRight = new DemoStringLiteralExpression();
            multiRight.value = "multiplyRight";
            multiLeft = new DemoStringLiteralExpression();
            multiLeft.value = "multiplyLeft";
            multiply = new DemoMultiplyExpression();
            root.left = left;
            root.right = multiply;
            multiply.right = multiRight;
            multiply.left = multiLeft;
            context = new DemoContext(root);
            const action = new DemoActions();
            projection = new DemoProjection();
            rootBox = projection.getBox(root);
            editor = new PiEditor(context, projection, action);
            PiLogger.muteAllLogs();

            done();
        });

        it("should initialize correctly", () => {
            expect(context.rootElement.toString()).toBe('("rootLeft" < ("multiplyLeft" * "multiplyRight"))');
        });

        describe("with lower priority", () => {
            it("should insert 'right' of < correctly", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new DemoPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);
                expect(context.rootElement.asString()).toBe(
                    '("rootLeft" < (... + ("multiplyLeft" * "multiplyRight")))'
                );
            });
            it("should insert 'right' of * correctly", () => {
                const box = rootBox.findBox(multiply.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new DemoPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);
                expect(context.rootElement.asString()).toBe(
                    '("rootLeft" < (("multiplyLeft" * ...) + "multiplyRight"))'
                );
            });
        });

        describe("with equal priority", () => {
            it("should insert 'right' of < correctly", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new DemoMultiplyExpression();

                expect(context.rootElement.toString()).toBe('("rootLeft" < ("multiplyLeft" * "multiplyRight"))');

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(root);
                expect(context.rootElement.asString()).toBe(
                    '("rootLeft" < ((... * "multiplyLeft") * "multiplyRight"))'
                );
            });
            it("should insert 'right' of * correctly", () => {
                const box = rootBox.findBox(multiply.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new DemoMultiplyExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(root);
                expect(context.rootElement.asString()).toBe(
                    '("rootLeft" < (("multiplyLeft" * ...) * "multiplyRight"))'
                );
            });
        });
        describe("with higher priority", () => {
            it("should insert 'right' of < correctly", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new DemoPowerExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(root);
                expect(context.rootElement.asString()).toBe(
                    '("rootLeft" < ((... ^ "multiplyLeft") * "multiplyRight"))'
                );
            });
            it("should insert 'right' of * correctly", () => {
                const box = rootBox.findBox(multiply.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new DemoPowerExpression();
                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(context.rootElement).toBe(root);
                expect(context.rootElement.asString()).toBe(
                    '("rootLeft" < ("multiplyLeft" * (... ^ "multiplyRight")))'
                );
            });
        });
    });
});
