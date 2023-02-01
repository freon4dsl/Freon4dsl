import { IMainInterpreter, InterpreterContext } from "@projectit/core";
import { NumberLiteral } from "../../../../language/gen/index";
import { IBaseInterpreter } from "./IBaseInterpreter";

let mainInterpreter: IMainInterpreter;

export class BaseInterpreter implements IBaseInterpreter {

    constructor(main: IMainInterpreter) {
        mainInterpreter = main;
    }

    evaluateNumberLiteral(node: NumberLiteral, ctx: InterpreterContext): Object {
        return new Number(node.value);;
    }

}
