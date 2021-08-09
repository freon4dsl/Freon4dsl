/**
 * Copyright (C) 2020 Dr. David H. Akehurst (http://dr.david.h.akehurst.net)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export class SimpleExampleUnit {
    definition: Definition[] = [];
}

export abstract class Definition {}

export class ClassDefinition extends Definition {
    name: String;
    properties: PropertyDefinition[] = [];
    // properties = mutableListOf<PropertyDefinition>();
    methods: MethodDefinition[] = [];
    // methods = mutableListOf<MethodDefinition>();
    // TODO members
    // members get() = properties + methods;
    constructor(name: string) {
        super();
        this.name = name;
    }
}

export class PropertyDefinition {
    name: String;
    typeName: String;
    constructor(name: string, typeName: string) {
        this.name = name;
        this.typeName = typeName;
    }
}

export class ParameterDefinition {
    name: String;
    typeName: String;
    constructor(name: string, typeName: string) {
        this.name = name;
        this.typeName = typeName;
    }
}

export class MethodDefinition {
    name: String;
    paramList:ParameterDefinition[] = [];
    body: Statement[] = []; // mutableListOf<Statement>();
    constructor(name: string, paramList:ParameterDefinition[]) {
        this.name = name;
        this.paramList.push(...paramList);
    }
}

export abstract class Statement {}

export class StatementReturn extends Statement {
    expression: Expression;
}

export abstract class Expression {}

export class ExpressionLiteral extends Expression {
    value: any;
}

export class ExpressionVariableReference {
    value: String;
}

export class ExpressionInfixOperator extends Expression {
    lhs: Expression;
    operator: String;
    rhs: Expression;
}
