import React, { useState, useRef, useCallback } from 'react';
import { textToMorse, morseToText } from './utils/translator';
import { playMorseSound } from './utils/sound';

const MORSE_MAP = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
};

function App() {
  const [mode, setMode] = useState('textToMorse');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('READY');
  const [isPlaying, setIsPlaying] = useState(false);
  const textareaRef = useRef(null);



  const handleInputChange = useCallback((newValue) => {
    setInput(newValue);
    setStatus('READY');
    
    if (!newValue.trim()) {
      setOutput('');
      return;
    }

    if (mode === 'textToMorse') {
      const result = textToMorse(newValue);
      setOutput(result.morse);
    } else {
      const result = morseToText(newValue);
      setOutput(result.text);
    }
  }, [mode]);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setInput('');
    setOutput('');
    setStatus('READY');
  }, []);

  const handleTransmit = useCallback(async () => {
    if (!output || isPlaying) return;
    
    try {
      setStatus('TRANSMITTING');
      setIsPlaying(true);
      
      const morseToPlay = mode === 'textToMorse' ? output : textToMorse(output).morse;
      await playMorseSound(morseToPlay);
      setStatus('READY');
    } catch (error) {
      setStatus('ERROR');
      console.error('Transmission error:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [output, isPlaying, mode]);

  const handleDownload = useCallback(() => {
    if (!input && !output) return;
    
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      const content = `MORSE CODE TRANSLATION
Generated: ${timestamp}
Mode: ${mode === 'textToMorse' ? 'TEXT TO MORSE' : 'MORSE TO TEXT'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INPUT
${mode === 'textToMorse' ? 'Text:' : 'Morse:'}
${input || '(empty)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUTPUT
${mode === 'textToMorse' ? 'Morse:' : 'Text:'}
${output || '(empty)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `morse-${timestamp}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatus('DOWNLOADED');
      setTimeout(() => setStatus('READY'), 1500);
    } catch (error) {
      setStatus('ERROR');
      console.error('Download error:', error);
    }
  }, [input, output, mode]);

  const handleSwap = useCallback(() => {
    const newMode = mode === 'textToMorse' ? 'morseToText' : 'textToMorse';
    setMode(newMode);
    setInput(output);
    setOutput(input);
    setStatus('SWAPPED');
    setTimeout(() => setStatus('READY'), 1000);
  }, [mode, input, output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setStatus('CLEARED');
    setTimeout(() => setStatus('READY'), 1000);
  }, []);

  const referenceData = [
    ...Object.entries(MORSE_MAP).slice(0, 26),
    ...Object.entries(MORSE_MAP).slice(26, 36)
  ];

  const getLabels = () => {
    if (mode === 'textToMorse') {
      return {
        left: 'TEXT INPUT',
        right: 'MORSE OUTPUT',
        placeholder: 'ENTER TEXT MESSAGE...'
      };
    } else {
      return {
        left: 'MORSE INPUT',
        right: 'TEXT OUTPUT',
        placeholder: 'ENTER MORSE CODE (... --- ...)...'
      };
    }
  };

  const labels = getLabels();

  return (
    <div className="min-h-screen bg-[#1a1a18] p-4 md:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
        
        * {
          font-family: 'Share Tech Mono', monospace;
        }
        
        .orbitron {
          font-family: 'Orbitron', sans-serif;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-4">
        
        <header className="flex items-center justify-between border-b border-[#3a3a36] pb-4">
          <h1 className="orbitron text-3xl md:text-4xl font-bold text-[#EF9F27] tracking-wider">
            ◈ MORSE CODE DECODER
          </h1>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] blink-dot" />
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] blink-dot" />
            <div className="w-2 h-2 rounded-full bg-[#EF9F27] blink-dot" />
          </div>
        </header>

        <div className="flex gap-0 border-b border-[#3a3a36]">
          <button
            onClick={() => handleModeChange('textToMorse')}
            className={`flex-1 py-3 px-4 text-sm uppercase tracking-widest transition-all ${
              mode === 'textToMorse'
                ? 'text-[#EF9F27] border-b-2 border-[#EF9F27] bg-[#222220]'
                : 'text-[#888780] hover:text-[#EF9F27] bg-[#2a2a27]'
            }`}
          >
            TEXT → MORSE
          </button>
          <button
            onClick={() => handleModeChange('morseToText')}
            className={`flex-1 py-3 px-4 text-sm uppercase tracking-widest transition-all ${
              mode === 'morseToText'
                ? 'text-[#EF9F27] border-b-2 border-[#EF9F27] bg-[#222220]'
                : 'text-[#888780] hover:text-[#EF9F27] bg-[#2a2a27]'
            }`}
          >
            MORSE → TEXT
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.5fr)_auto_minmax(0,1.5fr)] gap-4">
          
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest text-[#EF9F27]">
              {labels.left}
            </label>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={labels.placeholder}
              className="w-full h-48 bg-[#222220] border border-[#3a3a36] text-[#EF9F27] p-4 resize-none focus:outline-none focus:border-[#EF9F27] placeholder:text-[#3a3a36]"
              spellCheck="false"
            />
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={handleSwap}
              className="w-16 h-16 rounded-full border-2 border-[#EF9F27] bg-[#222220] text-[#EF9F27] hover:bg-[#EF9F27] hover:text-[#222220] transition-all flex items-center justify-center text-2xl"
              title="Swap Panels"
            >
              ⇄
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest text-[#1D9E75]">
              {labels.right}
            </label>
            <textarea
              value={output}
              readOnly
              className="w-full h-48 bg-[#222220] border border-[#3a3a36] text-[#1D9E75] p-4 resize-none focus:outline-none placeholder:text-[#3a3a36]"
              placeholder="OUTPUT WILL APPEAR HERE..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleTransmit}
            disabled={!output || isPlaying}
            className={`py-3 px-4 uppercase tracking-widest text-sm border border-[#EF9F27] transition-all ${
              !output || isPlaying
                ? 'text-[#3a3a36] border-[#3a3a36] cursor-not-allowed'
                : 'text-[#EF9F27] hover:bg-[#EF9F27] hover:text-[#222220]'
            }`}
          >
            ▶ TRANSMIT
          </button>
          <button
            onClick={handleDownload}
            disabled={!input && !output}
            className={`py-3 px-4 uppercase tracking-widest text-sm border border-[#EF9F27] transition-all ${
              !input && !output
                ? 'text-[#3a3a36] border-[#3a3a36] cursor-not-allowed'
                : 'text-[#EF9F27] hover:bg-[#EF9F27] hover:text-[#222220]'
            }`}
          >
            ⬇ DOWNLOAD
          </button>
          <button
            onClick={handleSwap}
            className="py-3 px-4 uppercase tracking-widest text-sm border border-[#EF9F27] text-[#EF9F27] hover:bg-[#EF9F27] hover:text-[#222220] transition-all"
          >
            ⇄ SWAP
          </button>
          <button
            onClick={handleClear}
            className="py-3 px-4 uppercase tracking-widest text-sm border border-[#EF9F27] text-[#EF9F27] hover:bg-[#EF9F27] hover:text-[#222220] transition-all"
          >
            ✕ CLEAR
          </button>
        </div>

        <div className="border border-[#3a3a36] p-4">
          <h3 className="orbitron text-sm font-bold text-[#EF9F27] mb-4 uppercase tracking-wider">
            ◈ REFERENCE TABLE
          </h3>
          <div className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-2">
            {referenceData.map(([char, morse]) => (
              <div
                key={char}
                className="bg-[#2a2a27] border border-[#3a3a36] p-2 text-center"
              >
                <div className="text-[#EF9F27] text-sm font-bold">{char}</div>
                <div className="text-[#888780] text-xs mt-1">{morse}</div>
              </div>
            ))}
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-[#3a3a36] pt-4 text-sm">
          <div className={`uppercase tracking-wider ${
            status === 'ERROR' ? 'text-red-500' :
            status === 'TRANSMITTING' ? 'text-[#1D9E75] animate-pulse' :
            'text-[#888780]'
          }`}>
            ◈ STATUS: {status}
          </div>
          <div className="text-[#1D9E75]">
            CHARS: {input.length.toString().padStart(3, '0')}
          </div>
        </footer>

      </div>
    </div>
  );
}

export default App;
