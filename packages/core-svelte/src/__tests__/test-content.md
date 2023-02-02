# OptionalComponent

1. als conditie waar oplevert dan wordt component getoond, anders niet, behalve als mustShow true is
2. niet getoond, dan wordt aliasbox getoond.

# Alle componenten
Alle keyboard events moeten worden doorgegeven naar de parent component, behalve in sommige gevallen.
Deze worden altijd in de bovenste component afgehandeld:
2. tab
3. shift tab
4. pijl omhoog, omlaag
5. pijl rechts indien cursor aan einde staat
6. pijl links indien cursor aan begin staat
7. ctrl up

# TextComponent

1. als box focus verliest dan wordt tekst opgeslagen, als tekst veranderd is alleen.
2. box verliest focus door:
   1. click outside
   2. zie boven (alles vanuit keyboard kan alleen getest worden via FreonComponent)
3. placeholder moet aanwezig zijn
4. keyPressAction zoasl gegeven in TextBox moet worden uigevoerd
5. de events in 2.2 tot 2.7 moeten worden doorgegeven aan de parent van de text box.
6. de caret position on click is correct gezet in bijbehorende text box



# DropDownItemComponent

1. on click geeft melding naar boven: een pi-ItemSelected event
2. indien geselecteerd dan wijzigt de style

# DropDownComponent

1. pijl omhoog omlaag worden niet gepropageerd
2. pijl omhoog omlaag veranderen huidige selectie
3. enter geeft melding naar boven: een pi-ItemSelected event
4. escape, delete sluit drop down ??? => zou moeten ???

# AliasComponent

1. als click dan verschijnt drop down
2. als keyboard entry dan geen dropdown
3. ctr-space : toggle drop down
4. als tekst in text box dan options in drop down filteren
5. als tekst volkomen gelijk aan optie, dan wordt deze geselecteerd en bijbehorende
   alias actie uitgevoerd
6. place holder moet getoond worden als de alias component leeg is
7. als niets geselecteerd uit drop down opties en component verliest focus dan
   1. dropdown closed
   2. text component moet leeg worden, place holder getoond
8. als drop down geopend is dan moeten de pijl keys omhoog, omlaag bij de drop down terecht komen
9. escape sluit drop down

# GridCellComponent

1. moet op juiste column/row staan in zijn grid
2. test rowSpan en columnSPan
3. als gridCellBox.isHeader dan wordt style aangepast
4. als de enter key ingetoets wordt dan wordt de keyboard shortcut command uitgevoerd,
   meestal is dat het toevoegen van een row of een column
5. based on orientation style is adjusted

# GridComponent

1. afhankelijk van de orientatie wordt de header getoond
2. als de enter key ingetoets wordt dan wordt de keyboard shortcut command uitgevoerd,
meestal is dat het toevoegen van een row of een column

# RenderComponent hoeft niet getest

# SelectabelComponent

1. on click: focus gezet wordt doorgegeven aan editor en style veranderd
2. zet after update de x en y waardes van zijn kind box

# FreonComponent

1. Zie alle componenten voor keyboard acties
2. Scroll zet de juiste waardes voor nul punt
