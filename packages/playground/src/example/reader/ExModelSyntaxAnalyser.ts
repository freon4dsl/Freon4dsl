import {net} from "net.akehurst.language-agl-processor";
import SyntaxAnalyser = net.akehurst.language.api.syntaxAnalyser.SyntaxAnalyser;
import SharedPackedParseTree = net.akehurst.language.api.sppt.SharedPackedParseTree;
import SPPTBranch = net.akehurst.language.api.sppt.SPPTBranch;
import SPPTLeaf = net.akehurst.language.api.sppt.SPPTLeaf;
import SPPTNode = net.akehurst.language.api.sppt.SPPTNode;

import {
    AbsExpression, AndExpression,
    Attribute,
    BinaryExpression,
    BooleanLiteralExpression, DivideExpression,
    Entity, EqualsExpression,
    ExExpression,
    ExModel, GreaterThenExpression,
    IfExpression, LessThenExpression,
    LiteralExpression,
    Method, MethodCallExpression, MultiplyExpression,
    NumberLiteralExpression, OrExpression,
    Parameter,
    PlusExpression,
    StringLiteralExpression,
    Type, PiElementReference, ParameterRef, AppliedFeature, AttributeRef, LoopVariableRef, LoopVariable, SumExpression
} from "../language/gen";
import {PiNamedElement} from "@projectit/core";

export class ExModelSyntaxAnalyser implements SyntaxAnalyser {

    locationMap: any;

    clear(): void {
        throw new Error("Method not implemented.");
    }

    transform<T>(sppt: SharedPackedParseTree): T {
        if (!!sppt.root) {
            return this.transformNode(sppt.root) as unknown as T;
        } else {
            return null;
        }
    }

    private transformNode(node: SPPTNode): any {
        // console.log(`transformNode: ${node.name}`)
        if (node.isLeaf) {
            return (node as SPPTLeaf).matchedText;
        } else if (node.isBranch) {
            return this.transformBranch(node as SPPTBranch);
        }
    }

    private transformBranch(branch: SPPTBranch): any {
        var brName = branch.name;
        if ('ExModel' == brName) {
            return this.exmodel(branch);
        } else if ('Entity' == brName) {
            return this.entity(branch);
        } else if ('OptionalBaseEntity' == brName) {
            return this.optionalBaseEntity(branch);
        } else if ('Attribute' == brName) {
            return this.attribute(branch);
        } else if ('Method' == brName) {
            return this.method(branch);
        } else if ('Parameter' == brName) {
            return this.parameter(branch);
        } else if ('LiteralExpression' == brName) {
            return this.literalExpression(branch);
        } else if ('StringLiteralExpression' == brName) {
            return this.stringLiteralExpression(branch);
        } else if ('NumberLiteralExpression' == brName) {
            return this.numberLiteralExpression(branch);
        } else if ('BooleanLiteralExpression' == brName) {
            return this.booleanLiteralExpression(branch);
        // } else if ('AbsExpression' == brName) {
        //     return this.absExpression(branch);
        } else if ('ParameterRef' == brName) {
            return this.parameterRef(branch);
        } else if ('AttributeRef' == brName) {
            return this.attributeRef(branch);
        } else if ('LoopVariableRef' == brName) {
            return this.loopVariableRef(branch);
        } else if ('LoopVariable' == brName) {
            return this.loopVariable(branch);
        } else if ('AppliedFeature' == brName) {
            return this.appliedFeature(branch);
        } else if ('MethodCallExpression' == brName) {
            return this.methodCallExpression(branch);
        } else if ('GroupedExpression' == brName) {
            return this.groupedExpression(branch);
        } else if ('SumExpression' == brName) {
            return this.sumExpression(branch);
        } else if ('IfExpression' == brName) {
            return this.ifExpression(branch);
        } else if ('BinaryExpression' == brName) {
            return this.binaryExpression(branch);
        } else if ('ExExpression' == brName) {
            return this.exExpression(branch);
        } else {
            throw `Error: ${brName} not handled`;
        }
    }

