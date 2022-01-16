import katex from 'katex'

function kt (string) {
  return katex.renderToString(string, {
    throwOnError: false
  })
}

class Expression {
  constructor () {
    this.depth = 1
  }

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
  constructor (parenthesisLeft, parenthesisRight, expression) {
    super()
    this.expression = expression
    this.parenthesisLeft = parenthesisLeft
    this.parenthesisRight = parenthesisRight
    this.setDepth(this.depth)
  }

  printUnicode () {
    return `${this.parenthesisLeft}${this.expression.printUnicode()}${this.parenthesisRight}`
  }

  printSubStyled () {
    return `${this.parenthesisLeft}${this.expression.printStyled()}${this.parenthesisRight}`
  }

  length () {
    if (this.expression === undefined) {
      return 2
    }
    return 2 + this.expression.length()
  }

  setDepth (depth) {
    this.depth = depth
    if (this.expression !== undefined) {
      this.expression.setDepth(this.depth + 1)
    }
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

  setDepth (depth) {
    this.depth = depth
  }
}

export class UnaryOperator extends Expression {
  constructor (operator, expression) {
    super()
    this.operator = operator
    this.expression = expression
    this.setDepth(this.depth)
  }

  printUnicode () {
    return `${this.operator}${this.expression.printUnicode()}`
  }

  printSubStyled () {
    return `${this.operator}${this.expression.printStyled()}`
  }

  length () {
    return this.operator.length + this.expression.length()
  }

