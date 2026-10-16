import { useState, useEffect, useCallback, useRef } from 'react';

// Browser speech recognition interface
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Synthesis and Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    // Initialize Speech Recognition
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setRecognitionSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition init error:', e);
      }
    }
  }, []);

  const speak = useCallback(
    (text: string, voiceURI = '', rate = 1, pitch = 1) => {
      if (!speechSupported || typeof window === 'undefined') return;

      window.speechSynthesis.cancel();

      // Clean markdown tags for natural speech
      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'Code block omitted for brevity.')
        .replace(/[#*_`~[\]()]/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.pitch = pitch;

      if (voiceURI && voices.length > 0) {
        const found = voices.find((v) => v.voiceURI === voiceURI);
        if (found) utterance.voice = found;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [speechSupported, voices]
  );

  const stopSpeaking = useCallback(() => {
    if (speechSupported && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [speechSupported]);

  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (!recognitionRef.current) return;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onResult(transcript);
        }
      };

      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    },
    []
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      setIsListening(false);
    }
  }, []);

  return {
    isSpeaking,
    isListening,
    speechSupported,
    recognitionSupported,
    voices,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
  };
}
