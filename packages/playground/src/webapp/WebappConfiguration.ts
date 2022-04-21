import { PiEnvironment } from "@projectit/core";
import { IServerCommunication } from "./server/IServerCommunication";
import { ServerCommunication } from "./server/ServerCommunication";

/**
 * The one and only reference to the actual language for which this editor runs
 */
// import { TestParserEnvironment } from "../parser-test/config/gen/TestParserEnvironment";
// export const editorEnvironment: PiEnvironment = TestParserEnvironment.getInstance();
// import { OctopusEnvironment } from "../octopus/config/gen/OctopusEnvironment";
// export const editorEnvironment: PiEnvironment = OctopusEnvironment.getInstance();
import { ExampleEnvironment } from "../example/config/gen/ExampleEnvironment";
export const editorEnvironment: PiEnvironment = ExampleEnvironment.getInstance();

// import { ExpressionLibraryEnvironment } from "../libraries-test/config/gen/ExpressionLibraryEnvironment";
// export const editorEnvironment: PiEnvironment = ExpressionLibraryEnvironment.getInstance();

// import { CalculatorEnvironment } from "../calculator/config/gen/CalculatorEnvironment";
// export const editorEnvironment: PiEnvironment = CalculatorEnvironment.getInstance();

// import { HeatEnvironment } from "../heating/config/gen/HeatEnvironment";
// export const editorEnvironment: PiEnvironment = HeatEnvironment.getInstance();

// import { TaxRulesEnvironment } from "../taxrules/config/gen/TaxRulesEnvironment";
// export const editorEnvironment: PiEnvironment = TaxRulesEnvironment.getInstance();

// import { PiLanguageEnvironment } from "../pi-languages/config/gen/PiLanguageEnvironment";
// export const editorEnvironment: PiEnvironment = PiLanguageEnvironment.getInstance();

// export const editorEnvironment: PiEnvironment = JsonEnvironment.getInstance();

// import { OpenhabEnvironment } from "../openhab/config/gen/OpenhabEnvironment";
// export const editorEnvironment: PiEnvironment = OpenhabEnvironment.getInstance();

// import { HDMLEnvironment } from "../HDML/config/gen/HDMLEnvironment";
// export const editorEnvironment: PiEnvironment = HDMLEnvironment.getInstance();

// import { RulesLanguageEnvironment } from "../rules-language/config/gen/RulesLanguageEnvironment";
// export const editorEnvironment: PiEnvironment = RulesLanguageEnvironment.getInstance();

/**
 * The one and only reference to the server on which the models are stored
 */
export const serverCommunication: IServerCommunication = ServerCommunication.getInstance();
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();
