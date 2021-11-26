import katex from 'katex'

/**
    Represents a one way step.
    @constructor
    @param {string} formulaText - The text of the formula.
    @param {string} rule - The rule that is used in this step.
    @property {string} formula The formula.
    @property {string} rule The applied rule.
 */
export class LogIndStep {
  constructor (_case, step, rule, relation, number, isTopStep) {
    this.case = _case
    this.setTerm(step)
    this.number = number
    if (relation === '<=') {
      this.relation = '≤'
    } else if (relation === '>=') {
      this.relation = '≥'
    } else {
      this.relation = relation
    }
    this.rule = rule
    this.isTopStep = isTopStep

    // Highlights
    this.highlightStep = false
    this.highlightTerm = false
    this.highlightRule = false
  }

  getPreviousStep () {
    return this.case.steps.find(step => step.number === this.number - 1)
  }

  getNextStep () {
    return this.case.steps.find(step => step.number === this.number + 1)
  }

  getAsciiRelation () {
    if (this.relation === '≤') {
      return '<='
    } else if (this.relation === '≥') {
      return '>='
    }
    return this.relation
  }

  unicodeToLatex (term) {
    // Give {, }, and \ a reserved characters. Replacing with setminus will conflict with 'min' function definition
    term = term.replaceAll('{', '@1 ')
    term = term.replaceAll('}', '@2 ')
    term = term.replaceAll('\\', '@3')

    for (const functionName of this.case.exercise.definitions.concat(['min', 'max'])) {
      term = term.replaceAll(functionName, `\\texttt{${functionName}}`)
    }

    term = term.replaceAll('@1', '\\{ ')
    term = term.replaceAll('@2', '\\} ')
    term = term.replaceAll('@3', '\\setminus ')

    term = term.replaceAll('∧', '\\land ')
    term = term.replaceAll('∨', '\\lor ')
    term = term.replaceAll('¬', '\\neg ')
    term = term.replaceAll('->', '\\rightarrow ')

    term = term.replaceAll('φ', '\\phi ')
    term = term.replaceAll('ψ', '\\psi ')
    term = term.replaceAll('χ', '\\chi ')

    return term
  }

  asciiToUnicode (term) {
    const DEFINITIONS = ['max', 'min', 'union', 'set', 'del', 'subst']
    term = convertH2M(term, this.case.exercise.definitions.concat(DEFINITIONS))

    term = term.replaceAll('&&', '∧')
    term = term.replaceAll('||', '∨')
    term = term.replaceAll('~', '¬')
    term = term.replaceAll('->', '→')

    term = term.replaceAll('phi', 'φ')
    term = term.replaceAll('psi', 'ψ')
    term = term.replaceAll('chi', 'χ')
    term = term.replaceAll('union', '∪')

    return term
  }

  unicodeToAscii (term) {
    term = term.replaceAll('∧', '&&')
    term = term.replaceAll('∨', '||')
    term = term.replaceAll('¬', '~')
    term = term.replaceAll('→', '->')

    term = term.replaceAll('φ', ' phi ')
    term = term.replaceAll('ψ', ' psi ')
    term = term.replaceAll('χ', ' chi ')
    term = term.replaceAll('∪', ' union ')
    term = term.replaceAll('\\', ' del ')

    const DEFINITIONS = ['max', 'min', 'union', 'set', 'del', 'subst']
    term = convertM2H(term, this.case.exercise.definitions.concat(DEFINITIONS))

    return term
  }

  setTerm (term) {
    console.log(term)
    this.term = this.asciiToUnicode(term)
    console.log(this.term)
    // This does not match the longest function
    const termAnnotated = this.unicodeToLatex(this.term)

    this.termKatex = katex.renderToString(termAnnotated, {
      throwOnError: false
    })
  }
}

/**
 *
 * @param {*} str
 * @param {*} definitions List of functionnames, e.q. val1, min
 */
