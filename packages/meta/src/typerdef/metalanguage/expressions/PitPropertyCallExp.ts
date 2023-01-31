import { FreClassifier, MetaElementReference, FreProperty } from "../../../languagedef/metalanguage";
import { PitExp } from "./PitExp";

export class PitPropertyCallExp extends PitExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitPropertyCallExp>): PitPropertyCallExp {
        const result = new PitPropertyCallExp();
        if (!!data.__property) {
            result.__property = data.__property;
        }
        if (!!data.property) {
            result.property = data.property;
        }
        if (!!data.source) {
            result.source = data.source;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    readonly $typename: string = "PitPropertyCallExp"; // holds the metatype in the form of a string

    source: PitExp; // implementation of part 'source'
    __property: MetaElementReference<FreProperty>;
    toPiString(): string {
        let sourceStr: string = '';
        if (!!this.source) {
            sourceStr = this.source.toPiString() + '.';
        }
        return `${sourceStr}${this.__property.name}`;
    }
    get property(): FreProperty {
        if (!!this.__property && !!this.__property.referred) {
            return this.__property.referred;
        }
        return null;
    }
    set property(cls: FreProperty) {
        if (!!cls) {
            this.__property = MetaElementReference.create<FreProperty>(cls, "FreProperty");
            this.__property.owner = this.language;
        }
    }
    get type(): FreClassifier {
        return this.property?.type;
    }

    get isList(): boolean {
        return this.property.isList;
    }

    baseSource(): PitExp {
        return this.source.baseSource();
    }
}
