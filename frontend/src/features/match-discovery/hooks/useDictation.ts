'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// La API de reconocimiento de voz del navegador no está en los tipos de TypeScript: se declara lo mínimo que se usa.
interface RecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionConstructor = new () => Recognition;

/** Por qué no se pudo dictar; `null` mientras todo anda bien. */
export type DictationError = 'denied' | 'no-microphone' | 'failed';

function recognitionConstructor(): RecognitionConstructor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/** Silencio o corte voluntario no son fallas: no se le muestra nada al productor. */
function errorFor(code: string): DictationError | null {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'denied';
    case 'audio-capture':
      return 'no-microphone';
    case 'no-speech':
    case 'aborted':
      return null;
    default:
      return 'failed';
  }
}

/**
 * Dictado por voz del pedido (reconocimiento del navegador, en español de Argentina).
 * Sigue escuchando hasta que se lo detiene (quien cuenta su campo suele hacer pausas) y expone `interim`,
 * lo que se va entendiendo antes de cerrar cada frase.
 * `supported` es `false` en servidor y en navegadores sin la API (Firefox): ahí la pantalla no muestra el botón.
 */
export function useDictation(onTranscript: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<DictationError | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    setSupported(Boolean(recognitionConstructor()));
    return () => recognition.current?.abort();
  }, []);

  const toggle = useCallback(() => {
    if (recognition.current) {
      recognition.current.stop();
      return;
    }
    const Ctor = recognitionConstructor();
    if (!Ctor) return;

    const instance = new Ctor();
    instance.lang = 'es-AR';
    instance.continuous = true;
    instance.interimResults = true;
    instance.onresult = (event) => {
      let pending = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const spoken = result[0].transcript.trim();
          if (spoken) onTranscriptRef.current(spoken);
        } else {
          pending += result[0].transcript;
        }
      }
      setInterim(pending.trim());
    };
    const finish = () => {
      recognition.current = null;
      setListening(false);
      setInterim('');
    };
    instance.onend = finish;
    instance.onerror = (event) => {
      setError(errorFor(event.error));
      finish();
    };

    recognition.current = instance;
    setError(null);
    setListening(true);
    instance.start();
  }, []);

  return { supported, listening, interim, error, toggle };
}
