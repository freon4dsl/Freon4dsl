import { CoreTestAttribute } from "./CoreTestAttribute";
import { CoreTestModelElement } from "../CoreTestModel";

export class CoreTestAttributeType extends CoreTestModelElement {
    //= "String" | "Integer" | "Boolean";
    
    static String : CoreTestAttributeType = new CoreTestAttributeType("String");
    static Integer : CoreTestAttributeType = new CoreTestAttributeType("Integer");
    static Boolean : CoreTestAttributeType = new CoreTestAttributeType("Boolean");
    static Any : CoreTestAttributeType = new CoreTestAttributeType("Any");

    private readonly literalName : string;

    constructor(n : string) {
        super();
        this.literalName = n;
    }

    public asString(): string {
        return this.literalName;
    }

    static fromString(v: string): CoreTestAttributeType {
        if (v === "String") return CoreTestAttributeType.String;
        if (v === "Integer") return CoreTestAttributeType.Integer;
        if (v === "Boolean") return CoreTestAttributeType.Boolean;
        if (v === "Any") return CoreTestAttributeType.Any;
        console.error("cannot create CoreTestAttributeType from " + v);
        return CoreTestAttributeType.Any;
    }

}
