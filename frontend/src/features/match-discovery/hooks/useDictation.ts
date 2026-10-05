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
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionConstructor = new () => Recognition;

function recognitionConstructor(): RecognitionConstructor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/**
 * Dictado por voz del pedido (reconocimiento del navegador, en español de Argentina).
 * `supported` es `false` en servidor y en navegadores sin la API (Firefox): ahí la pantalla no muestra el botón.
 */
export function useDictation(onTranscript: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
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
    instance.continuous = false;
    instance.interimResults = false;
    instance.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) onTranscriptRef.current(result[0].transcript.trim());
      }
    };
    const finish = () => {
      recognition.current = null;
      setListening(false);
    };
    instance.onend = finish;
    instance.onerror = finish;

    recognition.current = instance;
    setListening(true);
    instance.start();
  }, []);

  return { supported, listening, toggle };
}
