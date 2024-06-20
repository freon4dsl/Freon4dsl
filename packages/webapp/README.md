To change to a different language from the samples folder, do the following two things.

1. In package.json adjust the dependencies to the required sample language. 
E.g. change "@freon4dsl/samples-example": "0.7.0-beta" to "@freon4dsl/samples-calculator": "0.7.0-beta". Note that 
you must use the name for the language that is specified in its package.json, as well as the correct version.
2. In ./starter/main.ts change the import of the Environment into environment of the required sample language. For 
example, change the following lines.
<code>
/**
* The one and only reference to the actual language for which this editor runs
*/
  import {ExampleEnvironment} from "@freon4dsl/samples-example";
  WebappConfigurator.getInstance().setEditorEnvironment(ExampleEnvironment.getInstance());
</code>

into ...
<code>
/**
* The one and only reference to the actual language for which this editor runs
*/
  import {CalculatorModelEnvironment} from "@freon4dsl/samples-calculator";
  WebappConfigurator.getInstance().setEditorEnvironment(CalculatorModelEnvironment.getInstance());
</code>

Make sure that the sample language is build!
