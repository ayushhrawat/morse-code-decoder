import { morseMap, reverseMorseMap } from './morseMap.js';

export const textToMorse = (text) => {
  const errors = [];
  const morseChars = [];
  
  const upperText = text.toUpperCase();
  
  for (let i = 0; i < upperText.length; i++) {
    const char = upperText[i];
    
    if (char === ' ') {
      morseChars.push('/');
      continue;
    }
    
    if (morseMap[char]) {
      morseChars.push(morseMap[char]);
    } else if (char.trim() !== '') {
      errors.push(`Unsupported: "${char}"`);
    }
  }
  
  const validMorseChars = morseChars.filter(code => code && code !== '');
  
  return {
    morse: validMorseChars.join(' '),
    errors
  };
};

export const morseToText = (morse) => {
  const errors = [];
  const textChars = [];
  
  if (!morse || !morse.trim()) {
    return { text: '', errors: [] };
  }
  
  const normalizedMorse = morse.trim().replace(/\s+/g, ' ');
  const morseChars = normalizedMorse.split(' ');
  
  for (let i = 0; i < morseChars.length; i++) {
    const code = morseChars[i];
    
    if (!code || code.length === 0) {
      continue;
    }
    
    if (code === '/') {
      textChars.push(' ');
      continue;
    }
    
    if (!/^[\.\-]+$/.test(code)) {
      errors.push(`Invalid: "${code}"`);
      continue;
    }
    
    if (reverseMorseMap[code]) {
      textChars.push(reverseMorseMap[code]);
    }
  }
  
  return {
    text: textChars.join(''),
    errors
  };
};

export const autoTranslate = (input) => {
  if (!input || input.trim() === '') {
    return { output: '', mode: 'text', errors: [] };
  }
  
  const isMorse = /^[\.\-\s/]+$/.test(input.trim());
  
  if (isMorse) {
    const result = morseToText(input);
    return {
      output: result.text,
      mode: 'morse',
      errors: result.errors
    };
  } else {
    const result = textToMorse(input);
    return {
      output: result.morse,
      mode: 'text',
      errors: result.errors
    };
  }
};
