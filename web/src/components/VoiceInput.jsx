import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VoiceInput = ({ onTranscript, onInterim }) => {
  const { t } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (!supported) {
      alert("तुमच्या ब्राऊझरमध्ये व्हॉईस टायपिंग सपोर्ट नाही. कृपया गुगल क्रोम (Google Chrome) ब्राऊझर वापरा.");
      return;
    }

    if (isListening) {
      // Stop recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Pure Marathi (India) Speech Model
      recognition.lang = 'mr-IN';
      recognition.continuous = true; // Keep listening continuously until user presses stop
      recognition.interimResults = true; // Show live words in real-time as user speaks
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        if (finalTranscript && onTranscript) {
          onTranscript(finalTranscript.trim());
        } else if (interimTranscript && onInterim) {
          onInterim(interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === 'not-allowed') {
          alert("कृपया मायक्रोफोनची परवानगी (Microphone Permission) द्या.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? "बोलणे थांबवा (Stop Recording)" : "मराठीत बोला (Start Voice Dictation)"}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-md shadow-red-500/25 ring-2 ring-red-400'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
        }`}
      >
        {isListening ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>थांबवा (Stop)</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-emerald-600" />
            <span>मराठीत बोला (Mic)</span>
          </>
        )}
      </button>

      {isListening && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>ऐकत आहे... मराठीत बोला</span>
        </span>
      )}
    </div>
  );
};
