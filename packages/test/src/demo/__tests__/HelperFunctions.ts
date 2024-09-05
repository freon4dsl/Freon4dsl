import {
    DemoNumberLiteralExpression,
    DemoBooleanLiteralExpression,
    DemoStringLiteralExpression,
    DemoComparisonExpression,
    DemoBinaryExpression,
    DemoLessThenExpression,
    DemoGreaterThenExpression,
    DemoEqualsExpression,
    DemoMultiplyExpression,
    DemoPlusExpression,
    DemoDivideExpression,
    DemoExpression,
} from "../language/gen";

export function makeLiteralExp(incoming: any): DemoExpression {
    let mine: DemoExpression;
    if (typeof incoming === "string" && /[0-9]+/.test(incoming)) {
        mine = new DemoNumberLiteralExpression();
        (mine as DemoNumberLiteralExpression).value = Number.parseInt(incoming, 10);
    } else if (typeof incoming === "string" && (incoming === "true" || incoming === "false")) {
        mine = new DemoBooleanLiteralExpression();
        (mine as DemoBooleanLiteralExpression).value = incoming === "true";
    } else if (typeof incoming === "string") {
        mine = new DemoStringLiteralExpression();
        (mine as DemoStringLiteralExpression).value = incoming;
    } else {
        // When no expression can be created, return a placeholder expression.
        mine = null;
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
    const plusExpression: DemoPlusExpression = new DemoPlusExpression(); // ("+");
    addToBinaryExpression(left, plusExpression, right);
    return plusExpression;
}

export function MakeDivideExp(left: any, right: any): DemoDivideExpression {
    const divideExpression: DemoDivideExpression = new DemoDivideExpression(); // ("/");
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
