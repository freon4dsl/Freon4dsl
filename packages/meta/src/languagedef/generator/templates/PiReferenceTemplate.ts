import { Names, PROJECTITCORE, ENVIRONMENT_GEN_FOLDER } from "../../../utils";
import { PiLanguage } from "../../metalanguage";

export class PiReferenceTemplate {

    // TODO why create with param "unitName: string | T" and createNamed with param "unitName: string" both?
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
             * Returns a new instance which refers to an element named 'name' of type T.
             * Param 'typeName' should be equal to T.constructor.name.
             * @param name
             * @param typeName
             */        
            public static createNamed< T extends ${Names.PiNamedElement}>(name: string, typeName: string): ${Names.PiElementReference}<T> {
                const result = new ${Names.PiElementReference}(null, typeName);
                result.name = name;
                result.typeName = typeName;
                return result;
            }
        
            /**
             * Returns a new instance which refers to an element named 'name' of type T, or
             * to the element 'name' itself.
             * Param 'typeName' should be equal to T.constructor.name.
             * @param name
             * @param typeName
             */
            public static create< T extends ${Names.PiNamedElement}>(name: string | T, typeName: string): ${Names.PiElementReference}<T> {
                const result = new ${Names.PiElementReference}(null, typeName);
                if( typeof name === "string" ) {
                    result.name = name;
                } else if( typeof name === "object" ){
                    result.referred = name;
                }
                result.typeName = typeName;
                return result;
            }
            
            @observable private _PI_name: string = "";
            @observable private _PI_referred: T = null;
        
            // Needed for the scoper to work
            private typeName: string;
 
             /**
             * The constructor is private, use either the create() or the createNamed() methods
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
                this._PI_name = value;
                this._PI_referred = null;
            }
        
            @computed
            get name(): string {
                if(!!this._PI_referred){
                    // this._PI_name = this._PI_referred.name;
                    return this.referred.name
                } else {
                    // this._PI_referred = ${Names.environment(language)}.getInstance().scoper.getFromVisibleElements(this.piContainer().container, this._PI_name, this.typeName) as T;
                }
                return this._PI_name;
            }
        
            // @computed
            get referred(): T {
                if (!!this._PI_referred) {
                    return this._PI_referred;
                } else {
                    return ${Names.environment(language)}.getInstance().scoper.getFromVisibleElements(this.piContainer().container, this._PI_name, this.typeName) as T;
                }
                // return this._PI_referred;
            }
        
            set referred(referredElement) {
                if (!!referredElement) {
                    this._PI_name = referredElement.name;
                } else {
                    this._PI_name = "";
                }
                this._PI_referred = referredElement;
            }
        }`;
    }
}