export function convertH2M (str, definitions) {
  try {
    let pos = 0
    // walk linearly through str
    while (pos < str.length) { // terminal case when called recursively
      // check for functionname
      let currentFunctionName = ''
      for (let i = 0; i < definitions.length; i++) {
        if (str.substring(0, pos).endsWith(definitions[i] + ' ')) { // in Haskell space is function application
          currentFunctionName = definitions[i]
        }
      }
      if (currentFunctionName !== '') { // found functionname
        // search positions and lengths of param(s)
        pos = pos - currentFunctionName.length - 1 // to pos before functionname
        const startParam1 = pos + currentFunctionName.length + 1// + 1 because of Haskell space which is function application
        const lenParam1 = findLenHaskellParam(str.substring(startParam1))
        const param1 = str.substring(startParam1, startParam1 + lenParam1)
        let startParam2, lenParam2, param2
        switch (currentFunctionName) {
          case 'max':
          case 'min':
          case 'del':
          case 'subst':
          case 'union':
          case 'set':
            // then it has a second parameter after the first parameter
            startParam2 = startParam1 + lenParam1 + str.substring(startParam1 + lenParam1).search(/\S/) // ignore whitespace
            lenParam2 = findLenHaskellParam(str.substring(startParam2))
            param2 = str.substring(startParam2, startParam2 + lenParam2)
        }
        // convert functions
        let posNewFrom// waar straks verder
        let paramsStr
        switch (currentFunctionName) {
          case 'max':
            posNewFrom = startParam2 + lenParam2
            paramsStr = 'max(' + removeBrackets(convertH2M(param1, definitions)) + ',' + removeBrackets(convertH2M(param2, definitions)) + ')'
            break
          case 'min': // prefix binary function
            posNewFrom = startParam2 + lenParam2
            paramsStr = 'min(' + removeBrackets(convertH2M(param1, definitions)) + ',' + removeBrackets(convertH2M(param2, definitions)) + ')'
            break
          case 'set': // unary function
            if (param2 != ')' && startParam1 !== startParam2) {
              posNewFrom = startParam2 + lenParam2
              paramsStr = '{' + removeBrackets(convertH2M(param1, definitions)) + ',' + removeBrackets(convertH2M(param2, definitions)) + '}'
              break
            }
            posNewFrom = startParam1 + lenParam1
            paramsStr = '{' + removeBrackets(convertH2M(param1, definitions)) + '}'
            break
          case 'del': // infix binary function
            posNewFrom = startParam2 + lenParam2
            paramsStr = addBracketsIfNeeded(removeBracketsIfPossible(convertH2M(param2, definitions))) + ' ' + '\\' + ' ' + removeBrackets(convertH2M(param1, definitions))
            break
          case 'union': // infix binary function
            posNewFrom = startParam2 + lenParam2
            paramsStr = removeBrackets(convertH2M(param1, definitions)) + ' ' + currentFunctionName + ' ' + removeBrackets(convertH2M(param2, definitions))
            break
          case 'subst': // infix binary function with '[]', i.e. subst t x' converts to '[t/x]'
            posNewFrom = startParam2 + lenParam2
            paramsStr = '[' + removeBrackets(convertH2M(param1, definitions)) + '/' + removeBrackets(convertH2M(param2, definitions)) + ']'
            break
          default: // prefix unary function, not mentioned in specification 'Symbolenlijst pdf'
            posNewFrom = startParam1 + lenParam1
            paramsStr = currentFunctionName + '(' + removeBrackets(convertH2M(param1, definitions)) + ')'
        }
        str = str.substring(0, pos) + paramsStr + str.substring(posNewFrom, str.length)
        // at this point pos is still after function name
        pos += paramsStr.length
      }
      pos++
    }
    if (typeof str !== 'string') {
      console.log('very bad!')
    }
    // str = str.replace(/\s+/g, '') // remove whitespace
    return str
  } catch (err) {
    // geeft undefined ?
    console.log(err.name + ': ' + err.message)
    throw new Error(err.message)
  }
}

/**
 * Find the length of the parameter of a function in Haskell notation
 * @param {*} str parameter, wether or not between brackets
 */
