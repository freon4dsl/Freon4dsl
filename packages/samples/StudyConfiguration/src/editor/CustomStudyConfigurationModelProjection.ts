// Generated by the Freon Language Generator.
import { FreNode, FreLanguage, FreProjection, FreProjectionHandler, FreTableDefinition, FRE_BINARY_EXPRESSION_LEFT, FRE_BINARY_EXPRESSION_RIGHT,
        Box, GridCellBox, LabelBox, IconBox, GridBox, createDefaultExpressionBox, ActionBox, HorizontalListBox, TableRowBox, HorizontalLayoutBox, MultiLineTextBox, MultiLineTextBox2, BoxFactory, BoxUtil, BoolDisplay, FreNodeReference, TableUtil} from "@freon4dsl/core";
import { StudyConfiguration, Description, Period, Event, EventSchedule, Task, TaskDetail, CheckList } from "../language/gen";
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { StudyConfigurationModelEnvironment } from "config/gen/StudyConfigurationModelEnvironment";
import { result } from "lodash";

/**
 * Class CustomStudyConfigurationModelProjection provides an entry point for the language engineer to
 * define custom build additions to the editor.
 * These are merged with the custom build additions and other definition-based editor parts
 * in a three-way manner. For each modelelement,
 * (1) if a custom build creator/behavior is present, this is used,
 * (2) if a creator/behavior based on one of the editor definition is present, this is used,
 * (3) if neither (1) nor (2) yields a result, the default is used.
 */
export class CustomStudyConfigurationModelProjection implements FreProjection {
    name: string = "Custom";
    handler: FreProjectionHandler;
    nodeTypeToBoxMethod: Map<string, (node: FreNode) => Box> = new Map<string, (node: FreNode) => Box>([
        ["StudyConfiguration", this.createStudyConfiguration],
        ["Description", this.createDescription],
        ["Period", this.createPeriod],
        ["Event", this.createEvent],
        ["EventSchedule", this.createSchedule],
    ]);

    nodeTypeToTableDefinition: Map<string, () => FreTableDefinition> = new Map<string, () => FreTableDefinition>([
        // ["CheckList", this.createCheckList],
        // register your custom table definition methods here
        // ['NAME_OF_CONCEPT', this.TABLE_DEFINITION_FOR_CONCEPT],
    ]);

    getTableHeadersFor(projectionName: string): TableRowBox {
        return null;
    }

    ////////////////////////////////////////////////////////////////////
    createStudyConfiguration (element: StudyConfiguration): Box {
        return BoxFactory.verticalLayout(element, "StudyConfiguration-overall", "", [
            // BoxUtil.emptyLineBox(element, "StudyConfiguration-empty-line-0", "h-4"),
            // BoxFactory.horizontalLayout(element, "StudyConfiguration-hlist-line-1", "", "top",
            //     [
            //         BoxUtil.labelBox(element, "STUDY NAME:", "top-1-line-1-item-0", undefined, "app-uppercase"),
            //         BoxUtil.textBox(element, "name")
            //     ],
            //     { selectable: false },
            // ), 
            BoxUtil.emptyLineBox(element, "StudyConfiguration-empty-line-1", "h-2"),
            BoxUtil.listGroupBox(element, "OPTIONS:", 0, "study-periods-group",
                BoxUtil.indentBox(element, 4, true, "3",
                    BoxFactory.verticalLayout(element, "StudyConfiguration-vlist-line-3", "", 
                    [
                        BoxUtil.emptyLineBox(element, "option-empty-line", "h-4"),
                        BoxUtil.switchElement(element, "showPeriods", "Configure by Periods/Phases"), 
                        BoxUtil.switchElement(element, "showActivityDetails", "Show Task Details"),
                        BoxUtil.switchElement(element, "showSystems", "Show Systems"),
                        BoxUtil.switchElement(element, "showScheduling", "Show Scheduling") 
                    ])
                ), undefined, undefined, true
            ),
            BoxUtil.emptyLineBox(element, "StudyConfiguration-empty-line-3", "h-8"),
            ...(element.showPeriods === true? [                    
                BoxUtil.listGroupBox(element, "STUDY PERIODS", 0, "study-periods-group",
                    BoxUtil.indentBox(element, 4, true, "9",
                        BoxUtil.verticalPartListBox(element, (element).periods, "periods", null, this.handler)
                    ), undefined, undefined, true
                ),
            ] : [
                BoxUtil.listGroupBox(element, "EVENTS", 0, "group-1-line-2-item-0",
                    BoxUtil.indentBox(element, 4, true, "4",
                        BoxUtil.verticalPartListBox(element, element.events, "events", null, this.handler)
                    ) 
                ),
            ]),
            ...(element.showActivityDetails === true? [
                    BoxUtil.emptyLineBox(element, "StudyConfiguration-empty-line-4", "h-4"),
                    BoxUtil.listGroupBox(element, "TASK DETAILS", 0, "task-details-group",
                        BoxUtil.indentBox(element, 4, true, "13",
                            BoxUtil.verticalPartListBox(element, (element).taskDetails, "taskDetails", null, this.handler)
                        ),
                    undefined, "app-uppercase"),
                    ...(element.showSystems === true? [
                    BoxUtil.emptyLineBox(element, "StudyConfiguration-empty-line-5", "h-4"),
                    BoxUtil.listGroupBox(element, "SYSTEM ACCESS DEFINITIONS", 0, "sys-defs-group",
                        BoxUtil.indentBox(element, 4, true, "17",
                            BoxUtil.verticalPartListBox(element, (element).systemAccesses, "systemAccesses", null,  this.handler)
                        ),
                    undefined, "app-uppercase"),
                    ] : []),
                    BoxUtil.emptyLineBox(element, "StudyConfiguration-empty-line-6", "h-4"),
                    BoxUtil.listGroupBox(element, "STAFFING", 0, "staffing-group",
                        BoxUtil.indentBox(element, 4, true, "21",
                            BoxUtil.getBoxOrAction(element, "staffing", "Staffing", this.handler)
                        ),
                    undefined, "app-uppercase")
                ] : []),
        ]);
    }

