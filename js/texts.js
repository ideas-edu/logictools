/**
    Texts contains a dictionary of all the culture specific user interface elements in Dutch and English.
 */
var Texts = {};// 0 = NL, 1=EN

// buttons inlog.html
Texts["login-submit"]                   = ["Inloggen", "Log in"];

// texts inlog.html
Texts["login-submit"]                   = ["Inloggen", "Log in"];
Texts["login-header"]                   = ["Log in met uw studentnummer", "Log in with your student number"];
Texts["login-student-id-label"]         = ["Studentnummer: ", "Student number: "];
Texts["invalid-student-number"]         = ["Een geldig studentnummer is een getal groter dan 0.", "A valid student number is a number greater than zero."];
Texts["login-intro"]                    = ["Welkom bij de LogEQ oefenapplicatie", "Welcome to the LogEQ exercise assistant"];
Texts["login-footer"]                   = ["Met de LogEQ applicatie kunt u oefenen met het leveren van bewijzen voor logische equivalentie. Door middel van het uitvoeren van opeenvolgende geldige logische herschrijvingen aan het linker- of rechterlid van de equivalentie dient u tot twee identieke formules te komen, waarmee de logische equivalentie is bewezen.", "With the LogEQ application you can practice constructing proofs of logical equivalence. By performing a sequence of valid logic rewrite rules to the left and/or right hand side of the equivalence you should create two identical formulas and thereby prove the logical equivalence."];

// Buttons index.html
Texts.ok                                = ["OK", "OK"];
Texts.send                              = ["Verstuur","Send"];
Texts.step                              = ["Toon stap", "Show step"];
Texts.showproof                         = ["Toon volledig bewijs", "Show complete proof"];
Texts.showderivation                    = ["Toon volledige afleiding", "Show complete derivation"];
Texts.proofdone                         = ["Controleer of bewijs is voltooid", "Check if proof is complete"];
Texts.derivationdone                    = ["Controleer of afleiding is voltooid", "Check if derivation is complete"];
Texts.newexercise                       = ["Nieuwe opgave", "New exercise"];
Texts.exeasy                            = ["Eenvoudig", "Easy"];
Texts.exnormal                          = ["Normaal", "Normal"];
Texts.exhard                            = ["Moeilijk", "Difficult"];
Texts["new-exercise"]                   = ["Zelf invoeren", "Manual entry"];
Texts["exercise"]                       = ["Opgave", "Exercise"];
Texts.help                              = ["Help", "Help"];
Texts.logout                            = ["Uitloggen", "Logout"];
Texts.nexthint                          = ["Volgende hint", "Next hint"];
Texts.dostep                            = ["Deze stap uitvoeren", "Perform step"];
Texts.nohint                            = ["Geen hint beschikbaar", "No hint available"];
Texts["create-exercise-button"]         = ["Oefening aanmaken", "Create exercise"];
Texts.extype                            = ["Type oefening", "Type exercise"];
Texts.exlogeq                           = ["Bewijs logische equivalentie", "Prove logical equivalence"];
Texts.exdnv                             = ["Omzetten naar disjunctieve normaalvorm", "Convert to disjunctive normal form"];
Texts.excnv                             = ["Omzetten naar conjunctieve normaalvorm", "Convert to conjunctive normal form"];
Texts.on                                = ["AAN", "ON"];
Texts.off                               = ["UIT", "OFF"];
Texts.rulejustification                 = ["Regelverantwoording", "Rule Justification"];
Texts.stepvalidation                    = ["Correctie per stap", "Correction per step"];
Texts.welcome                           = ["Welkom","Welcome"];
Texts.loginhelptext1                    = ["LogEX is sneller te bedienen door gebruik te maken van sneltoetsen.","LogEX is easier to control if you use hotkeys."];
Texts.loginhelptext2                    = ["Een overzicht van de sneltoetsen staat in het <a href='LogEX_manual_NL.pdf'>Help</a>-bestand.","A list of all hotkeys is in the <a href='LogEX_manual_EN.pdf'>Help</a> file."];
Texts.loginhelptext3                    = ["Tijdens een oefening is de help altijd te bereiken via de helpknop rechtsboven.","You can always access the help by pressing the help button in the right top corner of the screen."];
Texts.loginhelptext4                    = ["Interacties met de logica tutor worden gelogd voor onderzoeksdoeleinden. Individuele gebruikersdata worden nooit openbaar gemaakt. Door in te loggen geeft u toestemming om de interacties met de tutor te onderzoeken. Deze website maakt gebruikt van cookies.","We log interactions with the logic tutor for research purposes. We will never disclose individual user data. When you login you agree with using your interactions for research. This website uses cookies."];
Texts["add-step-top"]                   = ["Voeg top-down stap toe","Add top-down step"];
Texts["add-step-bottom"]                = ["Voeg bottom-up stap toe","Add bottom-up step"];
Texts["do-bottom-up-step"]              = ["Doe in de volgende stap een Bottom-Up stap.","Do a bottom up step next."];
Texts["do-top-down-step"]               = ["Doe in de volgende stap een Top-Down stap.","Do a Top Down step next."];


