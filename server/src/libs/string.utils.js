export const romanToArabic = (text) => {
  const romanNumerals = {
    'I': 1,
    'II': 2,
    'III': 3,
    'IV': 4,
    'V': 5,
    'VI': 6,
    'VII': 7,
    'VIII': 8,
    'IX': 9,
    'X': 10
  };

  // Only last letter uppercase to match keys
  const words = text.split(' ');
  if (words.length === 0) return text;
  
  const lastWord = words[words.length - 1].toUpperCase();
  if (romanNumerals[lastWord]) {
    words[words.length - 1] = romanNumerals[lastWord].toString();
  }

  return words.join(' ');
}

const stripPunctuationToSpaces = (text) =>
  String(text || "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()

export const IDontLikeTildesAnymore = (text) => {
  const accentsMap = {
    'á': 'a',
    'é': 'e',
    'í': 'i',
    'ó': 'o',
    'ú': 'u',
    'Á': 'A',
    'É': 'E',
    'Í': 'I',
    'Ó': 'O',
    'Ú': 'U'
  };

  return text.split('').map(char => accentsMap[char] || char).join('');
}

export const formatSubjectName = (name) => {
  let formattedName = String(name || "").toLowerCase()
  // Important: strip punctuation BEFORE roman conversion so inputs like "S.I" become "s i".
  formattedName = stripPunctuationToSpaces(formattedName)
  formattedName = romanToArabic(formattedName)
  formattedName = IDontLikeTildesAnymore(formattedName)
  formattedName = formattedName.replace(/\s+/g, " ").trim()
  return formattedName
}