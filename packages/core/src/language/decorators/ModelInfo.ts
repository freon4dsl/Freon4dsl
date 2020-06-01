import { ModelInfoMap } from "./ModelInfoMap";

// type Constructors =  { [unitName: string]: Function };

/**
 *
 */
export class ModelInfo {
    public static readonly listReferences = new ModelInfoMap();
    public static readonly references = new ModelInfoMap();
    public static readonly parts = new ModelInfoMap();
    public static readonly listparts = new ModelInfoMap();

    static constructors: Map<string, Function> = new Map<string, Function>();
    static Constructors1: { [name: string]: Function } = {};

    static addClass(className: string, constructor: Function): void {
        // console.log("AddClass [" + className + "] = " + constructor);
        if (!this.constructors.has(className)) {
            this.constructors.set(className, constructor);
            this.Constructors1[className] = constructor;
        } else {
            console.error("@model decorator: class " + className + " defined twice");
        }
    }

    static cls(className: string): Function {
        const entry = this.constructors.get(className);
        if (entry === undefined) {
            return null;
        } else {
            return entry;
        }
    }
}