// Message texts index.html
Texts["no-rule"]                        = ["U moet aangeven welke regel u heeft toegepast", "You must indicate which rule you have applied"];
Texts["not-changed"]                    = ["U heeft de vergelijking niet gewijzigd", "You have not changed the equation"];
Texts.wrongstep                         = ["U heeft een verkeerde stap uitgevoerd", "You have performed an incorrect step"];
Texts.wrongrule                         = ["U heeft de verkeerde regel gekozen", "You have chosen an incorrect rule"];
Texts.similar                           = ["Er is geen stap gemaakt, de begin- en eindtermen zijn gelijk.", "No changes have been made. Both terms have remained the same."];
Texts.correctnotval                     = ["Deze formule is equivalent met de vorige, maar u hebt ofwel meer stappen in een keer gedaan, ofwel een regel fout toegepast.", "This formula is quivalent with the last, but you have either performed multiple steps at once or performed an incorrect step."];
Texts.invalidformula                    = ["Deze formule is grammaticaal niet correct", "This formula has an incorrect syntax"];
Texts.incomplete                        = ["Bewijs is nog niet voltooid", "The proof is not yet completed"];
Texts.incomplete1                       = ["Afleiding is nog niet voltooid","Derivation is not yet completed"];  
Texts.rewritethis                       = ["Herschrijf deze formule", "Rewrite this formula"];
Texts.use                               = ["Gebruik '", "Use '"];
Texts.fullhint1                         = ["Herschrijf deze formule met behulp van de '", "Rewrite this formula using the '"];
Texts.fullhint2                         = ["' regel naar '", "' rule to '"];
Texts["not-equivalent"]                 = ["De beide expressies zijn niet equivalent.", "The two expressions are not equivalent."];
Texts.identical                         = ["U moet twee verschillende formules opgeven.", "You have to specify two different formulas."];
Texts["error-creating-exercise"]        = ["Er is een probleem opgetreden bij het aanmaken van de opgave. Heeft u een valide opgave opgevoerd?", "An error occured while creating the exercise. Did you create a valid exercise?"];
Texts["error-validating-exercise"]      = ["Er is een probleem opgetreden bij het valideren van de uitwerking. Probeert u het nog een keer.", "An error occured while validating the exercise. Please try again."]; 
Texts["error-generating-exercise"]      = ["Er is een probleem opgetreden bij het aanmaken van de opgave. Probeert u het nog een keer.", "An error occured while creating the exercise. Please try again."];
Texts["error-solving-exercise"]         = ["Er is een probleem opgetreden bij het tonen van het volledige bewijs. Probeert u het nog een keer.", "An error occured while showing the complete proof. Please try again."];
Texts["error-solving-next-step"]        = ["Er is een probleem opgetreden bij het tonen van de volgende stap. Probeert u het nog een keer.", "An error occured while showing the next step. Please try again."];
Texts["error-solving-next-stap-inv"]    = ["Volgende stap kan niet worden getoond. Er bevindt zich een foute stap in de uitwerking.", "Next step cannot be shown. There's an incorrect step in your solution"];    
Texts["error-solving-last-step"]        = ["Er is een probleem opgetreden bij het tonen van de volgende stap. Er zijn geen overige stappen meer.", "An error occured while showing the next step. There are no more steps."];
Texts["error-showing-hint"]             = ["Er is een probleem opgetreden bij het tonen van de hint voor de volgende stap. Probeert u het nog een keer.", "An error occured while showing the help for the next step. Please try again."];
Texts["error-validating-step"]          = ["Er is een probleem opgetreden bij het valideren van de stap. Probeert u het nog een keer.", "An error occured while validating the step. Please try again."];
Texts["Not suitable"]                   = ["De formules zijn niet equivalent!","Formulas are not equivalent"];
Texts["no-step-possible"]               = ["De formule is al in normaalvorm.","The formula is in normal form."];
