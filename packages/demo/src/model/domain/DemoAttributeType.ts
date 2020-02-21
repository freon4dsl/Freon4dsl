import { DemoAttribute } from "./DemoAttribute";
import { DemoModelElement } from "../DemoModel";

export class DemoAttributeType extends DemoModelElement {
    //= "String" | "Integer" | "Boolean";
    
    static String : DemoAttributeType = new DemoAttributeType("String");
    static Integer : DemoAttributeType = new DemoAttributeType("Integer");
    static Boolean : DemoAttributeType = new DemoAttributeType("Boolean");
    static Any : DemoAttributeType = new DemoAttributeType("Any");

    private readonly literalName : string;

    constructor(n : string) {
        super();
        this.literalName = n;
    }

    public asString(): string {
        return this.literalName;
    }

    static fromString(v: string): DemoAttributeType {
        if (v === "String") return DemoAttributeType.String;
        if (v === "Integer") return DemoAttributeType.Integer;
        if (v === "Boolean") return DemoAttributeType.Boolean;
        if (v === "Any") return DemoAttributeType.Any;
        console.error("cannot create DemoAttributeType from " + v);
    }

}
