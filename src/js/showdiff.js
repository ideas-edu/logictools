// import katex from 'katex'
import { Formula, ParenthesisGroup, Literal, UnaryOperator, BinaryOperator } from './model/shared/formula.js'

const hl = 'formula-highlight'

function checkDifferences (oldSub, newSub) {
  switch (true) {
    case oldSub instanceof ParenthesisGroup:
      if (!(newSub instanceof ParenthesisGroup)) {
        newSub.style = hl
      } else {
        [oldSub.expression, newSub.expression] = checkDifferences(oldSub.expression, newSub.expression)
      }
      break
    case oldSub instanceof Literal:
      if (!(newSub instanceof Literal)) {
        newSub.style = hl
      }
      if (oldSub.expression !== newSub.expression) {
        newSub.style = hl
      }
      break
    case oldSub instanceof UnaryOperator:
      if (!(newSub instanceof UnaryOperator)) {
        newSub.style = hl
      } else {
        [oldSub.expression, newSub.expression] = checkDifferences(oldSub.expression, newSub.expression)
      }
      break
    case oldSub instanceof BinaryOperator:
      if (!(newSub instanceof BinaryOperator)) {
        newSub.style = hl
      } else if (newSub.operator !== oldSub.operator) {
        newSub.style = hl
      } else {
        // Check binary operator
        const oldSub2 = oldSub.flatten()
        const newSub2 = newSub.flatten()

        let i = 0
        while ((i < oldSub2.expressions.length && i < newSub2.expressions.length)) {
          if (oldSub2.expressions[i].printUnicode() !== newSub2.expressions[i].printUnicode()) {
            break
          }
          i++
        }
        const firstDifferenceIndex = i

        i = 0
        while ((i < oldSub2.expressions.length && i < newSub2.expressions.length)) {
          if (oldSub2.expressions[oldSub2.expressions.length - 1 - i].printUnicode() !== newSub2.expressions[newSub2.expressions.length - 1 - i].printUnicode()) {
            break
          }
          i++
        }
        const lastDifferenceIndex = newSub2.expressions.length - 1 - i

        if (firstDifferenceIndex === lastDifferenceIndex) {
          const index = firstDifferenceIndex
          const result = checkDifferences(oldSub2.expressions[index], newSub2.expressions[index])
          oldSub2.expressions[index] = result[0]
          newSub2.expressions[index] = result[1]
        }

        if (firstDifferenceIndex <= lastDifferenceIndex) {
          newSub2.style = hl
          newSub2.firstDifferenceIndex = firstDifferenceIndex
          newSub2.lastDifferenceIndex = lastDifferenceIndex
        }

        return [oldSub2, newSub2]
      }
      break
  }
  return [oldSub, newSub]
}

export function showdiff (oldString, newString) {
  const oldFormula = new Formula(oldString).result
  const newFormula = new Formula(newString).result

  const result = checkDifferences(oldFormula, newFormula)

  return result[1]
}
