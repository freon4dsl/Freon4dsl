import { DemoExpression } from "./DemoExpression";

export abstract class DemoLiteralExpression extends DemoExpression {
    children(): DemoExpression[] {
        return [];
    }
}
