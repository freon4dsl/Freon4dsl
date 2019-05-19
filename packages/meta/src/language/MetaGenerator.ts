import * as fs from "fs";
import { MetaModel } from "./MetaModel";
import { PiMetaTemplates } from "./PiMetaTemplates";

export class MetaGenerator {
  outputfolder: string;

  constructor(output: string) {
    this.outputfolder == output;
  }

  generate(model: MetaModel): void {
    const templates: PiMetaTemplates = new PiMetaTemplates();
    model.elements.forEach(element => {
      const generated: string = templates.generateMetaClass(element);
      fs.writeFileSync(`${element.name}.ts`, generated);
    });
  }
}