    createDescription (desc: Description): Box {
        return new MultiLineTextBox2(desc, "study-part-description", () => { return desc.text}, (t: string) => { desc.text = t});
    }

    createPeriod (period: Period): Box {
        let box: Box = BoxUtil.itemGroupBox(period, "name", "Period:", 0, 
            BoxUtil.indentBox(period, 1.5, true, "period-indent",
                BoxFactory.verticalLayout(period, "period-detail", "", [
                    BoxFactory.horizontalLayout(period, "period-hlist-line-1", "","top",
                        [
                            BoxUtil.labelBox(period, "Description:", "top-1-line-2-item-0",undefined, "app-small-caps"),
                            BoxUtil.getBoxOrAction(period, "description", "Description", this.handler)
                        ],
                        { selectable: false }, "w-full"
                    ),
                    BoxUtil.listGroupBox(period, "EVENTS", 0, "group-1-line-2-item-0",
                        BoxUtil.indentBox(period, 4, true, "4",
                            BoxUtil.verticalPartListBox(period, period.events, "events", null, this.handler)
                        ) 
                    )
                ])
            ), "w-full", true, true
        );
        return box;
    }

    // createPeriod (period: Period): Box {
    //     return BoxFactory.verticalLayout(period, "Period-overall", "", [
    //         BoxFactory.horizontalLayout(period, "Period-hlist-line-0", "", "center",
    //             [
    //                 new IconBox(period, "draggrip", faGripVertical, "grab"),
    //                 BoxUtil.labelBox(period, "Period:", "top-1-line-0-item-1", undefined, "app-uppercase"),
    //                 BoxUtil.textBox(period, "name")                   
    //             ],
    //             { selectable: false }
    //         ),
    //         BoxUtil.indentBox(period, 1.5, true, "e1",
    //             BoxFactory.verticalLayout(period, "Period-detail", "", [
    //                 BoxFactory.horizontalLayout(period, "Period-hlist-line-1", "","top",
    //                     [
    //                         BoxUtil.labelBox(period, "Description:", "top-1-line-2-item-0",undefined, "app-small-caps"),
    //                         BoxUtil.getBoxOrAction(period, "description", "Description", this.handler)
    //                     ],
    //                     { selectable: false }, "w-full"
    //                 ),
    //                 BoxUtil.listGroupBox(period, "EVENTS", 0, "group-1-line-2-item-0",
    //                     BoxUtil.indentBox(period, 4, true, "4",
    //                         BoxUtil.verticalPartListBox(period, period.events, "events", null, this.handler)
    //                     ) 
    //                 )
    //             ])
    //         )
    //     ]);
    // }

