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

export class Formula {
  constructor (formula) {
    this.error = null
    this.result = this.parse(formula, 0)
    // if (this.error === null) {
    //   console.log(`Done: ${result.printUnicode()}`)
    // } else {
    //   console.log(`Error at index ${this.error.index}: ${this.error.message}\n${formula.substring(0, this.error.index)}_${formula.substring(this.error.index)}`)
    // }
  }

  parse (expressionString, contextIndex) {
    let leftExpression = null
    while (expressionString && expressionString.length > 0) {
      contextIndex += 1
      if (unaryOperators.includes(expressionString[0])) {
        const unaryExpression = this.findFirstExpression(expressionString.substring(1), contextIndex + 1)
        leftExpression = new UnaryOperator(expressionString[0], unaryExpression.exp)
        expressionString = unaryExpression.tailString
        continue
      }
      if (binaryOperators.includes(expressionString[0])) {
        if (leftExpression === null) {
          this.error = {
            message: 'Missing literal or group',
            index: contextIndex
          }
          return
        }
        if (leftExpression instanceof BinaryOperator) {
          if (leftExpression.operator !== expressionString[0]) {
            this.error = {
              message: 'Ambiguous associativity',
              index: contextIndex
            }
            return
          }
        }
        const rightExpression = this.findFirstExpression(expressionString.substring(1), contextIndex + 1)
        leftExpression = new BinaryOperator(expressionString[0], leftExpression, rightExpression.exp)
        expressionString = rightExpression.tailString
        continue
      }
      if (literals.includes(expressionString[0])) {
        if (leftExpression !== null) {
          this.error = {
            message: 'Missing operator',
            index: contextIndex
          }
          return
        }
        const rightExpression = expressionString.substring(1)
        leftExpression = new Literal(expressionString[0])
        expressionString = rightExpression
        continue
      }
      if (expressionString[0] === '(') {
        if (leftExpression !== null) {
          this.error = {
            message: 'Missing operator',
            index: contextIndex
          }
          return
        }
        let i = 1
        let numLeft = 1
        while (numLeft > 0) {
          if (i > expressionString.length) {
            this.error = {
              message: 'Missing closing parenthesis',
              index: contextIndex
            }
            return
          }
          if (expressionString[i] === '(') {
            numLeft += 1
          }
          if (expressionString[i] === ')') {
            numLeft -= 1
          }
          i++
        }
        leftExpression = new ParenthesisGroup(this.parse(expressionString.substring(1, i - 1), contextIndex + 1))
        expressionString = expressionString.substring(i)
        continue
      }
      this.error = {
        message: 'Unexpected character',
        index: contextIndex
      }
      return
    }
    return leftExpression
  }

  findFirstExpression (expressionString, contextIndex) {
    if (literals.includes(expressionString[0])) {
      return {
        exp: new Literal(expressionString[0]),
        tailString: expressionString.substring(1)
      }
    }

    if (unaryOperators.includes(expressionString[0])) {
      const unaryExpression = this.findFirstExpression(expressionString.substring(1), contextIndex + 1)
      const leftExpression = new UnaryOperator(expressionString[0], unaryExpression.exp)
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
          this.error = {
            message: 'Missing closing parenthesis',
            index: contextIndex
          }
          return {
            exp: null,
            tailString: ''
          }
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
        exp: new ParenthesisGroup(this.parse(expressionString.substring(1, i - 1), contextIndex + 1)),
        tailString: expressionString.substring(i)
      }
    }

    this.error = {
      message: 'Missing literal or group',
      index: contextIndex
    }
    return {
      exp: null,
      tailString: ''
    }
  }
}
