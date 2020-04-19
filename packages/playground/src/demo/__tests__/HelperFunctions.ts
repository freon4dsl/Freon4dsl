import {
    DemoLiteralExpression,
    DemoNumberLiteralExpression,
    DemoBooleanLiteralExpression,
    DemoStringLiteralExpression,
    DemoPlaceholderExpression,
    DemoComparisonExpression,
    DemoBinaryExpression,
    DemoLessThenExpression,
    DemoGreaterThenExpression,
    DemoEqualsExpression,
    DemoMultiplyExpression,
    DemoPlusExpression,
    DemoDivideExpression,
    DemoExpression
} from "../language/gen";

export function makeLiteralExp(incoming: any): DemoLiteralExpression {
    let mine: DemoLiteralExpression;
    if (typeof incoming === "string" && /[0-9]+/.test(incoming)) {
        mine = new DemoNumberLiteralExpression();
        (mine as DemoNumberLiteralExpression).value = incoming;
    } else if (typeof incoming === "string" && (incoming === "true" || incoming === "false")) {
        mine = new DemoBooleanLiteralExpression();
        (mine as DemoBooleanLiteralExpression).value = incoming;
    } else if (typeof incoming === "string") {
        mine = new DemoStringLiteralExpression();
        (mine as DemoStringLiteralExpression).value = incoming;
    } else {
        // When no expression can be created, return a place holder expression.
        mine = new DemoPlaceholderExpression();
    }
    return mine;
}

export function MakeLessThenExp(left: any, right: any): DemoComparisonExpression {
    const condition: DemoBinaryExpression = new DemoLessThenExpression(); // ("<");
    addToBinaryExpression(left, condition, right);
    return condition;
}

export function MakeGreaterThenExp(left: any, right: any): DemoComparisonExpression {
    const condition: DemoBinaryExpression = new DemoGreaterThenExpression(); // (">");
    addToBinaryExpression(left, condition, right);
    return condition;
}

export function MakeEqualsExp(left: any, right: any): DemoComparisonExpression {
    const condition: DemoBinaryExpression = new DemoEqualsExpression(); // ("=");
    addToBinaryExpression(left, condition, right);
    return condition;
}

export function MakeMultiplyExp(left: any, right: any): DemoMultiplyExpression {
    const multiplication: DemoMultiplyExpression = new DemoMultiplyExpression(); // ("*");
    addToBinaryExpression(left, multiplication, right);
    return multiplication;
}

export function MakePlusExp(left: any, right: any): DemoPlusExpression {
    const plusExpression: DemoBinaryExpression = new DemoPlusExpression(); // ("+");
    addToBinaryExpression(left, plusExpression, right);
    return plusExpression;
}

export function MakeDivideExp(left: any, right: any): DemoDivideExpression {
    const divideExpression: DemoBinaryExpression = new DemoDivideExpression(); // ("/");
    addToBinaryExpression(left, divideExpression, right);
    return divideExpression;
}

export function addToBinaryExpression(left: any, binary: DemoBinaryExpression, right: any) {
    binary.left = determineType(left);
    binary.right = determineType(right);
}

export function determineType(incoming: any): DemoExpression {
    if (incoming instanceof DemoExpression) {
        return incoming;
    } else {
        return makeLiteralExp(incoming);
    }
}