    createEvent (event: Event): Box {
        let showScheduling = false;
        if (event.freOwner() instanceof(Period)) {
            showScheduling = ((event.freOwner() as Period).freOwner() as StudyConfiguration).showScheduling;
        } else {
            showScheduling = (event.freOwner() as StudyConfiguration).showScheduling;
        }
        let box: Box = BoxUtil.itemGroupBox(event, "name", "Event:", 0,
            BoxUtil.indentBox(event, 1.5, true, "e1",
                BoxFactory.verticalLayout(event, "Event-detail", "", [
                    BoxFactory.horizontalLayout(event, "Event-hlist-line-2", "","top",
                        [
                            BoxUtil.labelBox(event, "Description:", "top-1-line-2-item-0", undefined, "app-small-caps"),
                            BoxUtil.getBoxOrAction(event, "description", "Description", this.handler)
                        ],
                        { selectable: false }, "w-full"
                    ),
                    ...(showScheduling === true? [                    
                        BoxUtil.labelBox(event, "Schedule:", "top-1-line-4-item-0"),
                        BoxUtil.indentBox(event, 2, true, "e11",
                            BoxUtil.getBoxOrAction(event, "schedule", "EventSchedule", this.handler)
                        ),
                    ] : []),
                            BoxUtil.labelBox(event, "Checklist:", "top-1-line-9-item-0"),
                        BoxUtil.indentBox(event, 2, true, "e12",
                        BoxUtil.getBoxOrAction(event, "checkList", "CheckList", this.handler)
                    ),
                    BoxUtil.emptyLineBox(event, "Event-empty-line-11")
                ])
            ), "w-full", false, true
        );
        return box;
    }

    createSchedule (schedule: EventSchedule): Box {
        return BoxFactory.verticalLayout(schedule, "EventSchedule-overall", "", [
            BoxFactory.horizontalLayout(schedule, "EventSchedule-hlist-line-0", "", "top",
                [
                    BoxUtil.labelBox(schedule, "First Scheduled:", "top-1-line-0-item-0", undefined, "app-small-caps"),
                    BoxUtil.getBoxOrAction(schedule, "eventStart", "EventStart", this.handler),
                ],
                { selectable: false },
            ),
            BoxFactory.horizontalLayout(schedule, "EventSchedule-hlist-line-1", "", "top",
                [
                    BoxUtil.labelBox(schedule, "Then Repeats:", "top-1-line-1-item-0", undefined, "app-small-caps"),
                    BoxUtil.getBoxOrAction(schedule, "eventRepeat", "RepeatExpression", this.handler),
                ],
                { selectable: false },
            ),
            BoxFactory.horizontalLayout(schedule, "EventSchedule-hlist-line-2", "", "top",
                [
                    BoxUtil.labelBox(schedule, "Window:", "top-1-line-2-item-0", undefined, "app-small-caps"),
                    BoxUtil.getBoxOrAction(schedule, "eventWindow", "EventWindow", this.handler),
                ],
                { selectable: false },
            ),
            BoxFactory.horizontalLayout(schedule, "EventSchedule-hlist-line-3", "", "top",
                [
                    BoxUtil.labelBox(schedule, "Time of Day:", "top-1-line-3-item-0", undefined, "app-small-caps"),
                    BoxUtil.getBoxOrAction(schedule, "eventTimeOfDay", "EventTimeOfDay", this.handler),
                ],
                { selectable: false },
            ),
        ]);
    }

    // private createCheckList(): FreTableDefinition {
    //     let checklist: CheckList = null;
    //     console.log("CALLLED createTask");
    //     let showActivityDetails = false;
    //     let event = checklist.freOwner() as Event;
    //     if (event.freOwner() instanceof(Period)) {
    //         showActivityDetails = ((event.freOwner() as Period).freOwner() as StudyConfiguration).showActivityDetails;
    //         console.log("owner is period" + showActivityDetails);
    //     } else {
    //         showActivityDetails = (event.freOwner() as StudyConfiguration).showActivityDetails;
    //         console.log("owner is event:" + showActivityDetails);
    //     }
    //     let nameBoxFcn = (task:Task): Box => { return BoxUtil.textBox(task as Task, "name") }
    //     let taskDetailsFcn = (task:Task): Box => {
    //         return BoxUtil.referenceBox(
    //             task as Task,
    //             "taskDetails",
    //             (selected: string) => {
    //                 (task as Task).taskDetails = FreNodeReference.create<TaskDetail>(
    //                     StudyConfigurationModelEnvironment.getInstance().scoper.getFromVisibleElements(
    //                         task as Task,
    //                         selected,
    //                         "TaskDetail",
    //                     ) as TaskDetail,
    //                     "TaskDetail",
    //                 );
    //             },
    //             StudyConfigurationModelEnvironment.getInstance().scoper,
    //         );
    //     }
    //     let decisionBoxFcn = (task:Task): Box => { return BoxUtil.getBoxOrAction(task as Task, "decision", "WorkflowDecision", this.handler) }
    //     // if (showActivityDetails === true) {

    //     let myTableDefinition: FreTableDefinition;
    //     myTableDefinition.headers = ["Header1", "Header2", "Header3"], // Example headers
    //     myTableDefinition.cells = [nameBoxFcn, taskDetailsFcn, decisionBoxFcn];
    //     return myTableDefinition;
    // //  }
    // }

 }
