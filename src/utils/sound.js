let audioContext = null;

const DOT_DURATION = 100;
const DASH_DURATION = 300;
const SYMBOL_GAP = 100;
const LETTER_GAP = 300;
const WORD_GAP = 700;

const FREQUENCY = 600;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const playTone = (duration, startTime) => {
  const ctx = initAudioContext();
  
  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(FREQUENCY, ctx.currentTime);
  
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + (duration / 1000));
};

const msToSeconds = (ms) => ms / 1000;

export const playMorseSound = (morseCode) => {
  return new Promise((resolve, reject) => {
    try {
      const ctx = initAudioContext();
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      let currentTime = ctx.currentTime + 0.1;
      
      const words = morseCode.split(/\s*\/\s*|\s{2,}/);
      
      words.forEach((word, wordIndex) => {
        const symbols = word.trim().split(/\s+/).filter(s => s);
        
        symbols.forEach((symbol, symbolIndex) => {
          for (let i = 0; i < symbol.length; i++) {
            const char = symbol[i];
            
            if (char === '.') {
              playTone(DOT_DURATION, currentTime);
              currentTime += msToSeconds(DOT_DURATION + SYMBOL_GAP);
            } else if (char === '-') {
              playTone(DASH_DURATION, currentTime);
              currentTime += msToSeconds(DASH_DURATION + SYMBOL_GAP);
            }
          }
          
          if (symbolIndex < symbols.length - 1) {
            currentTime += msToSeconds(LETTER_GAP);
          }
        });
        
        if (wordIndex < words.length - 1) {
          currentTime += msToSeconds(WORD_GAP);
        }
      });
      
      setTimeout(() => {
        resolve();
      }, (currentTime - ctx.currentTime) * 1000 + 100);
      
    } catch (error) {
      reject(error);
    }
  });
};

export const stopMorseSound = () => {
  if (audioContext) {
    audioContext.suspend();
    audioContext.close();
    audioContext = null;
  }
};

export const previewSound = async () => {
  try {
    const ctx = initAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    playTone(200, ctx.currentTime);
  } catch (error) {
    console.error('Error previewing sound:', error);
  }
};