    // ExModel = 'model' identifier '{'
    // Entity*
    // 'model' 'wide' 'Methods:'
    // Method*
    // '}' ;
    private exmodel(branch: SPPTBranch): ExModel {
        // console.log(`executing exmodel`);
        let result: ExModel = new ExModel();
        result.name = this.transformNode(branch.nonSkipChildren.toArray()[1]);
        result.entities.push(...this.transformList<Entity>(branch.nonSkipChildren.toArray()[3]));
        result.methods.push(...this.transformList<Method>(branch.nonSkipChildren.toArray()[7]));
        return result;
    }

    // Entity = 'Entity' identifier OptionalBaseEntity? '{'
    // Attribute*
    // Method*
    // '}' ;
    private entity(branch: SPPTBranch): Entity {
        // console.log(`executing entity`);
        let result: Entity = new Entity();
        let children: SPPTNode = branch.nonSkipChildren.toArray();

        result.name = this.transformNode(children[1]);

        // OptionalBaseEntity?
        const baseNode = children[2] as SPPTBranch;
        if (!baseNode.isEmptyMatch) {
            // transform the first element in the [0..1] optional collection
            result.baseEntity = this.optionalBaseEntity(baseNode.nonSkipChildren.toArray()[0]);
        }

        result.attributes.push(...this.transformList<Attribute>(children[4]));
        result.methods.push(...this.transformList<Method>(children[5]));
        return result;
    }

    // OptionalBaseEntity = 'base' EntityPiElemRef ;
    private optionalBaseEntity(branch: SPPTBranch): PiElementReference<Entity> {
        // console.log(`executing optionalBaseEntity: ` + branch.matchedText);
        // if (!branch.isEmptyMatch) {
        //     // TODO ask David why the second nonSkipChildren is needed and why it is [1].
        //     // JOS: Optional is equivalent to a List with 0 or 1 element, so you always have the list node in between.
        //     //    As the optional is in the 'entity' rule, the check on `isEmptyMatch' would be more logical
        //     //    in the entity rule, as I have done here
        // return this.piElemRef<Entity>(branch.nonSkipChildren.toArray()[0].nonSkipChildren.toArray()[1]);
        return this.piElemRef<Entity>(branch.nonSkipChildren.toArray()[1]);
        // } else {
        //     return null;
        // }
    }

    // Attribute = identifier ':' TypePiElemRef;
    private attribute(branch: SPPTBranch): Attribute {
        // console.log(`executing attribute`);
        let result = new Attribute();
        result.name = this.transformNode(branch.nonSkipChildren.toArray()[0]);
        result.declaredType = this.piElemRef<Type>(branch.nonSkipChildren.toArray()[2]);
        return result;
    }

    // Method = 'method' identifier '(' [Parameter / ',']* '):' TypePiElemRef '{'
    // ExExpression
    // '}' ;
    private method(branch: SPPTBranch): Method {
        // console.log(`executing method`);
        let result = new Method();
        result.name = this.transformNode(branch.nonSkipChildren.toArray()[1]);
        result.parameters.push(...this.transformList<Parameter>(branch.nonSkipChildren.toArray()[3], ','));
        result.declaredType = this.piElemRef<Type>(branch.nonSkipChildren.toArray()[5]);
        result.body = this.exExpression(branch.nonSkipChildren.toArray()[7]);
        return result;
    }

    // Parameter = identifier  ':'  TypePiElemRef;
    private parameter(branch: SPPTBranch): Parameter {
        let result = new Parameter();
        result.name = this.transformNode(branch.nonSkipChildren.toArray()[0]);
        result.declaredType = this.piElemRef<Type>(branch.nonSkipChildren.toArray()[2]);
        return result;
    }

    // ExExpression = LiteralExpression
    //     | AbsExpression
    //     | ParameterRef
    //     | LoopVariableRef
    //     | SumExpression
    //     | MethodCallExpression
    //     | IfExpression
    //     | BinaryExpression
    //     | GroupedExpression
    // abstract class
    private exExpression(branch: SPPTBranch) : ExExpression {
        // console.log(`executing exExpression`);
        return this.transformNode(branch.nonSkipChildren.toArray()[0]);
    }

