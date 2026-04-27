import { useState, useRef } from "react";

export function useMicInput(onTranscript) {
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  const toggle = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported. Use Chrome.");
      return;
    }

    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang           = "hi-IN";
    recog.interimResults = true;
    recog.continuous     = false;

    recog.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript).join("");
      const isFinal = e.results[e.results.length - 1].isFinal;
      onTranscript(transcript, isFinal);
    };

    recog.onerror = () => setListening(false);
    recog.onend   = () => setListening(false);

    recogRef.current = recog;
    recog.start();
    setListening(true);
  };

  return { listening, toggle };
}