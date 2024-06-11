// Generated my Freon once, will NEVER be overwritten.
        import { InterpreterContext, IMainInterpreter, RtObject, RtError, RtNumber } from "@freon4dsl/core";
        import { StudyConfigurationModelInterpreterBase } from "./gen/StudyConfigurationModelInterpreterBase";
        import { Day } from "../language/gen/index";

        let main: IMainInterpreter;

        /**
         * The class containing all interpreter functions twritten by thge language engineer.
         * This class is initially empty,  and will not be overwritten if it already exists..
         */
        export class StudyConfigurationModelInterpreter extends StudyConfigurationModelInterpreterBase {

            constructor(m: IMainInterpreter) {
                super();
                main = m;
            }

            evalDay(node: Day, ctx: InterpreterContext): RtObject {
                return new RtNumber(node.startDay);
            }
        
        }
        