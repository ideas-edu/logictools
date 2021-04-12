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

  length () {
    if (this.expression === undefined) {
      return 2
    }
    return 2 + this.expression.length()
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

  length () {
    return 1
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

  length () {
    return 1 + this.expression.length()
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

  length () {
    if (this.rhe !== null) {
      return 1 + this.lhe.length() + this.rhe.length()
    }
    return 1 + this.lhe.length()
  }
}

const unaryOperators = ['¬']
const binaryOperators = ['∧', '∨', '→', '↔']
const implicitAssociativeBinaryOperators = ['∧', '∨']
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

  parse (expressionString, givenContextIndex) {
    let leftExpression = null
    let contextIndex = null

    while (expressionString && expressionString.length > 0) {
      if (leftExpression === null) {
        contextIndex = givenContextIndex + 1
      } else {
        contextIndex = givenContextIndex + leftExpression.length()
      }

      // Unary
      if (unaryOperators.includes(expressionString[0])) {
        if (leftExpression !== null) {
          this.error = {
            message: 'Missing operator',
            key: 'shared.syntaxError.missingOperator',
            params: {
              index: contextIndex + 1,
              length: 0
            }
          }
          return
        }
        const unaryExpression = this.findFirstExpression(expressionString.substring(1), contextIndex + 1)
        leftExpression = new UnaryOperator(expressionString[0], unaryExpression.exp)
        expressionString = unaryExpression.tailString
        continue
      }
      // Binary
      if (binaryOperators.includes(expressionString[0])) {
        if (leftExpression === null) {
          this.error = {
            message: 'Missing operand',
            key: 'shared.syntaxError.missingOperand',
            params: {
              index: contextIndex,
              length: 0
            }
          }
          return
        }
        if (leftExpression instanceof BinaryOperator) {
          if (leftExpression.operator !== expressionString[0] || !implicitAssociativeBinaryOperators.includes(expressionString[0])) {
            this.error = {
              message: 'Ambiguous associativity',
              key: 'shared.syntaxError.ambiguougAssoc',
              params: {
                index: contextIndex + 1,
                length: 1
              }
            }
            return
          }
        }
        const rightExpression = this.findFirstExpression(expressionString.substring(1), contextIndex + 1)
        leftExpression = new BinaryOperator(expressionString[0], leftExpression, rightExpression.exp)
        expressionString = rightExpression.tailString
        continue
      }
      // Literal
      if (literals.includes(expressionString[0])) {
        if (leftExpression !== null) {
          this.error = {
            message: 'Missing operator',
            key: 'shared.syntaxError.missingOperator',
            params: {
              index: contextIndex + 1,
              length: 0
            }
          }
          return
        }
        const rightExpression = expressionString.substring(1)
        leftExpression = new Literal(expressionString[0])
        expressionString = rightExpression
        continue
      }
      // Parenthesis
      if (expressionString[0] === '(') {
        if (leftExpression !== null) {
          this.error = {
            message: 'Missing operator',
            key: 'shared.syntaxError.missingOperator',
            params: {
              index: contextIndex + 1,
              length: 0
            }
          }
          return
        }
        let i = 1
        let numLeft = 1
        while (numLeft > 0) {
          if (i > expressionString.length) {
            this.error = {
              message: 'Missing closing parenthesis',
              key: 'shared.syntaxError.missingClose',
              params: {
                index: contextIndex,
                length: 1
              }
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
        if (i === 2) {
          this.error = {
            message: 'Empty parentheses',
            key: 'shared.syntaxError.emptyParentheses',
            params: {
              index: contextIndex,
              length: 0
            }
          }
          return
        }
        leftExpression = new ParenthesisGroup(this.parse(expressionString.substring(1, i - 1), contextIndex + 1))
        expressionString = expressionString.substring(i)
        continue
      }
      // Error
      this.error = {
        message: 'Unexpected character',
        key: 'shared.syntaxError.unexpectedChar',
        params: {
          index: contextIndex,
          length: 1
        }
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
            key: 'shared.syntaxError.missingClose',
            params: {
              index: contextIndex + 1,
              length: 1
            }
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
      if (i === 2) {
        this.error = {
          message: 'Empty parentheses',
          key: 'shared.syntaxError.emptyParentheses',
          params: {
            index: contextIndex + 2,
            length: 0
          }
        }
        return {
          exp: null,
          tailString: ''
        }
      }

      return {
        exp: new ParenthesisGroup(this.parse(expressionString.substring(1, i - 1), contextIndex + 1)),
        tailString: expressionString.substring(i)
      }
    }
    this.error = {
      message: 'Missing operand',
      key: 'shared.syntaxError.missingOperand',
      params: {
        index: contextIndex + 1,
        length: 0
      }
    }
    return {
      exp: null,
      tailString: ''
    }
  }
}