  setDepth (depth) {
    this.depth = depth
    if (this.expression !== null) {
      this.expression.setDepth(this.depth + 1)
    }
  }
}

export class BinaryOperator extends Expression {
  constructor (operator, lhe, rhe) {
    super()
    this.operator = operator
    this.lhe = lhe
    this.rhe = rhe
    this.setDepth(this.depth)
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

  setDepth (depth) {
    this.depth = depth
    if (this.lhe !== null) {
      this.lhe.setDepth(this.depth + 1)
    }
    if (this.rhe !== null) {
      this.rhe.setDepth(this.depth + 1)
    }
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

export class TernaryOperator extends Expression {
  constructor (operator, e1, e2, e3) {
    super()
    this.operator = operator
    this.e1 = e1
    this.e2 = e2
    this.e3 = e3
    this.setDepth(this.depth)
  }

  setDepth (depth) {
    this.depth = depth
    if (this.e1 !== null) {
      this.e1.setDepth(this.depth + 1)
    }
    if (this.e2 !== null) {
      this.e2.setDepth(this.depth + 1)
    }
    if (this.e3 !== null) {
      this.e3.setDepth(this.depth + 1)
    }
  }

  printUnicode () {
    return `${this.operator.o1}${this.e1.printUnicode()}${this.operator.o2}${this.e2.printUnicode()}${this.operator.o3}${this.e3.printUnicode()}`
  }

  printSubStyled () {
    return `${this.operator.o1}${this.e1.printStyled()}${this.operator.o2}${this.e2.printStyled()}${this.operator.o3}${this.e3.printStyled()}`
  }

  length () {
    return 3 + this.e1.length() + this.e2.length() + this.e3.length()
  }
}

class FlattenedSummation extends Expression {
  constructor (operator, expressions) {
    super()
    this.operator = operator
    this.expressions = expressions
    this.setDepth(this.depth)
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

  setDepth (depth) {
    this.depth = depth
    for (const expression of this.expressions) {
      expression.setDepth(this.depth + 1)
    }
  }
}
const baseOptions = {
  unaryOperators: [],
  binaryOperators: [],
  ternaryOperators: [],
  implicitAssociativeBinaryOperators: [],
  firstOrderOperators: [],
  implicitPrecendence: [],
  literals: [],
  leftParentheses: ['('], // Index must match the right parenthesis
  rightParentheses: [')']
}

function matchesStart (options, string) {
  // See if the start of string matches one of the strings in options. This allows operators with multiple characters
  for (const option of options) {
    if (option === string.substring(0, option.length)) {
      return string.substring(0, option.length)
    }
  }
  return null
}

export class Formula {
  constructor (formula, options) {
    this.options = Object.assign({}, baseOptions, options)
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
      if (matchesStart(this.options.unaryOperators, expressionString) !== null) {
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
        const op = matchesStart(this.options.unaryOperators, expressionString)
        const unaryExpression = this.findFirstExpression(expressionString.substring(op.length), contextIndex + op.length)
        leftExpression = new UnaryOperator(op, unaryExpression.exp)
        expressionString = unaryExpression.tailString
        continue
      }
      // Binary
      if (this.options.binaryOperators.includes(expressionString[0])) {
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
          const lho = leftExpression.operator
          const rho = expressionString[0]
          if (this.options.implicitPrecendence.some(e => e.weak === rho && e.strong === lho)) {
            const rightExpression = this.findFirstExpression(expressionString.substring(1), contextIndex + 1)
            leftExpression.rhe = new BinaryOperator(expressionString[0], leftExpression.rhe, rightExpression.exp)
            expressionString = rightExpression.tailString
            continue
          }
          if (this.options.implicitPrecendence.some(e => e.strong === rho && e.weak === lho)) {
            const rightExpression = this.findFirstExpression(expressionString.substring(1), contextIndex + 1)
            leftExpression = new BinaryOperator(expressionString[0], leftExpression, rightExpression.exp)
            expressionString = rightExpression.tailString
            continue
          }
          if (lho !== rho || !this.options.implicitAssociativeBinaryOperators.includes(rho)) {
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
          if (lho !== rho && this.options.firstOrderOperators.includes(expressionString[0])) {
            this.error = {
              message: 'Operator out of order',
              key: 'shared.syntaxError.nestedFirstOrderOperator',
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
      // Ternary
      if (this.options.ternaryOperators.map(x => x.o1).includes(expressionString[0])) {
        const operator = this.options.ternaryOperators[this.options.ternaryOperators.map(x => x.o1).indexOf(expressionString[0])]
        if (!this.options.literals.includes(expressionString[1])) {
          this.error = {
            message: 'Invalid operand',
            key: 'shared.syntaxError.invalidOperand',
            params: {
              index: contextIndex+1,
              length: 0
            }
          }
          return
        }
        if (expressionString[2] !== operator.o2) {
          this.error = {
            message: 'Missing operator',
            key: 'shared.syntaxError.missingOperator',
            params: {
              index: contextIndex+2,
              length: 0
            }
          }
          return
        }
        if (!this.options.literals.includes(expressionString[3])) {
          this.error = {
            message: 'Invalid operand',
            key: 'shared.syntaxError.invalidOperand',
            params: {
              index: contextIndex+3,
              length: 0
            }
          }
          return
        }
        if (expressionString[4] !== operator.o3) {
          this.error = {
            message: 'Missing operator',
            key: 'shared.syntaxError.missingOperator',
            params: {
              index: contextIndex+4,
              length: 0
            }
          }
          return
        }
        const e1 = new Literal(expressionString[1])
        const e2 = new Literal(expressionString[3])
        const e3 = this.findFirstExpression(expressionString.substring(5), contextIndex + 5)
        leftExpression = new TernaryOperator(operator, e1, e2, e3.exp)
        expressionString = e3.tailString
        continue
      }

      // Literal
      if (this.options.literals.includes(expressionString[0])) {
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
      if (this.options.leftParentheses.includes(expressionString[0])) {
        const leftParenthesis = expressionString[0]
        const rightParenthesis = this.options.rightParentheses[this.options.leftParentheses.indexOf(leftParenthesis)]
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
          if (expressionString[i] === leftParenthesis) {
            numLeft += 1
          }
          if (expressionString[i] === rightParenthesis) {
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
        leftExpression = new ParenthesisGroup(leftParenthesis, rightParenthesis, this.parse(expressionString.substring(1, i - 1), contextIndex))
        if (leftExpression.expression instanceof BinaryOperator && this.options.firstOrderOperators.includes(leftExpression.expression.operator)) {
          this.error = {
            message: 'Operator out of order',
            key: 'shared.syntaxError.nestedFirstOrderOperator',
            params: {
              index: contextIndex + leftExpression.expression.lhe.length() + 1,
              length: 1
            }
          }
          return
        }
        expressionString = expressionString.substring(i)
        continue
      }
      // Parenthesis
      if (this.options.rightParentheses.includes(expressionString[0])) {
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
    // Unary
    if (matchesStart(this.options.unaryOperators, expressionString) !== null) {
      const op = matchesStart(this.options.unaryOperators, expressionString)
      const unaryExpression = this.findFirstExpression(expressionString.substring(op.length), contextIndex + op.length)
      const leftExpression = new UnaryOperator(op, unaryExpression.exp)

      return {
        exp: leftExpression,
        tailString: unaryExpression.tailString
      }
    }

    // Literals
    if (this.options.literals.includes(expressionString[0])) {
      return {
        exp: new Literal(expressionString[0]),
        tailString: expressionString.substring(1)
      }
    }

    // Ternary
    if (this.options.ternaryOperators.map(x => x.o1).includes(expressionString[0])) {
      const operator = this.options.ternaryOperators[this.options.ternaryOperators.map(x => x.o1).indexOf(expressionString[0])]
      if (!this.options.literals.includes(expressionString[1])) {
        this.error = {
          message: 'Invalid operand',
          key: 'shared.syntaxError.invalidOperand',
          params: {
            index: contextIndex+1,
            length: 0
          }
        }
        return {
          exp: null,
          tailString: ''
        }
      }
      if (expressionString[2] !== operator.o2) {
        this.error = {
          message: 'Missing operator',
          key: 'shared.syntaxError.missingOperator',
          params: {
            index: contextIndex+2,
            length: 0
          }
        }
        return {
          exp: null,
          tailString: ''
        }
      }
      if (!this.options.literals.includes(expressionString[3])) {
        this.error = {
          message: 'Invalid operand',
          key: 'shared.syntaxError.invalidOperand',
          params: {
            index: contextIndex+3,
            length: 0
          }
        }
        return {
          exp: null,
          tailString: ''
        }
      }
      if (expressionString[4] !== operator.o3) {
        this.error = {
          message: 'Missing operator',
          key: 'shared.syntaxError.missingOperator',
          params: {
            index: contextIndex+4,
            length: 0
          }
        }
        return {
          exp: null,
          tailString: ''
        }
      }
      const e1 = new Literal(expressionString[1])
      const e2 = new Literal(expressionString[3])
      const e3 = this.findFirstExpression(expressionString.substring(5), contextIndex + 5)
      return {
        exp: new TernaryOperator(operator, e1, e2, e3.exp),
        tailString: e3.tailString
      }
    }

    // Parenthesis
    if (this.options.leftParentheses.includes(expressionString[0])) {
      const leftParenthesis = expressionString[0]
      const rightParenthesis = this.options.rightParentheses[this.options.leftParentheses.indexOf(leftParenthesis)]
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
        if (expressionString[i] === leftParenthesis) {
          numLeft += 1
        }
        if (expressionString[i] === rightParenthesis) {
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
      const parenthesisContents = this.parse(expressionString.substring(1, i - 1), contextIndex)
      if (parenthesisContents instanceof BinaryOperator && this.options.firstOrderOperators.includes(parenthesisContents.operator)) {
        this.error = {
          message: 'Operator out of order',
          key: 'shared.syntaxError.nestedFirstOrderOperator',
          params: {
            index: contextIndex + parenthesisContents.lhe.length() + 1,
            length: 1
          }
        }
        return {
          exp: null,
          tailString: ''
        }
      }

      return {
        exp: new ParenthesisGroup(leftParenthesis, rightParenthesis, parenthesisContents),
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
