export function showdiff (active, oldString, newString) {
  // alert(oldString);

  if (active) {
    // alert("Checking...");
    // onderzoek hoeveel tekens er aan het begin van de string gelijk zijn
    let i = 0
    let equalHead = 0
    while ((i < oldString.length) && (oldString.charAt(i) === newString.charAt(i))) {
      equalHead++
      i++
    }

    // alert(equalHead);

    // onderzoek hoeveel tekens er aan het eind van de string gelijk zijn
    i = oldString.length - 1
    let j = newString.length - 1
    let equalTail = 0
    while ((i > 0) && (oldString.charAt(i) === newString.charAt(j))) {
      equalTail++
      i--
      j--
    }

    // alert(equalTail);

    let s = ''

    // als er aan het begin tekens gelijk zijn zetten we die in s
    if (equalHead > 0) {
      s = oldString.substr(0, equalHead)
    }

    // zet nu een kleuraccent
    s = s + "<font color='red'>"

    // kopieer het veranderde tussenstuk
    s = s + oldString.substr(equalHead, oldString.length - equalHead - equalTail)

    // zet nu een kleuraccent
    s = s + '</font>'

    // zet nu het deel van de overeenkomstige staart erbij
    if (equalTail > 0) {
      s = s + oldString.substr(oldString.length - equalTail, equalTail)
    }
    return s
  } else {
    // als showdiff niet actief is, wordt de oude tekst teruggegeven
    return oldString
  }
}
