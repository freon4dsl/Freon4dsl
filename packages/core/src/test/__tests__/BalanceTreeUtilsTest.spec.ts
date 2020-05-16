import { CoreTestContext, CoreTestProjection, CoreTestActions } from "../testeditor";
import {
    CoreTestBinaryExpression,
    CoretestComparisonExpression, CoreTestModelElement,
    CoreTestMultiplyExpression, CoreTestPlaceholderExpression,
    CoreTestPlusExpression,
    CoreTestPowerExpression,
    CoreTestStringLiteralExpression
} from "../testmodel";
import { Box, PiEditor } from "../../editor";
import { AFTER_BINARY_OPERATOR, BEFORE_BINARY_OPERATOR, BTREE, LEFT_MOST, PiLogger, RIGHT_MOST } from "../../util";

describe("BalanceTree", () => {
    describe("insertBinaryExpression without binary child", () => {
        let context: CoreTestContext;
        let root: CoreTestBinaryExpression;
        let left: CoreTestStringLiteralExpression;
        let right: CoreTestStringLiteralExpression;
        let rootBox: Box;
        let editor: PiEditor;
        let projection: CoreTestProjection;
        const action = new CoreTestActions();

        beforeEach(done => {
            PiLogger.muteAllLogs();
            root = new CoreTestPlusExpression();
            left = new CoreTestStringLiteralExpression();
            left.value = "rootLeft";
            right = new CoreTestStringLiteralExpression();
            right.value = "rootRight";
            root.left = left;
            root.right = right;
            // TODO remove this class, outdated.
            context = new CoreTestContext(root);
            projection = new CoreTestProjection();
            rootBox = projection.getBox(root);
            editor = new PiEditor(projection, action);
            editor.rootElement = context.rootElement;
            editor.getPlaceHolderExpression = () => {
                return new CoreTestPlaceholderExpression();
            };

            done();
        });

        describe("with lower priority", () => {
            it("should insert to the left of the operator correctly: <left> Insertion-point <operator> <right>", () => {
                const box = rootBox.findBox(root.piId(), BEFORE_BINARY_OPERATOR);
                const newExp = CoretestComparisonExpression.create("<");

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(newExp);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('("rootLeft" < (... + "rootRight"))');
            });

            it("should insert to the right of the operator correctly: <left> <operator> Insertion-point <right>", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = CoretestComparisonExpression.create("<");

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(newExp);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('(("rootLeft" + ...) < "rootRight")');
            });

            it("should insert at left most of the expression correctly: Insertion-point <left> <operator> <right>", () => {
                const box = rootBox.findBox(left.piId(), LEFT_MOST);
                const newExp = CoretestComparisonExpression.create("<");

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('(... < ("rootLeft" + "rootRight"))');
            });

            it("should insert at right most of the expression correctly", () => {
                const box = rootBox.findBox(right.piId(), RIGHT_MOST);
                const newExp = CoretestComparisonExpression.create("<");

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('(("rootLeft" + "rootRight") < ...)');
            });
        });

        describe("with equal priority", () => {
            it("should insert left of the operator correctly: <left> Insertion-point <operator> <right>", () => {
                const box = rootBox.findBox(root.piId(), BEFORE_BINARY_OPERATOR);
                const newExp = new CoreTestPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(root);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('(("rootLeft" + ...) + "rootRight")');
            });

            it("should insert 'right' correctly", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new CoreTestPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(newExp);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('(("rootLeft" + ...) + "rootRight")');
            });

            it("should insert 'pre' correctly", () => {
                const box = rootBox.findBox(left.piId(), LEFT_MOST);
                const newExp = new CoreTestPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(root);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('((... + "rootLeft") + "rootRight")');
            });

            it("should insert 'post' correctly", () => {
                const box = rootBox.findBox(right.piId(), RIGHT_MOST);
                const newExp = new CoreTestPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(newExp);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('(("rootLeft" + "rootRight") + ...)');
            });
        });

        describe("with higher priority", () => {
            it("should insert 'left' correctly", () => {
                const box = rootBox.findBox(root.piId(), BEFORE_BINARY_OPERATOR);
                const newExp = new CoreTestMultiplyExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(root);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('(("rootLeft" * ...) + "rootRight")');
            });

            it("should insert 'right' correctly", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new CoreTestMultiplyExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(root);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('("rootLeft" + (... * "rootRight"))');
            });

            it("should insert 'pre' correctly", () => {
                const box = rootBox.findBox(left.piId(), LEFT_MOST);
                const newExp = new CoreTestMultiplyExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(root);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('((... * "rootLeft") + "rootRight")');
            });

            it("should insert 'post' correctly", () => {
                const box = rootBox.findBox(right.piId(), RIGHT_MOST);
                const newExp = new CoreTestMultiplyExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(root);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe('("rootLeft" + ("rootRight" * ...))');
            });
        });
    });

    describe("insertBinaryExpression with binaryExpression child", () => {
        let context: CoreTestContext;
        let root: CoreTestBinaryExpression;
        let left: CoreTestStringLiteralExpression;
        let multiLeft: CoreTestStringLiteralExpression;
        let multiRight: CoreTestStringLiteralExpression;
        let rootBox: Box;
        let multiply: CoreTestMultiplyExpression;
        let projection: CoreTestProjection;
        let editor: PiEditor;

        beforeEach(done => {
            root = CoretestComparisonExpression.create("<");
            left = new CoreTestStringLiteralExpression();
            left.value = "rootLeft";
            multiRight = new CoreTestStringLiteralExpression();
            multiRight.value = "multiplyRight";
            multiLeft = new CoreTestStringLiteralExpression();
            multiLeft.value = "multiplyLeft";
            multiply = new CoreTestMultiplyExpression();
            root.left = left;
            root.right = multiply;
            multiply.right = multiRight;
            multiply.left = multiLeft;
            context = new CoreTestContext(root);
            const action = new CoreTestActions();
            projection = new CoreTestProjection();
            rootBox = projection.getBox(root);
            editor = new PiEditor(projection, action);
            editor.rootElement = context.rootElement;
            editor.getPlaceHolderExpression = () => {
                return new CoreTestPlaceholderExpression();
            };
            PiLogger.muteAllLogs();

            done();
        });

        it("should initialize correctly", () => {
            expect((editor.rootElement as CoreTestModelElement).toString()).toBe('("rootLeft" < ("multiplyLeft" * "multiplyRight"))');
        });

        describe("with lower priority", () => {
            it("should insert 'right' of < correctly", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new CoreTestPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe(
                    '("rootLeft" < (... + ("multiplyLeft" * "multiplyRight")))'
                );
            });
            it("should insert 'right' of * correctly", () => {
                const box = rootBox.findBox(multiply.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new CoreTestPlusExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe(
                    '("rootLeft" < (("multiplyLeft" * ...) + "multiplyRight"))'
                );
            });
        });

        describe("with equal priority", () => {
            it("should insert 'right' of < correctly", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new CoreTestMultiplyExpression();

                expect((editor.rootElement as CoreTestModelElement).toString()).toBe('("rootLeft" < ("multiplyLeft" * "multiplyRight"))');

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(root);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe(
                    '("rootLeft" < ((... * "multiplyLeft") * "multiplyRight"))'
                );
            });
            it("should insert 'right' of * correctly", () => {
                const box = rootBox.findBox(multiply.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new CoreTestMultiplyExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(root);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe(
                    '("rootLeft" < (("multiplyLeft" * ...) * "multiplyRight"))'
                );
            });
        });
        describe("with higher priority", () => {
            it("should insert 'right' of < correctly", () => {
                const box = rootBox.findBox(root.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new CoreTestPowerExpression();

                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(root);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe(
                    '("rootLeft" < ((... ^ "multiplyLeft") * "multiplyRight"))'
                );
            });
            it("should insert 'right' of * correctly", () => {
                const box = rootBox.findBox(multiply.piId(), AFTER_BINARY_OPERATOR);
                const newExp = new CoreTestPowerExpression();
                BTREE.insertBinaryExpression(newExp, box!, editor);

                expect(editor.rootElement).toBe(root);
                expect((editor.rootElement as CoreTestModelElement).asString()).toBe(
                    '("rootLeft" < ("multiplyLeft" * (... ^ "multiplyRight")))'
                );
            });
        });
    });
});
