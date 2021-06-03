import katex from 'katex'

function kt (string) {
  return katex.renderToString(string, {
    throwOnError: false
  })
}

class Expression {
  printStyled () {
    if (this.style !== undefined) {
      return `<span class='${this.style}'>${this.printUnicode()}</span>`
    }
    return this.printSubStyled()
  }

  printKatexStyled () {
    const string = this.printStyled()

    const index1 = string.indexOf('<span')
    if (index1 === -1) {
      return kt(string)
    }
    const index2 = string.indexOf('\'>', index1)
    const index3 = string.indexOf('</span>', index2)
    return `${kt(string.substring(0, index1))}<span class='${this.style}'>${kt(string.substring(index2 + 2, index3))}</span>${kt(string.substring(index3 + 7))}`
  }
}

export class ParenthesisGroup extends Expression {
  constructor (expression) {
    super()
    this.expression = expression
  }

  printUnicode () {
    return `(${this.expression.printUnicode()})`
  }

  printSubStyled () {
    return `(${this.expression.printStyled()})`
  }

  length () {
    if (this.expression === undefined) {
      return 2
    }
    return 2 + this.expression.length()
  }
}

export class Literal extends Expression {
  constructor (expression) {
    super()
    this.expression = expression
  }

  printUnicode () {
    return `${this.expression}`
  }

  printSubStyled () {
    return `${this.expression}`
  }

  length () {
    return 1
  }
}

export class UnaryOperator extends Expression {
  constructor (operator, expression) {
    super()
    this.operator = operator
    this.expression = expression
  }

  printUnicode () {
    return `${this.operator}${this.expression.printUnicode()}`
  }

  printSubStyled () {
    return `${this.operator}${this.expression.printStyled()}`
  }

  length () {
    return 1 + this.expression.length()
  }
}

export class BinaryOperator extends Expression {
  constructor (operator, lhe, rhe) {
    super()
    this.operator = operator
    this.lhe = lhe
    this.rhe = rhe
  }

  flatten () {
    const expressions = []
    let leftExp = this.lhe
    expressions.push(this.rhe)
    while (leftExp instanceof BinaryOperator) {
      if (leftExp.operator === this.operator) {
        expressions.unshift(leftExp.rhe)
      } else {
        break
      }
      leftExp = leftExp.lhe
    }
    expressions.unshift(leftExp)

    return new FlattenedSummation(this.operator, expressions)
  }

  printUnicode () {
    return `${this.lhe.printUnicode()}${this.operator}${this.rhe.printUnicode()}`
  }

  printSubStyled () {
    return `${this.lhe.printStyled()}${this.operator}${this.rhe.printStyled()}`
  }

  length () {
    if (this.rhe !== null) {
      return 1 + this.lhe.length() + this.rhe.length()
    }
    return 1 + this.lhe.length()
  }
}

class FlattenedSummation extends Expression {
  constructor (operator, expressions) {
    super()
    this.operator = operator
    this.expressions = expressions
  }

  printUnicode () {
    const exp = this.expressions.map(e => e.printUnicode())
    const reducer = (accumulator, currentValue) => `${accumulator}${this.operator}${currentValue}`
    return exp.reduce(reducer)
  }

  printSubStyled () {
    const exp = this.expressions.map(e => e.printStyled())
    const reducer = (accumulator, currentValue) => `${accumulator}${this.operator}${currentValue}`
    return exp.reduce(reducer)
  }

  printStyled () {
    if (this.style !== undefined) {
      const exp = this.expressions.map(e => e.printUnicode())
      const reducer = (accumulator, currentValue, currentIndex) => {
        if (currentIndex === this.firstDifferenceIndex && currentIndex === this.lastDifferenceIndex) {
          return `${accumulator}${this.operator}${this.expressions[currentIndex].printStyled()}`
        } else if (currentIndex === this.firstDifferenceIndex) {
          return `${accumulator}${this.operator}<span class='${this.style}'>${currentValue}`
        } else if (currentIndex === this.lastDifferenceIndex) {
          return `${accumulator}${this.operator}${currentValue}</span>`
        } else {
          return `${accumulator}${this.operator}${currentValue}`
        }
      }
      if (this.firstDifferenceIndex === 0) {
        if (this.lastDifferenceIndex === 0) {
          exp[0] = this.expressions[0].printStyled()
        } else {
          exp[0] = `<span class='${this.style}'>${exp[0]}`
        }
      }
      return exp.reduce(reducer)
    }
    return this.printSubStyled()
  }
}

const unaryOperators = ['¬']
const binaryOperators = ['∧', '∨', '→', '↔', ',']
const implicitAssociativeBinaryOperators = ['∧', '∨']
const literals = ['p', 'q', 'r', 's', 'T', 'F']

export class Formula {
  constructor (formula) {
    this.error = null
    this.result = this.parse(formula, 0)
  }

  parse (expressionString, givenContextIndex) {
    let leftExpression = null
    let contextIndex = null

    while (expressionString && expressionString.length > 0 && this.error === null) {
      if (leftExpression === null) {
        contextIndex = givenContextIndex + 1
      } else {
        contextIndex = givenContextIndex + leftExpression.length() + 1
      }

      // Unary
      if (unaryOperators.includes(expressionString[0])) {
        if (leftExpression !== null) {
          this.error = {
            message: 'Missing operator',
            key: 'shared.syntaxError.missingOperator',
            params: {
              index: contextIndex,
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
                index: contextIndex,
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
              index: contextIndex,
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
              index: contextIndex,
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
        leftExpression = new ParenthesisGroup(this.parse(expressionString.substring(1, i - 1), contextIndex))
        expressionString = expressionString.substring(i)
        continue
      }
      // Parenthesis
      if (expressionString[0] === ')') {
        this.error = {
          message: 'Missing open parenthesis',
          key: 'shared.syntaxError.missingOpen',
          params: {
            index: contextIndex,
            length: 1
          }
        }
        return
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
    // Literals
    if (literals.includes(expressionString[0])) {
      return {
        exp: new Literal(expressionString[0]),
        tailString: expressionString.substring(1)
      }
    }

    // Unary
    if (unaryOperators.includes(expressionString[0])) {
      const unaryExpression = this.findFirstExpression(expressionString.substring(1), contextIndex + 1)
      const leftExpression = new UnaryOperator(expressionString[0], unaryExpression.exp)
      return {
        exp: leftExpression,
        tailString: unaryExpression.tailString
      }
    }

    // Parenthesis
    if (expressionString[0] === '(') {
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
            index: contextIndex + 1,
            length: 0
          }
        }
        return {
          exp: null,
          tailString: ''
        }
      }

      return {
        exp: new ParenthesisGroup(this.parse(expressionString.substring(1, i - 1), contextIndex)),
        tailString: expressionString.substring(i)
      }
    }
    this.error = {
      message: 'Missing operand',
      key: 'shared.syntaxError.missingOperand',
      params: {
        index: contextIndex,
        length: 0
      }
    }
    return {
      exp: null,
      tailString: ''
    }
  }
}
