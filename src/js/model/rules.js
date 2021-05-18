/**
    Rules is a dictionary of all the possible rules and their keys.
 */
export const Rules = {}

// basisarray's die hieronder hergebruikt worden
// LogEx
const absorbtie = 'rule.logic.propositional.absorption'
const associativiteit = 'rule.logic.propositional.assoc'
const commutativiteit = 'rule.logic.propositional.commutativity'
const deMorgan = 'rule.logic.propositional.demorgan'
const distributie = 'rule.logic.propositional.distribution'
const dubbeleNegatie = 'rule.logic.propositional.doublenegation'
const equivalentieDefinitie = 'rule.logic.propositional.equivalence'
const FRegelComplement = 'rule.logic.propositional.falsecomplement'
const FRegelConjunctie = 'rule.logic.propositional.falseconjunction'
const FRegelDisjunctie = 'rule.logic.propositional.falsedisjunction'
const FRegelNietT = 'rule.logic.propositional.nottrue'
const implicatieDefinitie = 'rule.logic.propositional.implication'
const idempotentie = 'rule.logic.propositional.idempotency'
const TRegelComplement = 'rule.logic.propositional.truecomplement'
const TRegelConjunctie = 'rule.logic.propositional.trueconjunction'
const TRegelDisjunctie = 'rule.logic.propositional.truedisjunction'
const TRegelNietF = 'rule.logic.propositional.notfalse'
// LogAx
const assumption = 'rule.logic.propositional.axiomatic.assumption'

// Absorptie
Rules['logic.propositional.absorption'] = absorbtie // group id
Rules['logic.propositional.absorpor'] = absorbtie
Rules['absorpor.inv'] = absorbtie
Rules['logic.propositional.absorpand'] = absorbtie
Rules['absorpand.inv'] = absorbtie
Rules['absorpor-subset'] = absorbtie

Rules['logic.propositional.assoc'] = associativiteit
Rules['logic.propositional.assocand'] = associativiteit
Rules['logic.propositional.assocor'] = associativiteit

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
Rules['logic.propositional.demorgan'] = deMorgan // group id
Rules['logic.propositional.demorganor'] = deMorgan
Rules['logic.propositional.demorganand'] = deMorgan
Rules['logic.propositional.gendemorganand'] = deMorgan
Rules['logic.propositional.gendemorganor'] = deMorgan
Rules.demorganornot = deMorgan
Rules.demorganandnot = deMorgan
Rules['logic.propositional.invdemorganand'] = deMorgan
Rules['logic.propositional.invdemorganor'] = deMorgan

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
Rules['logic.propositional.doublenegation'] = dubbeleNegatie // group id
Rules['logic.propositional.notnot'] = dubbeleNegatie
Rules['logic.propositional.geninvdoublenegand'] = dubbeleNegatie
Rules['logic.propositional.geninvdoublenegor'] = dubbeleNegatie
Rules['notnot.inv'] = dubbeleNegatie

// Equivalantie definitie
Rules['logic.propositional.equivalence'] = equivalentieDefinitie // group id
Rules['logic.propositional.defequiv'] = equivalentieDefinitie
Rules['defequiv.inv'] = equivalentieDefinitie

// False complement
Rules['logic.propositional.falsecomplement'] = FRegelComplement // group id
Rules['logic.propositional.compland'] = FRegelComplement
Rules['compland.inv'] = FRegelComplement

// False conjunctie
Rules['logic.propositional.falseconjunction'] = FRegelConjunctie // group id
Rules['logic.propositional.falsezeroand'] = FRegelConjunctie
Rules['falsezeroand.inv'] = FRegelConjunctie

// False disjunctie
Rules['logic.propositional.falsedisjunction'] = FRegelDisjunctie // group id
Rules['logic.propositional.falsezeroor'] = FRegelDisjunctie
Rules['falsezeroor.inv'] = FRegelDisjunctie

// Not True
Rules['logic.propositional.group-nottrue'] = FRegelNietT // group id
Rules['logic.propositional.nottrue'] = FRegelNietT
Rules['nottrue.inv'] = FRegelNietT

// Idempotentie
Rules['logic.propositional.idempotency'] = idempotentie // group id
Rules['logic.propositional.idempor'] = idempotentie
Rules['idempor.inv'] = idempotentie
Rules['logic.propositional.idempand'] = idempotentie
Rules['idempand.inv'] = idempotentie
Rules['logic.propositional.invidempor'] = idempotentie
Rules['logic.propositional.invidempand'] = idempotentie

// Implicatie definitie
Rules['logic.propositional.implication'] = implicatieDefinitie // group id
Rules['logic.propositional.defimpl'] = implicatieDefinitie
Rules['defimpl.inv'] = implicatieDefinitie

// True complement
Rules['logic.propositional.truecomplement'] = TRegelComplement // group id
Rules['logic.propositional.complor'] = TRegelComplement
Rules['complor.inv'] = TRegelComplement
Rules.introcompl = TRegelComplement

// True conjunctie
Rules['logic.propositional.trueconjunction'] = TRegelConjunctie // group id
Rules['logic.propositional.truezeroand'] = TRegelConjunctie
Rules['truezeroand.inv'] = TRegelConjunctie
Rules.introtrueleft = TRegelConjunctie

// True disjunctie
Rules['logic.propositional.truedisjunction'] = TRegelDisjunctie // group id
Rules['logic.propositional.truezeroor'] = TRegelDisjunctie
Rules['truezeroor.inv'] = TRegelDisjunctie

// Not False
Rules['logic.propositional.group-notfalse'] = TRegelNietF // group id
Rules['logic.propositional.notfalse'] = TRegelNietF
Rules['notfalse.inv'] = TRegelNietF


/////////////////
// LogAx
/////////////////
Rules['logic.propositional.axiomatic.assumption'] = assumption
