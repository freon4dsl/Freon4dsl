import { PiLanguage } from "../../languagedef/metalanguage";

export class CompleteTemplate {
    generate(language: PiLanguage, stylesPath: string): string {
        return `<html>
<head>
    <link rel="stylesheet" type="text/css" href="${stylesPath}/diagram-styles.css" />
</head>
<body>
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<script>
    mermaid.initialize({ startOnLoad: true });
</script>

Class diagram for language ${language.name}:
<div class="mermaid">
    classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
    +String beakColor
    +swim()
    +quack()
    }
    class Fish{
    -int sizeInFeet
    -canEat()
    }
    class Zebra{
    +bool is_wild
    +run()
    }
</div>

</body>
</html>

`;
    }
}