    // LiteralExpression = StringLiteralExpression
    //     | NumberLiteralExpression
    //     | BooleanLiteralExpression ;
    // abstract class
    private literalExpression(branch: SPPTBranch) : LiteralExpression {
        // console.log(`executing literalExpression`);
        return this.transformNode(branch.nonSkipChildren.toArray()[0]);
    }

    // StringLiteralExpression = stringLiteral ;
    private stringLiteralExpression(branch: SPPTBranch) : StringLiteralExpression {
        // console.log(`executing StringLiteralExpression`);
        let result = new StringLiteralExpression();
        result.value = this.transformNode(branch.nonSkipChildren.toArray()[1]);
        return result;
    }

    // NumberLiteralExpression = numberLiteral ;
    private numberLiteralExpression(branch: SPPTBranch) : NumberLiteralExpression {
        // console.log(`executing NumberLiteralExpression`);
        let result = new NumberLiteralExpression();
        result.value = this.transformNode(branch.nonSkipChildren.toArray()[0]);
        return result;
    }

    // BooleanLiteralExpression = booleanLiteral ;
    // TODO Booleanliteral is defined as "true",  and thus also matches a string literal.
    //      And defining it as true without quotes also matches a LoopVariableReference.
    //      In both cases we need some way to distinguish these ambiguities, but it is not cleear from the context, the all fit!
    private booleanLiteralExpression(branch: SPPTBranch) : BooleanLiteralExpression {
        // console.log(`executing booleanLiteralExpression`);
        let result = new BooleanLiteralExpression();
        result.value = this.transformNode(branch.nonSkipChildren.toArray()[0]);
        return result;
    }

    // AbsExpression = 'abs(' ExExpression ')' ;
    private absExpression(branch: SPPTBranch) : AbsExpression {
        // console.log(`executing absExpression`);
        let result = new AbsExpression();
        result.expr = this.transformNode(branch.nonSkipChildren.toArray()[1]);
        return result;
    }

    // GroupedExpression = '(' ExExpression ')' ;
    private groupedExpression(branch: SPPTBranch) : ExExpression {
        console.log(`executing groupedExpression`);
        return this.transformNode(branch.nonSkipChildren.toArray()[1]);
    }

    // IfExpression = 'if' ExExpression 'then'
    // ExExpression
    // 'else'
    // ExExpression
    // 'endif';
    private ifExpression(branch: SPPTBranch) : IfExpression {
        console.log(`executing ifExpression`);
        let result = new IfExpression();
        result.condition = this.transformNode(branch.nonSkipChildren.toArray()[1]);
        result.whenTrue  = this.transformNode(branch.nonSkipChildren.toArray()[3]);
        result.whenFalse = this.transformNode(branch.nonSkipChildren.toArray()[5]);
        return result;
    }

    // MethodCallExpression = 'CALL' MethodPiElemRef '(' [ExExpression / ',']* ')' ;
    private methodCallExpression(branch: SPPTBranch) : MethodCallExpression {
        // console.log(`executing methodCallExpression`);
        let result = new MethodCallExpression();
        result.methodDefinition = this.piElemRef<Method>(branch.nonSkipChildren.toArray()[1]);
        const argsBranch = branch.nonSkipChildren.toArray()[3];
        if (!argsBranch.isEmptyMatch) {
            result.args.push(...this.transformList<ExExpression>(argsBranch, '*'));
        }
        return result;
    }

    // SumExpression = 'sum' 'from' LoopVariable '=' ExExpression 'to' ExExpression 'of' ExExpression;
    private sumExpression(branch: SPPTBranch) : SumExpression {
        // console.log(`executing methodCallExpression`);
        const variable = this.transformNode(branch.nonSkipChildren.toArray()[2]);
        const from = this.transformNode(branch.nonSkipChildren.toArray()[4]);
        const to = this.transformNode(branch.nonSkipChildren.toArray()[6]);
        const body = this.transformNode(branch.nonSkipChildren.toArray()[8]);

        return SumExpression.create({variable: variable, to: to, from: from, body: body});
    }

