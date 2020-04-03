import { DemoLiteralExpression, DemoNumberLiteralExpression, DemoBooleanLiteralExpression, DemoStringLiteralExpression, DemoPlaceholderExpression } from "../language/gen";

export function makeLiteralExp(incoming: any) : DemoLiteralExpression {
    let mine: DemoLiteralExpression;
    if (typeof incoming === "string" && /[0-9]+/.test(incoming)) {
        mine = new DemoNumberLiteralExpression();
        (mine as DemoNumberLiteralExpression).value = incoming;
    }
    else if (typeof incoming === "string" && (incoming === "true" || incoming === "false")) {
        mine = new DemoBooleanLiteralExpression();
        (mine as DemoBooleanLiteralExpression).value = incoming;
    }
    else if (typeof incoming === "string") {
        mine = new DemoStringLiteralExpression();
        (mine as DemoStringLiteralExpression).value = incoming;
    }else {
        // When no expression can be created, return a place holder expression.
        mine = new DemoPlaceholderExpression();
    }
    return mine;
}