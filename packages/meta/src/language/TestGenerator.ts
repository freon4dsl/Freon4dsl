import { MetaGenerator } from "./MetaGenerator";
import {
    MetaConcept,
    MetaElementProperty,
    MetaElementType,
    MetaModel,
    MetaPrimitiveProperty,
    MetaPrimitiveType
} from "./MetaModel";

const model = MetaModel.create("ModelName");

const element1 = MetaConcept.create("MyElement_1");
const element2 = MetaConcept.create("MyElement_2");
const element3 = MetaConcept.create("MyElement_3");

const p = new MetaPrimitiveProperty();
p.type = new MetaPrimitiveType();
p.type.primitive = "string";
p.name = "property";
element1.properties.push(p);

const pp = new MetaPrimitiveProperty();
pp.type = new MetaPrimitiveType();
pp.type.primitive = "string";
pp.type.isList = true;
pp.name = "listproperty";
element1.properties.push(pp);

const ep = new MetaElementProperty();
ep.type = new MetaElementType();
ep.type.element = element2;
ep.name = "elementProperty";
element1.parts.push(ep);

const lep = new MetaElementProperty();
lep.type = new MetaElementType();
lep.type.element = element2;
lep.type.isList = true;
lep.name = "elementPropertyList";
element1.parts.push(lep);

const ref = new MetaElementProperty();
ref.name = "referredThing";
ref.type = new MetaElementType();
ref.type.element = element3;
ref.type.isReference = true;
element1.references.push(ref);

const reflist = new MetaElementProperty();
reflist.name = "referredListThing";
reflist.type = new MetaElementType();
reflist.type.element = element1;
reflist.type.isList = true;
reflist.type.isReference = true;
element1.references.push(reflist);

model.elements.push(element1);
model.elements.push(element2);
model.elements.push(element3);

const generator = new MetaGenerator("output");

generator.generate(model);