function findLenHaskellParam (str) {
  let pos = 0
  if (str.charAt(pos) === '(') { // param enclosed with ()
    // search pairing ')'
    let count = 1
    do {
      pos++
      if (pos > str.length) throw new Error("No matching ')' found")
      if (str.charAt(pos) === '(') count++
      if (str.charAt(pos) === ')') count--
    } while (count > 0)
  } else { // param not enclosed with ()
    const posTo = str.substring(pos).search(/\W/) // for example '+' or ' '
    if (posTo > 0) { // not at end
      pos += posTo - 1
    } else {
      pos = str.length - 1
    }
  }
  return pos + 1
}

function addBracketsIfNeeded (str) {
  if ((str.charAt(0) !== '(') && (str.charAt(0) !== '{')) {
    // eslint-disable-next-line no-useless-escape
    if (/[\u222a\+\&\|\<\=\>\*\~\-\ ]/.test(str)) str = addBrackets(str.trim())
  }
  return str
}

function addBrackets (str) {
  // if param contains non-word characters (i.e. '+') then surround the whole param with brackets
  str = '(' + str + ')'
  return str
}

function removeBrackets (str) {
  if (str.startsWith('(')) {
    if (str.charAt(str.length - 1) !== ')') throw new Error("No matching ')' found in " + str)
    str = str.substring(1, str.length - 1)
  }
  return str
}

function removeBracketsIfPossible (str) {
  if (isSurroundedByBrackets(str)) {
    str = removeBrackets(str)
  }
  return str
}

function isSurroundedByBrackets (str) {
  let result = false
  if (str !== '') {
    if ((str.charAt(0) === '(') && (str.charAt(str.length - 1) === ')')) {
      let pos = 1 // first char is '('
      let count = 0
      let possible = true
      while (pos <= str.length - 2) { // skip first and last bracket
        if (str.charAt(pos) === '(') count++
        if (str.charAt(pos) === ')') count--
        if (count < 0) possible = false
        pos++
      }
      if ((possible) && (count === 0)) {
        result = true
      }
    }
  }
  return result
}

