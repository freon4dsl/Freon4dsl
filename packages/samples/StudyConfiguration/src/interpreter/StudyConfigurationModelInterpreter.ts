// Generated my Freon once, will NEVER be overwritten.
        import { InterpreterContext, IMainInterpreter, RtObject, RtError, RtNumber, RtBoolean } from "@freon4dsl/core";
        import { StudyConfigurationModelInterpreterBase } from "./gen/StudyConfigurationModelInterpreterBase";
        import * as language from "../language/gen/index";
        import { Timeline } from "../custom/timeline/Timeline";

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
            
            evalNumber(node: language.NumberLiteralExpression, ctx: InterpreterContext): RtObject {
                return new RtNumber(node.value);
            }
        

            evalDay(node: language.Day, ctx: InterpreterContext): RtObject {
                return new RtNumber(node.startDay);
            }

            evalWhen(node: language.When, ctx: InterpreterContext): RtObject {
                return main.evaluate(node.startWhen, ctx);
            }

            // Why have both StartDay and StudyStart?
            evalStudyStart(node: language.StudyStart, ctx: InterpreterContext): RtObject {
                return new RtNumber(1);
            }

            evalStartDay(node: language.StartDay, ctx: InterpreterContext): RtObject {
                return new RtNumber(1);
            }
                
            evalEventReference(node: language.EventReference, ctx: InterpreterContext): RtObject {
                // console.log("Entered evalEventReference");
                // console.log("evalEventReference node.$id: " + node.$id);
                // console.log("referenced event: " + node.$event);
                let timeline = ctx.find("timeline") as unknown as Timeline;
                let referencedEvent = node.$event;
                let lastInstanceOfReferencedEvent = timeline.getLastInstanceForThisEvent(referencedEvent);
                // console.log("evalEventReference reference to: " + referencedEvent.name + " lastInstanceOfReferencedEvent: " + lastInstanceOfReferencedEvent.day);
                return new RtNumber(lastInstanceOfReferencedEvent.startDay);
            }

            evalEventStart(node: language.EventStart, ctx: InterpreterContext): RtObject {
                if (node instanceof language.Day) {
                    console.log("evalEventStart: node is a Day");
                    return main.evaluate(node, ctx);
                } else if (node instanceof language.When) {
                    console.log("evalEventStart: node is a When");
                    return main.evaluate(node, ctx);
                } else {
                    console.log("evalEventSchedule: eventStart is not a Day or When");
                    throw new RtError("evalEventSchedule: eventStart is not a Day");
                }
            }
        
            ///////////////// STANDARD EXPRESSIONS

            evalPlusExpression(node: language.PlusExpression, ctx: InterpreterContext): RtObject {
                const left = main.evaluate(node.left, ctx);
                const right = main.evaluate(node.right, ctx);
                return (left as RtNumber).plus(right as RtNumber );
            }

            evalEqualsExpression(node: language.EqualsExpression, ctx: InterpreterContext): RtObject {
                const left = main.evaluate(node.left, ctx);
                const right = main.evaluate(node.right, ctx);
                return (left).equals(right);
            }

            evalAndExpression(node: language.AndExpression, ctx: InterpreterContext): RtObject {
                const left = main.evaluate(node.left, ctx) as RtBoolean;
                const right = main.evaluate(node.right, ctx) as RtBoolean;
                return (left).and(right);
            }

            evalOrExpression(node: language.OrExpression, ctx: InterpreterContext): RtObject {
                const left = main.evaluate(node.left, ctx) as RtBoolean;
                const right = main.evaluate(node.right, ctx) as RtBoolean;
                return (left).or(right);
            }

            evalGreaterThenExpression(node: language.GreaterThenExpression, ctx: InterpreterContext): RtObject {
                const left = main.evaluate(node.left, ctx) as RtNumber;
                const right = main.evaluate(node.right, ctx) as RtNumber;
                return RtBoolean.of(left.value > right.value);
            }   
 
            // Copy for when the version in MainStudyConfigurationModelInterpreter is overwritten
            //
            // evaluateWithContext(node: Object, ctx: InterpreterContext): RtObject {
            //     MainStudyConfigurationModelInterpreter.main.reset();
            //     try {
            //         return MainStudyConfigurationModelInterpreter.main.evaluate(node, ctx);
            //     } catch (e: any) {
            //         return new RtError(e.message);
            //     }
            // }
        
        
        }
        