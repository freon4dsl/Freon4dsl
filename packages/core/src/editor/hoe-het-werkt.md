# Start

Vanuit webapp wordt een ProjectItComponent gestart met een PiEditor als param.

ProjectItComponent gebruikt RenderComponent om de rootBox van de PiEditor te renderen.
De rootBox wordt op autoRun vernieuwd.

De PiEditor zet de rootBox in de functie rootBox() vanuit de projection. De projection wordt gezet in
de constructor. 

De PiEditor constructor wordt aangeroepen in de gegenereerde Environment. Hier wordt gezet:
1. projection, 
2. actions, 
3. rootElement, // op null, is niet nodig, want bij init al op null!! => TODO meta aanpassen!!!
4. environment // zou ook in constructor moeten worden toegevoegd => TODO meta aanpassen!!!

De PiEditor krijgt altijd een PiElement. Hij zoekt er zelf een box bij!!!

# Actions

In editor worden 2 soorten acties gezet. Beide zijn lijsten van subclasses van PiAction.
1. customActions
2. binaryExpressionActions

Elke PiAction heeft een triggerType. Nu wordt alleen de 'string' gebruikt. (Klopt dit!)

In een Svelte component (TODO welke precies en waarom die) wordt gekeken of bij een bepaalde input EN box,
een action hoort. Zo ja, dan wordt de bijbehorende PiCommand uitgevoerd. (Hoe moet een undo getriggered worden?)
Probleem: de trigger kan een string zijn, dus meer dan 1 char, terwijl in de TextComponent per char gekeken 
wordt wat ermee gedaan moet worden.

De enige componenten die naar een commando zoeken zijn: TextComponent, AliasComponent en GridComponent.

# Keyboard events

A trigger can be a string of chars, but 'findKeyboardShortcutCommand' in all cases gets as input
'toPiKey(event)', where event is a KeyboardEvent. This means that only one char is checked. How can this be right?