export function convertM2H (str, definitions) {
  try {
    str = unicodeToHaskell(str)
    str = addBracketsAroundUnionParameters(str)
    let term = ''
    let previousTerm = ''
    let nonTerm = '' // infix operator
    let currentFunctionName = ''
    let previousFunctionName = ''
    let lenParam1, lenParam2
    let param1, param2
    let startTerm
    let lenTerm
    let newStr = '' // The converted formula
    let temp
    let pos = 0 // Start position of parameter or functionname.
    let reResult // reqular expression result
    while (pos < str.length) {
      // get term or infix operator
      term = ''
      nonTerm = ''
      lenTerm = findLenTerm(str.substring(pos))
      if (lenTerm > 0) { // look for term
        startTerm = pos
        pos += lenTerm
        term = str.substring(startTerm, startTerm + lenTerm)
      } else { // look for nonterm
        // eslint-disable-next-line no-useless-escape
        reResult = /^[\+\&\|\<\=\>\*\~\-\ ]*/.exec(str.substring(pos))[0] // no brackets
        pos += reResult.length
        nonTerm = reResult // keep space
      }
      // analyze term
      // set
      if (term !== '') {
        if (/^\{/.test(term)) {
          term = removeCurlyBrackets(term)
          term = 'set ' + term.replaceAll(',', ' ')
        }
      }
      // subst
      if (term !== '') {
        if (/^\[/.test(term)) {
          term = removeSquareBrackets(term)
          term = term.replace('/', ' ')
          term = 'subst ' + term + ' '
        }
      }
      if (currentFunctionName === '') {
        currentFunctionName = findFunctionNameInFormula(term, definitions)
        if (currentFunctionName !== '') {
          term = ''
        }
      }
      if (currentFunctionName === 'union') {
        previousFunctionName = 'union'
        currentFunctionName = ''
      }
      if (currentFunctionName === 'del') {
        previousFunctionName = 'del'
        currentFunctionName = ''
      }
      // build newStr
      if (term !== '') {
        if (currentFunctionName !== '') {
          switch (currentFunctionName) {
            case 'min':
            case 'max':
              temp = currentFunctionName
              lenParam1 = findLenMathParamLeftOfComma(term.substring(1)) // skip '('
              lenParam2 = findLenMathParamRightOfComma(term.substring(1 + lenParam1 + 1)) // skip '(' and ','
              param1 = term.substring(1, lenParam1 + 1)
              param2 = term.substring(1 + lenParam1 + 1, 1 + lenParam1 + 1 + lenParam2)
              param1 = recursiveConvertM2H(param1.trim(), definitions)
              param2 = recursiveConvertM2H(param2.trim(), definitions)
              param1 = addBracketsIfNeeded(param1)
              param2 = addBracketsIfNeeded(param2)
              temp += ' ' + param1
              temp += ' ' + param2
              term = temp
              break
            case 'subst':
              // throw new Error('!! subst in h2m bereikt!') // deze is hier overbodig denk ik
              temp = currentFunctionName + ' ' + recursiveConvertM2H(term.trim(), definitions)
              term = temp
              break
            default:
              temp = currentFunctionName + ' ' + recursiveConvertM2H(term.trim(), definitions)
              term = temp
          }
          currentFunctionName = ''
        } else if (isSurroundedByBrackets(term)) {
          term = addBracketsIfNeeded(convertM2H(removeBracketsIfPossible(term), definitions))
        }
      }
      // del (reversed params)
      if (term !== '') {
        if (previousFunctionName === 'del') {
          temp = previousFunctionName
          temp += ' ' + addBracketsIfNeeded(recursiveConvertM2H(term.trim(), definitions))
          temp += ' ' + addBracketsIfNeeded(recursiveConvertM2H(previousTerm.trim(), definitions))
          term = temp
          previousTerm = ''
          previousFunctionName = ''
        }
      }
      // union
      if (term !== '') {
        if (previousFunctionName === 'union') {
          temp = previousFunctionName
          temp += ' ' + addBracketsIfNeeded(recursiveConvertM2H(previousTerm.trim(), definitions))
          temp += ' ' + addBracketsIfNeeded(recursiveConvertM2H(term.trim(), definitions))
          term = temp
          previousTerm = ''
          previousFunctionName = ''
        }
      }
      previousTerm += term + nonTerm
      if ((nonTerm.trim() !== '') || (pos === str.length)) {
        newStr += previousTerm
        previousTerm = ''
      }
    }
    newStr = newStr.replace('  ', ' ')
    newStr = newStr.replace('  ', ' ')
    newStr = newStr.replace(' && ', '&&')
    newStr = newStr.replace('&& ', '&&')
    return newStr
  } catch (err) {
    console.log(err.name + ': ' + err.message)
    throw new Error(err.message)
  }
}

/**
 * Converts unicode to Haskell notation.
 * @param {*} str A string.
 */
function unicodeToHaskell (str) {
  // let symbols = []
  // for (let i = 0; i < symbols.length; i++) {
  //   try {
  //     switch (symbols[i][1]) {
  //       case 'or':
  //         str = str.replace(new RegExp('\u2228', 'g'), '||');
  //         break;
  //       case 'del':
  //         str = str.replace(new RegExp('\\\\', 'g'), ' ' + symbols[i][2] + ' ');
  //         break;
  //       case 'union':
  //         str = str.replace(new RegExp('\u222a', 'g'), ' ' + symbols[i][2] + ' ');
  //         break;
  //       default:
  //         str = str.replace(new RegExp(symbols[i][0], 'g'), symbols[i][2]);
  //     }
  //   } catch (err) {
  //     console.log(err.message);
  //     console.log(typeof str);
  //   }
  // }
  return str
}

/**
 * Add brackets to parameters of union, to prevent incorrect conversion in a formula with 'del' in the parameter(s).
 * @param {*} str Formula in math notation with union converted to symbolnames, e.q. 'p union q'.
 */
function addBracketsAroundUnionParameters (str) {
  let newStr = str
  if (/ union /.test(str)) { // quick check to prevent unneeded processing
    newStr = ''
    let pos = 0 // position in formula string
    let previousPos = 0
    let count = 0 // count unbalanced brackets
    // Build a list with positions of 'union ' substrings.
    const re = / union /g
    const result = []
    let i = 0
    // Find successive matches
    while (re.exec(str) !== null) {
      result.push(re.lastIndex - ' union '.length)
    }
    while (pos < str.length) {
      if (str.charAt(pos) === '(') count++
      if (str.charAt(pos) === ')') count--
      if (pos === result[i]) {
        if (count === 0) {
          newStr += '(' + str.substring(previousPos, pos) + ')' + ' union '
          pos = pos + ' union '.length
          previousPos = pos
        }
        if (i < result.length - 1) i++ // loopt onnodig rest van string uit
      }
      pos++
    }
    if (previousPos !== 0) { // after union add brackets to parameter
      newStr += '(' + str.substring(previousPos, str.length) + ')' // rest of string
    } else { // there was no union outside brackets
      newStr = str
    }
  }
  return newStr
}

/**
 * Find length of term between brackets
 * @param {*} str Term
 * @param {*} openingBracket '(' or '{' or '['
 * @param {*} closingBracket ')' or '}' or ']'
 */
function findLenTermInBrackets (str, openingBracket, closingBracket) {
  let pos = 0
  let count = 0
  do {
    if (str.charAt(pos) === openingBracket) count++
    if (str.charAt(pos) === closingBracket) count--
    pos++
    if (pos > str.length) throw new Error('No ' + closingBracket + ' found')
  } while (count > 0)
  return pos
}

/**
 * Find length of term not between brackets
 * @param {*} str Term
 */
function findLenTermNotInBrackets (str) {
  let len = 0
  const reResult = /^\w+/.exec(str)
  if (reResult !== null) len = reResult[0].length
  return len
}

/**
 * Find the length of the parameter in the string starting at position 0.
 * @param {*} str
 */
function findLenTerm (str) {
  let len = 0
  switch (str.charAt(0)) {
    case '(':
      len = findLenTermInBrackets(str, '(', ')')
      break
    case '{':
      len = findLenTermInBrackets(str, '{', '}')
      break
    case '[':
      len = findLenTermInBrackets(str, '[', ']')
      break
    default: // no brackets
      len = findLenTermNotInBrackets(str)
  }
  return len
}

function findFunctionNameInFormula (str, definitions) {
  let currentFunctionName = ''
  for (let i = 0; i < definitions.length; i++) {
    if (definitions[i] === str) {
      currentFunctionName = str
      break
    }
  }
  return currentFunctionName
}

function recursiveConvertM2H (str, definitions) {
  if (/\(/.test(str)) {
    str = addBracketsIfNeeded(convertM2H(removeBracketsIfPossible(str), definitions))
  }
  // str = convertM2H(str, definitions);
  return str
}

function removeCurlyBrackets (str) {
  if (str.startsWith('{')) {
    if (str.charAt(str.length - 1) !== '}') throw new Error("No matching '}' found")
    str = str.substring(1, str.length - 1)
  }
  return str
}

function removeSquareBrackets (str) {
  if (str.startsWith('[')) {
    if (str.charAt(str.length - 1) !== ']') throw new Error("No matching ']' found")
    str = str.substring(1, str.length - 1)
  }
  return str
}

/**
 * Finds the length of the parameter left of the comma in math notation for max() and min()
 * @param {} str function parameter
 */
function findLenMathParamLeftOfComma (str) {
  let pos = 0
  let count = 0
  do {
    if (str.charAt(pos) === '(') count++
    if (str.charAt(pos) === ')') count--
    pos++
    if (pos > str.length) throw new Error("No ',' found")
  } while ((count > 0) || (str.charAt(pos) !== ','))
  return pos
}

/**
 * Finds the length of the parameter right of the comma in math notation for max() and min()
 * @param {*} str function parameter
 */
function findLenMathParamRightOfComma (str) {
  let pos = 0
  let count = 1
  do {
    if (str.charAt(pos) === '(') count++
    if (str.charAt(pos) === ')') count--
    pos++
    if (pos > str.length) throw new Error("No matching ')' found")
  } while (count > 0)
  return pos - 1
}
