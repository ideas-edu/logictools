import { describe, it } from 'mocha'
import { assert } from 'chai'
import { readFileSync, readdirSync } from 'fs'

const langDir = './src/lang/'
const langs = []
// Find all language files in lang directory
readdirSync(langDir).forEach(file => {
  if (file.split('.')[1] === 'json') {
    langs.push(file.split('.')[0])
  }
})

function compareKeys (dictA, dictB) {
  if (dictA.constructor !== Object && dictB.constructor !== Object) {
    return { similar: true }
  }

  for (const key in dictA) {
    if (Object.prototype.hasOwnProperty.call(dictB, key)) {
      const result = compareKeys(dictA[key], dictB[key])
      if (result.similar) {
        continue
      } else {
        return { similar: false, errorKey: `${key}.${result.errorKey}` }
      }
    } else {
      return { similar: false, errorKey: `${key}` }
    }
  }
  return { similar: true }
}

function getTranslateKeys (object, prefix) {
  const keys = []
  for (const key in object) {
    const prefixedKey = prefix ? `${prefix}.${key}` : key
    switch (object[key].constructor) {
      case Boolean:
      case Number:
      case Array:
        keys.push({ prefixedKey, key, value: object[key], invalid: true })
        break
      case String:
        keys.push({ prefixedKey, key })
        break
      default:
        keys.push({ prefixedKey, key })
        keys.push(...getTranslateKeys(object[key], prefixedKey))
        break
    }
  }
  return keys
}

describe('language', function () {
  for (const lang of langs) {
    // Run these tests for each language
    describe(`valid ${lang}`, function () {
      it('JSON is valid', function () {
        const langFile = readFileSync(`${langDir}${lang}.json`, 'utf8')
        JSON.parse(langFile)
        assert(true)
      })

      it('Only strings', function () {
        const langFile = readFileSync(`${langDir}${lang}.json`, 'utf8')
        const parsed = JSON.parse(langFile)
        const parsedKeys = getTranslateKeys(parsed)

        for (let i = 0; i < parsedKeys.length; i++) {
          assert(parsedKeys[i].invalid !== true, `Value of ${parsedKeys[i].prefixedKey} (${parsedKeys[i].value}) is invalid type`)
        }
      })

      it('Valid keys', function () {
        const langFile = readFileSync(`${langDir}${lang}.json`, 'utf8')
        const parsed = JSON.parse(langFile)
        const parsedKeys = getTranslateKeys(parsed)

        for (let i = 0; i < parsedKeys.length; i++) {
          assert(!parsedKeys[i].key.includes('.'), `Key ${parsedKeys[i].prefixedKey} is invalid (. character)`)
          assert(!parsedKeys[i].key.includes(' '), `Key ${parsedKeys[i].prefixedKey} is invalid (space character)`)
        }
      })

      it('No duplicate keys', function () {
        const langFile = readFileSync(`${langDir}${lang}.json`, 'utf8')
        const parsed = JSON.parse(langFile)
        const parsedKeys = getTranslateKeys(parsed)
        const fileKeys = langFile.match(/"([\w,-]*)":/g)
        for (let i = 0; i < fileKeys.length; i++) {
          assert(parsedKeys[i].key === fileKeys[i].slice(1, -2), `Key ${fileKeys[i].slice(1, -2)} (by ${parsedKeys[i].prefixedKey}) is duplicate`)
        }
      })

      it('Keys sorted', function () {
        const langFile = readFileSync(`${langDir}${lang}.json`, 'utf8')
        const parsed = JSON.parse(langFile)
        const parsedKeys = getTranslateKeys(parsed)
        for (let i = 1; i < parsedKeys.length; i++) {
          assert(parsedKeys[i].prefixedKey > parsedKeys[i - 1].prefixedKey, `Key ${i} ${parsedKeys[i].prefixedKey} is out of order`)
        }
      })
    })
  }

  describe('compare', function () {
    it('Similar keys', function () {
      const langDicts = []
      for (const lang of langs) {
        const langFile = readFileSync(`${langDir}${lang}.json`, 'utf8')
        langDicts.push(JSON.parse(langFile))
      }
      for (let i = 1; i < langs.length; i++) {
        let result = compareKeys(langDicts[0], langDicts[i])
        assert(result.similar, `Language ${langs[i]} is missing key '${result.errorKey}' found in ${langs[0]}`)
        result = compareKeys(langDicts[i], langDicts[0])
        assert(result.similar, `Language ${langs[0]} is missing key '${result.errorKey}' found in ${langs[i]}`)
      }
    })
  })
})
