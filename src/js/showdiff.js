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
        let oldSub2 = oldSub.flatten()
        let newSub2 = newSub.flatten()

        let i = 0
        while ((i < oldSub2.expressions.length && i < newSub2.expressions.length)) {
          // console.log(oldSub2.expressions[i], newSub2.expressions[i])
          let result = checkDifferences(oldSub2.expressions[i], newSub2.expressions[i])
          oldSub2.expressions[i] = result[0]
          newSub2.expressions[i] = result[1]
          i++
        }
        return [oldSub2, newSub2]
      }
      break
  }
  return [oldSub, newSub]
}

export function showdiff (oldString, newString) {
  let oldFormula = new Formula(oldString).result
  let newFormula = new Formula(newString).result

  let [oldFormula2, newFormula2] = checkDifferences(oldFormula, newFormula)

  return newFormula2
  // onderzoek hoeveel tekens er aan het begin van de string gelijk zijn
  // let i = 0
  // let equalHead = 0
  // while ((i < oldString.length) && (oldString.charAt(i) === newString.charAt(i))) {
  //   equalHead++
  //   i++
  // }

  // // alert(equalHead);

  // // onderzoek hoeveel tekens er aan het eind van de string gelijk zijn
  // i = oldString.length - 1
  // let j = newString.length - 1
  // let equalTail = 0
  // while ((i > 0) && (oldString.charAt(i) === newString.charAt(j))) {
  //   equalTail++
  //   i--
  //   j--
  // }

  // // alert(equalTail);

  // let s = ''

  // // als er aan het begin tekens gelijk zijn zetten we die in s
  // if (equalHead > 0) {
  //   s = katex.renderToString(oldString.substr(0, equalHead), {
  //     throwOnError: false
  //   })
  // }

  // // zet nu een kleuraccent
  // s = s + "<span class='formula-highlight'>"

  // // kopieer het veranderde tussenstuk
  // s = s + katex.renderToString(oldString.substr(equalHead, oldString.length - equalHead - equalTail), {
  //   throwOnError: false
  // })

  // // zet nu een kleuraccent
  // s = s + '</span>'

  // // zet nu het deel van de overeenkomstige staart erbij
  // if (equalTail > 0) {
  //   s = s + katex.renderToString(oldString.substr(oldString.length - equalTail, equalTail), {
  //     throwOnError: false
  //   })
  // }
  // return s
}
