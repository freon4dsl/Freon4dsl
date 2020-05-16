import { CoreTestExpression } from "./CoreTestExpression";

export abstract class CoreTestLiteralExpression extends CoreTestExpression {
    children(): CoreTestExpression[] {
        return [];
    }
}
