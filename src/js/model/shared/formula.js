class Expression {

}

class ParenthesisGroup extends Expression {
  constructor (expression) {
    super()
    this.expression = expression
  }

  printUnicode () {
    return `(${this.expression.printUnicode()})`
  }
}

class Literal extends Expression {
  constructor (expression) {
    super()
    this.expression = expression
  }

  printUnicode () {
    return `${this.expression}`
  }
}

class UnaryOperator extends Expression {
  constructor (operator, expression) {
    super()
    this.operator = operator
    this.expression = expression
  }

  printUnicode () {
    return `${this.operator}{${this.expression.printUnicode()}}`
  }
}

class BinaryOperator extends Expression {
  constructor (operator, lhe, rhe) {
    super()
    this.operator = operator
    this.lhe = lhe
    this.rhe = rhe
  }

  printUnicode () {
    return `${this.lhe.printUnicode()} ${this.operator} ${this.rhe.printUnicode()}`
  }
}

const unaryOperators = ['¬']
const binaryOperators = ['∧', '∨', '→', '↔']
const literals = ['p', 'q', 'r', 's', 'T', 'F']

class Formula {
  constructor (formula) {
    console.log(`Input: ${formula}`)
    const result = this.parse(formula)
    console.log(`Done: ${result.printUnicode()}`)
  }

  parse (expressionString) {
    let leftExpression = null
    while (expressionString && expressionString.length > 0) {
      console.log(`Parse: ${expressionString}`)
      if (unaryOperators.includes(expressionString[0])) {
        const unaryExpression = this.findFirstExpression(expressionString.substring(1))
        leftExpression = new UnaryOperator(expressionString[0], unaryExpression.exp)
        console.log(leftExpression.printUnicode())
        expressionString = unaryExpression.tailString
        console.log(expressionString)
        continue
      }
      if (binaryOperators.includes(expressionString[0])) {
        if (leftExpression === null) {
          throw Error('Missing literal or group')
        }
        if (leftExpression instanceof BinaryOperator) {
          if (leftExpression.operator !== expressionString[0]) {
            throw Error('Ambiguous associativity')
          }
        }
        const rightExpression = this.findFirstExpression(expressionString.substring(1))
        leftExpression = new BinaryOperator(expressionString[0], leftExpression, rightExpression.exp)
        console.log(leftExpression.printUnicode())
        expressionString = rightExpression.tailString
        continue
      }
      if (literals.includes(expressionString[0])) {
        if (leftExpression !== null) {
          throw Error('Missing operator')
        }
        const rightExpression = expressionString.substring(1)
        leftExpression = new Literal(expressionString[0])
        console.log(leftExpression.printUnicode())
        expressionString = rightExpression
        continue
      }
      if (expressionString[0] === '(') {
        console.log(`Found brackets: ${expressionString}`)
        if (leftExpression !== null) {
          throw Error('Missing operator')
        }
        let i = 1
        let numLeft = 1
        while (numLeft > 0) {
          if (i > expressionString.length) {
            throw Error('Missing closing parenthesis')
          }
          if (expressionString[i] === '(') {
            numLeft += 1
          }
          if (expressionString[i] === ')') {
            numLeft -= 1
          }
          i++
        }
        leftExpression = new ParenthesisGroup(this.parse(expressionString.substring(1, i - 1)))
        expressionString = expressionString.substring(i)
        continue
      }
      throw Error('Unexpected character')
    }
    return leftExpression
  }

  findFirstExpression (expressionString) {
    console.log(`Find: ${expressionString}`)
    if (literals.includes(expressionString[0])) {
      return {
        exp: new Literal(expressionString[0]),
        tailString: expressionString.substring(1)
      }
    }

    if (unaryOperators.includes(expressionString[0])) {
      const unaryExpression = this.findFirstExpression(expressionString.substring(1))
      const leftExpression = new UnaryOperator(expressionString[0], unaryExpression.exp)
      console.log(`Un ${leftExpression.printUnicode()} | ${unaryExpression.tailString}`)
      return {
        exp: leftExpression,
        tailString: unaryExpression.tailString
      }
    }

    if (expressionString[0] === '(') {
      let i = 1
      let numLeft = 1
      while (numLeft > 0) {
        if (i > expressionString.length) {
          throw Error('Missing closing parenthesis')
        }
        if (expressionString[i] === '(') {
          numLeft += 1
        }
        if (expressionString[i] === ')') {
          numLeft -= 1
        }
        i++
      }
      return {
        exp: new ParenthesisGroup(this.parse(expressionString.substring(1, i - 1))),
        tailString: expressionString.substring(i)
      }
    }

    throw Error('Missing literal or group')
  }
}
const formula = new Formula('¬¬¬p∧r∧(s∧¬r)')