    // BinaryExpression = [ExExpression / operator]2+ ;
    private binaryExpression(branch: SPPTBranch) : BinaryExpression {
        console.log(`executing binaryExpression ${branch.matchedText}`);
        try {
            const actualList = branch.nonSkipChildren.toArray()[0].nonSkipChildren.toArray();
            let index = 0;
            let first = this.transformNode(actualList[index++]);
            while (index < actualList.length) {
                let operator = this.transformNode(actualList[index++]);
                let second = this.transformNode(actualList[index++]);
                let combined: BinaryExpression = null;
                switch (operator) {
                    case '*': {
                        combined = MultiplyExpression.create({left: first, right: second});
                        break;
                    }
                    case '/': {
                        combined = DivideExpression.create({left: first, right: second});
                        break;
                    }
                    case '+': {
                        combined = PlusExpression.create({left: first, right: second});
                        break;
                    }
                    case 'and': {
                        combined = AndExpression.create({left: first, right: second});
                        break;
                    }
                    case 'or': {
                        combined = OrExpression.create({left: first, right: second});
                        break;
                    }
                    case '<': {
                        combined = LessThenExpression.create({left: first, right: second});
                        break;
                    }
                    case '>': {
                        combined = GreaterThenExpression.create({left: first, right: second});
                        break;
                    }
                    case '==': {
                        combined = EqualsExpression.create({left: first, right: second});
                        break;
                    }
                    default: {
                        combined = null;
                    }
                }
                first = combined;
            }
            return first;
        } catch (e) {
            console.log(`binaryexpression ERROR: ${e.message}`);
        }
        return null;
    }

    // LoopVariable = variable;
    private loopVariable(branch: SPPTBranch) : LoopVariable {
        let result = new LoopVariable();
        result.name = this.transformNode(branch.nonSkipChildren.toArray()[0]);
        return result;
    }

    // ParameterRef = ParameterPiElemRef '.' AppliedFeature ;
    private parameterRef(branch: SPPTBranch) : ParameterRef {
        // let result = new ParameterRef();
        // result.parameter = this.piElemRef<Parameter>(branch.nonSkipChildren.toArray()[0]);
        // result.appliedfeature = this.transformNode(branch.nonSkipChildren.toArray()[2]);
        // return result;

        // Kan ook in andere stijl. Jos: welke heeft jouw voorkeur?
        const parameter = this.piElemRef<Parameter>(branch.nonSkipChildren.toArray()[0]);
        const appliedFeature = this.transformNode(branch.nonSkipChildren.toArray()[2]);
        return ParameterRef.create({parameter: parameter, appliedfeature: appliedFeature});
    }

    // AppliedFeature = '.' AttributeRef ;
    // abstract class
    private appliedFeature(branch: SPPTBranch) : AppliedFeature {
        // console.log(`executing appliedFeature`);
        return this.transformNode(branch.nonSkipChildren.toArray()[0]);
    }

    // AttributeRef = AttributePiElemRef ;
    private attributeRef(branch: SPPTBranch) : AttributeRef {
        let result = new AttributeRef();
        result.attribute = this.piElemRef<Attribute>(branch.nonSkipChildren.toArray()[0]);
        return result;
    }

    // LoopVariableRef = LoopVariablePiElemRef ;
    private loopVariableRef(branch: SPPTBranch) : LoopVariableRef {
        let result = new LoopVariableRef();
        result.variable = this.piElemRef<LoopVariable>(branch.nonSkipChildren.toArray()[0]);
        return result;
    }

    // ...PiElemRef = identifier;
    private piElemRef<T extends PiNamedElement>(branch: SPPTBranch) : PiElementReference<T> {
        let refName: string = this.transformNode(branch.nonSkipChildren.toArray()[0]);
        return PiElementReference.create<T>(refName, "T");
    }

    private transformList<T>(branch: SPPTBranch, separator?: string) : T[] {
        // console.log(`executing parameter list`);
        let result: T[] = [];
        for (const child of branch.nonSkipChildren.toArray()) {
            try {
                let element: any = this.transformNode(child);
                if (element) {
                    if (!separator) {
                        result.push(element);
                    } else {
                        if (element !== separator) result.push(element);
                    }
                }
            } catch (e) {
                console.log(`list ERROR: ${e}`);
            }
        }
        return result;
    }

}
