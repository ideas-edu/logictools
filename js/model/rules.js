/**
    Rules is a dictionary of all the possible rules and their translations.
 */
export const Rules = {} // 0 = NL, 1=EN
Rules[''] = ['Regel..', 'Rule..']

// basisarray's die hieronder hergebruikt worden
const absorbtie = ['Absorptie', 'Absorption']

// var associativiteit               = ["Associativiteit", "Associativity"];
const commutativiteit = ['Commutativiteit', 'Commutativity']
const de_morgan = ['De Morgan', 'De Morgan']
const distributie = ['Distributie', 'Distribution']
const dubbele_negatie = ['Dubbele negatie', 'Double negation']
const equivalentie_definitie = ['Equivalentie-eliminatie', 'Equivalention definition']
const F_regel_complement = ['F-regel complement', 'F-rule complement']
const F_regel_conjunctie = ['F-regel conjunctie', 'F-rule conjunction']
const F_regel_disjunctie = ['F-regel disjunctie', 'F-rule disjunction']
const F_regel_niet_T = ['F-regel niet T', 'F-rule not T']
const implicatie_definitie = ['Implicatie-eliminatie', 'Implication definition']
const idempotentie = ['Idempotentie', 'Idempotency']
const T_regel_complement = ['T-regel complement', 'T-rule complement']
const T_regel_conjunctie = ['T-regel conjunctie', 'T-rule conjunction']
const T_regel_disjunctie = ['T-regel disjunctie', 'T-rule disjunction']
const T_regel_niet_F = ['T-regel niet F', 'T-rule not F']

// Absorptie
Rules['logic.propositional.absorption'] = absorbtie // group id
Rules['logic.propositional.absorpor'] = absorbtie
Rules['absorpor.inv'] = absorbtie
Rules['logic.propositional.absorpand'] = absorbtie
Rules['absorpand.inv'] = absorbtie
Rules['absorpor-subset'] = absorbtie

// Rules["logic.propositional.assocand"]            = associativiteit;
// Rules["logic.propositional.assocor"]             = associativiteit;

// Commutativiteit
Rules['logic.propositional.commutativity'] = commutativiteit // group id
Rules['logic.propositional.command'] = commutativiteit
Rules['logic.propositional.commor'] = commutativiteit
Rules['commor.sort'] = commutativiteit
Rules['command.sort'] = commutativiteit
Rules['complor.sort'] = commutativiteit
Rules['compland.sort'] = commutativiteit
Rules['idempor.sort'] = commutativiteit
Rules['idempand.sort'] = commutativiteit
Rules['top-is-and.com'] = commutativiteit
Rules['top-is-or.com'] = commutativiteit
Rules['command.common-literal-special'] = commutativiteit
Rules['command.common-literal'] = commutativiteit

// De Morgan
Rules['logic.propositional.demorgan'] = de_morgan // group id
Rules['logic.propositional.demorganor'] = de_morgan
Rules['logic.propositional.demorganand'] = de_morgan
Rules['logic.propositional.gendemorganand'] = de_morgan
Rules['logic.propositional.gendemorganor'] = de_morgan
Rules.demorganornot = de_morgan
Rules.demorganandnot = de_morgan
Rules['logic.propositional.invdemorganand'] = de_morgan
Rules['logic.propositional.invdemorganor'] = de_morgan

// Distributie
Rules['logic.propositional.distribution'] = distributie
Rules['logic.propositional.andoveror'] = distributie
Rules['logic.propositional.oroverand'] = distributie
Rules['logic.propositional.genandoveror'] = distributie
Rules['logic.propositional.genoroverand'] = distributie
Rules['logic.propositional.invoroverand'] = distributie
Rules['logic.propositional.invandoveror'] = distributie
Rules.distrornot = distributie
Rules['andoveror.inv.common-literal'] = distributie

// Dubbele negatie
Rules['logic.propositional.doublenegation'] = dubbele_negatie // group id
Rules['logic.propositional.notnot'] = dubbele_negatie
Rules['logic.propositional.geninvdoublenegand'] = dubbele_negatie
Rules['logic.propositional.geninvdoublenegor'] = dubbele_negatie
Rules['notnot.inv'] = dubbele_negatie

// Equivalantie definitie
Rules['logic.propositional.equivalence'] = equivalentie_definitie // group id
Rules['logic.propositional.defequiv'] = equivalentie_definitie
Rules['defequiv.inv'] = equivalentie_definitie

// False complement
Rules['logic.propositional.falsecomplement'] = F_regel_complement // group id
Rules['logic.propositional.compland'] = F_regel_complement
Rules['compland.inv'] = F_regel_complement

// False conjunctie
Rules['logic.propositional.falseconjunction'] = F_regel_conjunctie // group id
Rules['logic.propositional.falsezeroand'] = F_regel_conjunctie
Rules['falsezeroand.inv'] = F_regel_conjunctie

// False disjunctie
Rules['logic.propositional.falsedisjunction'] = F_regel_disjunctie // group id
Rules['logic.propositional.falsezeroor'] = F_regel_disjunctie
Rules['falsezeroor.inv'] = F_regel_disjunctie

// Not True
Rules['logic.propositional.group-nottrue'] = F_regel_niet_T // group id
Rules['logic.propositional.nottrue'] = F_regel_niet_T
Rules['nottrue.inv'] = F_regel_niet_T

// Idempotentie
Rules['logic.propositional.idempotency'] = idempotentie // group id
Rules['logic.propositional.idempor'] = idempotentie
Rules['idempor.inv'] = idempotentie
Rules['logic.propositional.idempand'] = idempotentie
Rules['idempand.inv'] = idempotentie
Rules['logic.propositional.invidempor'] = idempotentie
Rules['logic.propositional.invidempand'] = idempotentie

// Implicatie definitie
Rules['logic.propositional.implication'] = implicatie_definitie // group id
Rules['logic.propositional.defimpl'] = implicatie_definitie
Rules['defimpl.inv'] = implicatie_definitie

// True complement
Rules['logic.propositional.truecomplement'] = T_regel_complement // group id
Rules['logic.propositional.complor'] = T_regel_complement
Rules['complor.inv'] = T_regel_complement
Rules.introcompl = T_regel_complement

// True conjunctie
Rules['logic.propositional.trueconjunction'] = T_regel_conjunctie // group id
Rules['logic.propositional.truezeroand'] = T_regel_conjunctie
Rules['truezeroand.inv'] = T_regel_conjunctie
Rules.introtrueleft = T_regel_conjunctie

// True disjunctie
Rules['logic.propositional.truedisjunction'] = T_regel_disjunctie // group id
Rules['logic.propositional.truezeroor'] = T_regel_disjunctie
Rules['truezeroor.inv'] = T_regel_disjunctie

// Not False
Rules['logic.propositional.group-notfalse'] = T_regel_niet_F // group id
Rules['logic.propositional.notfalse'] = T_regel_niet_F
Rules['notfalse.inv'] = T_regel_niet_F
