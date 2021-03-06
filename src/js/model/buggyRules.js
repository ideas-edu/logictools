/**
    BuggyRules is a dictionary of all the known buggy rules and their translations.
 */
export const BuggyRules = {}
BuggyRules['logic.propositional.buggy.absor'] = ['U heeft absorptie niet correct toegepast.', 'You have applied absorption incorrectly.']
BuggyRules['logic.propositional.buggy.absor2'] = ['U heeft absorptie niet correct toegepast: let op welke subformule u overhoudt.', 'You have applied absorption incorrectly: pay attention to which subformula you keep.']
BuggyRules['logic.propositional.buggy.andcompl'] = ['U heeft een complement regel niet correct toegepast.', 'You have applied a complement rule incorrectly.']
BuggyRules['logic.propositional.buggy.andcompl2'] = ['U heeft een complement regel niet correct toegepast.', 'You have applied a complement rule incorrectly.']
BuggyRules['logic.propositional.buggy.andsame'] = ['U heeft idempotentie niet correct toegepast.', 'You have applied idempoteny incorrectly.']
BuggyRules['logic.propositional.buggy.assimp'] = ['U heeft onterecht associativiteit bij implicatie toegepast.', 'You have incorrectly applied associativity to an implication.']
BuggyRules['logic.propositional.buggy.assoc'] = ['Associativiteit mag alleen toegepast worden tussen gelijke connectieven (enkel conjuncties of enkel disjuncties).', 'Associativity is only allowed on similar connectives (either only conjunctions or only disjunctions).']
BuggyRules['logic.propositional.buggy.commimp'] = ['U heeft onterecht commutativiteit bij implicatie toegepast.', 'You have incorrectly applied commutativity to an implication.']
BuggyRules['logic.propositional.buggy.demorgan1'] = ['U heeft De Morgan niet correct toegepast, denk aan de negatietekens.', "You have applied De Morgan incorrectly, don't forget the negation signs."]
BuggyRules['logic.propositional.buggy.demorgan2'] = ['Denk bij het toepassen van De Morgan aan het weghalen van de negatie buiten de haken.', "When applying De Morgan, don't forget to remove the negation sign outside of the brackets."]
BuggyRules['logic.propositional.buggy.demorgan3'] = ['Denk bij het toepassen van De Morgan aan het omzetten van een conjunctie in een disjunctie.', "When applying De Morgan, don't forget to change the conjunction into a disjunction."]
BuggyRules['logic.propositional.buggy.demorgan4'] = ['Denk bij het toepassen van De Morgan aan het omzetten van een disjunctie in een conjunctie.', "When applying De Morgan, don't forget to change the disjunction into a conjunction."]
BuggyRules['logic.propositional.buggy.demorgan5'] = ['Let bij het toepassen van De Morgan op het plaatsen van de haken, u hebt het bereik van een negatie onbedoeld gewijzigd.', 'When applying De Morgan, take care where you place the brackets. You have inadvertently changed the application range of the negation.']
BuggyRules['logic.propositional.buggy.distr'] = ['U heeft distributie niet correct toegepast, let op waar conjuncties en waar disjuncties komen te staan.', 'You have applied distribution incorrectly. Take care where you put the conjunctions and where you put the disjunctions.']
BuggyRules['logic.propositional.buggy.distrnot'] = ['U bent bij de distributie een negatie vergeten.', 'You have forgotten a negation when applying distribution.']
BuggyRules['logic.propositional.buggy.equivelim1'] = ['U heeft equivalentie eliminatie niet correct toegepast, let op de negaties', 'You have applied equivalence definition incorrecly. Take care of the negation signs.']
BuggyRules['logic.propositional.buggy.equivelim2'] = ['U heeft equivalentie eliminatie niet correct toegepast, let op de plaats van de disjuncties en de conjuncties.', 'You have applied equivalence definition incorrecly. Take care of the place of the disjunctions and conjunctions.']
BuggyRules['logic.propositional.buggy.equivelim3'] = ['U heeft de regel voor implicatie eliminatie in plaats van equivalentie eliminatie toegepast.', 'You have applied implication definition instead of equivalence definition.']
BuggyRules['logic.propositional.buggy.falseprop'] = ['U heeft een F regel niet correct toegepast.', 'You have applied an F-rule incorrectly.']
BuggyRules['logic.propositional.buggy.idemequi'] = ['Idempotentie geldt niet voor equivalenties, alleen voor conjuncties en disjuncties.', 'Idempotency does not apply to equivalences, only to conjunctions and disjunctions.']
BuggyRules['logic.propositional.buggy.idemimp'] = ['Idempotentie geldt niet voor implicaties, alleen voor conjuncties en disjuncties.', 'Idempotency does not apply to implications, only to conjunctions and disjunctions.']
BuggyRules['logic.propositional.buggy.implelim'] = ['U heeft implicatie eliminatie niet correct toegepast.', 'You have applied implication definition incorrectly.']
BuggyRules['logic.propositional.buggy.implelim1'] = ['In de regel voor implicatie eliminatie staat een disjunctie en geen conjunctie.', 'The rule for implication definition uses a disjunction instead of a conjunction.']
BuggyRules['logic.propositional.buggy.implelim2'] = ['U heeft de regel voor equivalentie eliminatie in plaats van implicatie eliminatie toegepast.', 'You have applied equivalence definition instead of implication definition.']
BuggyRules['logic.propositional.buggy.implnotelim'] = ['U bent de negatie voor de implicatie vergeten.', 'You forgot the negation in front of the implication.']
BuggyRules['logic.propositional.buggy.notoverimpl'] = ['U kunt niet het negatie teken over een implicatie distribueren. Herschrijf eerst de implicatie en pas dan De Morgan toe.', 'You are not allowed to distribute a negation sign over an implication. First rewrite the implication and then apply De Morgan.']
BuggyRules['logic.propositional.buggy.orcompl'] = ['U heeft een complement regel niet correct toegepast.', 'You have applied a complement rule incorrectly.']
BuggyRules['logic.propositional.buggy.orcompl2'] = ['U heeft een complement regel niet correct toegepast.', 'You have applied a complement rule incorrectly.']
BuggyRules['logic.propositional.buggy.orsame'] = ['U heeft een T regel onterecht toegepast.', 'You have applied a T-rule incorrectly.']
BuggyRules['logic.propositional.buggy.parenth1'] = ['U kunt niet zonder meer een negatie verplaatsen.Toepassen van De Morgan kan wel, denk daarbij aan beide negaties en het omwisselen van een conjunctie in een disjunctie of vice versa.', 'You are not allowed to move a negation sign. You can apply De Morgan, but remember both negations and switching the conjunction into a disjunction sign or vice versa.']
BuggyRules['logic.propositional.buggy.parenth2'] = ['Let op de haakjes. Denk eraan dat bij equivalentie-eliminatie de negatie buiten haken blijft staan.', 'Take care of the brackets. Remember to keep the negation out of the brackets when applying equivalence definition.']
BuggyRules['logic.propositional.buggy.parenth3'] = ['Dubbele negatie is pas toepasbaar als beide negaties betrekking hebben op dezelfde subformule.', 'Double negation can only be applied if both negations apply to the same subformula.']
BuggyRules['logic.propositional.buggy.trueprop'] = ['U heeft een T regel niet correct toegepast.', 'You have applied a T-rule incorrectly.']
BuggyRules['logic.propositional.buggy.andcompl.inv'] = ['U heeft een complement regel niet correct toegepast.', 'You have applied a complement rule incorrectly.']
BuggyRules['logic.propositional.buggy.orcompl.inv'] = ['U heeft een complement regel niet correct toegepast.', 'You have applied a complement rule incorrectly.']
BuggyRules['logic.propositional.buggy.trueprop.inv'] = ['U heeft een T regel niet correct toegepast.', 'You have applied a T-rule incorrectly.']
BuggyRules['logic.propositional.buggy.falseprop.inv'] = ['U heeft een F regel niet correct toegepast.', 'You have applied an F-rule incorrectly.']
BuggyRules['logic.propositional.buggy.idemimp.inv'] = ['Idempotentie geldt niet voor implicaties, alleen voor conjuncties en disjuncties.', 'Idempotency does not apply to implications, only to conjunctions and disjunctions.']
BuggyRules['logic.propositional.buggy.idemequiv.inv'] = ['Idempotentie geldt niet voor equivalenties, alleen voor conjuncties en disjuncties.', 'Idempotency does not apply to equivalences, only to conjunctions and disjunctions.']
BuggyRules['logic.propositional.buggy.defimpl.inv'] = ['logic.propositional.buggy.DefImpl.inv', 'logic.propositional.buggy.DefImpl.inv']
BuggyRules['logic.propositional.buggy.demorgan3.inv'] = ['Denk bij het toepassen van De Morgan aan het omzetten van een conjunctie in een disjunctie.', "When applying De Morgan, don't forget to change the conjunction into a disjunction."]
BuggyRules['logic.propositional.buggy.demorgan4.inv'] = ['Denk bij het toepassen van De Morgan aan het omzetten van een disjunctie in een conjunctie.', "When applying De Morgan, don't forget to change the disjunction into a conjunction."]
BuggyRules['logic.propositional.buggy.distr.inv'] = ['U heeft distributie niet correct toegepast, let op waar conjuncties en waar disjuncties komen te staan.', 'You have applied distribution incorrectly. Take care where you put the conjunctions and where you put the disjunctions.']
