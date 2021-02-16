import { Names, PROJECTITCORE, ENVIRONMENT_GEN_FOLDER } from "../../../utils";
import { PiLanguage } from "../../metalanguage";

export class PiReferenceTemplate {

    // Clearer to have create(elem: T, ...)
    generatePiReference(language: PiLanguage, relativePath: string): string {
        return `
        import { MobxModelElementImpl } from "${PROJECTITCORE}";
        import { computed, observable } from "mobx";
        import { ${Names.PiNamedElement} } from "${PROJECTITCORE}";
        import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";
        
        /**
         * Class ${Names.PiElementReference} provides the implementation for a (named) reference in ProjectIt.
         * References can be set with either a referred object, or with a name.
         */
        export class ${Names.PiElementReference}< T extends ${Names.PiNamedElement}> extends MobxModelElementImpl {
              
            /**
             * Returns a new instance which refers to an element named 'name' of type T, or
             * to the element 'name' itself.
             * Param 'typeName' should be equal to T.constructor.name.
             * @param name
             * @param typeName
             */
            public static create< T extends ${Names.PiNamedElement}>(name: string | string[] | T, typeName: string): ${Names.PiElementReference}<T> {
                const result = new ${Names.PiElementReference}(null, typeName);
                if (Array.isArray(name)) {
                    result.pathname = name;
                } else if (typeof name === "string") {
                    result.name = name;
                } else if (typeof name === "object") {
                    result.referred = name;
                }
                result.typeName = typeName;
                return result;
            }
            
            @observable private _PI_pathname: string[] = [];
            @observable private _PI_referred: T = null;
        
            // Needed for the scoper to work
            public typeName: string;
 
             /**
             * The constructor is private, use the create() method
             * to make a new instance.
             * @param referredElement
             * @param typeName
             */       
            private constructor(referredElement: T, typeName: string) {
                super();
                this.referred = referredElement;
                this.typeName = typeName;
            }
        
            set name(value: string) {
                this._PI_pathname.push(value);
                this._PI_referred = null;
            }
            
            set pathname(value: string[]) {
                this._PI_pathname = value;
                this._PI_referred = null;
            }
        
            @computed
            get name(): string {
                if(!!this._PI_referred){
                    return this.referred.name
                }
                return this._PI_pathname[this._PI_pathname.length - 1];
            }

            @computed
            get pathname(): string[] {
                let result: string[] = [];
                for (const elem of this._PI_pathname) {
                    result.push(elem);                    
                }
                return result;
            }
            
            pathnameToString(separator: string): string {
                let result: string = "";
                for (let index = 0; index < this._PI_pathname.length; index++) {
                    let str = this._PI_pathname[index];
                    if (index === this._PI_pathname.length - 1) {
                        result += str;
                    } else {
                        result += str + separator;
                    }
                }
                return result;
            }
            
            // @computed
            get referred(): T {
                if (!!this._PI_referred) {
                    return this._PI_referred;
                } else {
                    // return ${Names.environment(language)}.getInstance().scoper.getFromVisibleElements(this.piContainer().container, this._PI_name, this.typeName) as T;
                    let container = this.piContainer()?.container;
                    if (!!container) {
                        let found: PiNamedElement = null;
                        for (let index = 0; index < this._PI_pathname.length ; index++) {
                            let str = this._PI_pathname[index];
                            if (index === this._PI_pathname.length - 1) {
                                // the last name in the pathname, therefore we must/can use the type information
                                found = ${Names.environment(language)}.getInstance().scoper.getFromVisibleElements(
                                    container,
                                    str,
                                    this.typeName
                                );
                            } else {
                                // for all names in front of the last name of the pathname, we cannot use the type information
                                // because the namespace(s) will not have the correct type
                                found = ${Names.environment(language)}.getInstance().scoper.getFromVisibleElements(
                                    container,
                                    str
                                );
                                if (!!found) {
                                    // set the container for finding the next part of the pathname
                                    container = found;
                                } else {
                                    return null;
                                }
                            }
                        }
                        return found as T;            
                    }
                    return null;
                }
            }
        
            set referred(referredElement) {
                if (!!referredElement) {
                    this._PI_pathname.push(referredElement.name);
                }
                this._PI_referred = referredElement;
            }
        }`;
    }
}
