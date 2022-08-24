Werking Actions in ProjectIt

1. PiEditor heeft een lijst van alle gedefinieerde acties, die is onderverdeeld in acties voor binary expressions en overige (waarom?). => Bij meerdere editors wordt dit een probleem.
2. Elke actie heeft een trigger, dat is een string, een reg exp, of een piKey.
3. Elke actie heeft een command, dat is een functie die uitgevoerd moet worden als de trigger voorkomt.
4. Bij elke keystroke in elke component moet bij de editor worden gecontrolleerd of de key voorkomt als trigger voor de box die bij de component hoort. Deze check is gebaseerd op de box-role. Zo ja, dan moet de command worden uitgevoerd, het na de actie geselecteerde element de focus krijgen en de cursor worden gezet.
5. Bij elke component waar een tekst ingevoerd kan worden, moet bij de editor gecontrolleerd worden of de tekst voldoet aan een string of reg exp trigger. Zo ja, dan moet de command worden uitgevoerd, het na de actie geselecteerde element de focus krijgen en de cursor worden gezet. Let op: deze actie is gekoppeld aan de SelectOption.
6. Het uitvoeren van een commando kan model wijzigingen veroorzaken en moet dus in een runInAction worden uitgevoerd.
