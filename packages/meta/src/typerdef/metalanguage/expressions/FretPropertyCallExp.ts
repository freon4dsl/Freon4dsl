import { FreClassifier, MetaElementReference, FreProperty } from "../../../languagedef/metalanguage";
import { FretExp } from "./FretExp";

export class FretPropertyCallExp extends FretExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretPropertyCallExp>): FretPropertyCallExp {
        const result = new FretPropertyCallExp();
        if (!!data.$property) {
            result.$property = data.$property;
        }
        if (!!data.property) {
            result.property = data.property;
        }
        if (!!data.source) {
            result.source = data.source;
        }
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }
    readonly $typename: string = "FretPropertyCallExp"; // holds the metatype in the form of a string

    source: FretExp; // implementation of part 'source'
    $property: MetaElementReference<FreProperty>;
    toFreString(): string {
        let sourceStr: string = "";
        if (!!this.source) {
            sourceStr = this.source.toFreString() + ".";
        }
        return `${sourceStr}${this.$property.name}`;
    }
    get property(): FreProperty {
        if (!!this.$property && !!this.$property.referred) {
            return this.$property.referred;
        }
        return null;
    }
    set property(cls: FreProperty) {
        if (!!cls) {
            this.$property = MetaElementReference.create<FreProperty>(cls, "FreProperty");
            this.$property.owner = this.language;
        }
    }
    get type(): FreClassifier {
        return this.property?.type;
    }

    get isList(): boolean {
        return this.property.isList;
    }

    baseSource(): FretExp {
        return this.source.baseSource();
    }
}
