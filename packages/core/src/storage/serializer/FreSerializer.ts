import { FreNode } from "../../ast/index";

/**
 * Serializer interface for serialization and deserialization of Fren nodes.
 * Depending on the backend there are different implementations.
 */
export interface FreSerializer {
    /**
     * Convert a JSON object to a Freon Node.
     * @param jsonObject The object to convert
     */
    toTypeScriptInstance(jsonObject: Object): FreNode;

    /**
     * Convert a Freon Node to a JSOn object that can be serialized.
     * @param tsObject The Freon object to be serialized
     * @param publicOnly If true, only serialize the public properties, used to serialize a model unit interface.
     */
    convertToJSON(tsObject: FreNode, publicOnly?: boolean): any;
}
