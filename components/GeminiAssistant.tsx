
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

// Audio Processing Utils
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const GeminiAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou o assistente virtual da Agrobiotech. Como posso ajudar você enquanto nosso site está em manutenção?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input?: AudioContext; output?: AudioContext }>({});
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startLiveSession = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsListening(true);
            setIsLoading(false);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputCtx) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'model' && last.text.length < 500) { // arbitrary limit for live turn
                   // Simple logic to group transcriptions
                   return [...prev.slice(0, -1), { role: 'model', text: last.text + ' ' + text }];
                }
                return [...prev, { role: 'model', text }];
              });
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            stopLiveSession();
          },
          onclose: () => {
            setIsLive(false);
            setIsListening(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: 'Você é o assistente de voz da Agrobiotech. Seja breve e prestativo.',
        }
      });

      liveSessionRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      alert('Não foi possível acessar o microfone ou iniciar a sessão de voz.');
    }
  };

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.then((session: any) => session.close());
    }
    if (audioContextsRef.current.input) audioContextsRef.current.input.close();
    if (audioContextsRef.current.output) audioContextsRef.current.output.close();
    setIsLive(false);
    setIsListening(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Você é o assistente virtual amigável da Agrobiotech, uma empresa líder em Agronegócio. 
          O site está em manutenção. Responda perguntas sobre agricultura, tecnologia no campo e agronegócio. 
          Seja profissional, prestativo e brasileiro. 
          Lembre o usuário que ele pode deixar uma mensagem no formulário lateral para contato comercial direto.`,
        }
      });

      const aiText = response.text || 'Desculpe, tive um problema ao processar sua resposta.';
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Ocorreu um erro ao conectar com a inteligência artificial. Tente novamente em instantes.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="bg-primary p-4 flex items-center justify-between text-white shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLive ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
            <i className={`fas ${isLive ? 'fa-microphone' : 'fa-robot'}`}></i>
          </div>
          <div>
            <p className="font-bold leading-none">AgroAssist AI</p>
            <p className="text-[10px] opacity-80 uppercase tracking-widest mt-1">
              {isLive ? 'Modo Voz Ativo' : 'Assistente Virtual'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={isLive ? stopLiveSession : startLiveSession}
            title={isLive ? "Desligar Voz" : "Modo Voz"}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <i className={`fas ${isLive ? 'fa-phone-slash' : 'fa-headset'}`}></i>
          </button>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && !isLive && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 rounded-bl-none">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        {isLive && (
          <div className="sticky bottom-0 left-0 right-0 p-4 flex flex-col items-center justify-center">
            <div className="bg-white/80 backdrop-blur shadow-lg rounded-full px-6 py-2 flex items-center gap-4 border border-primary/20 animate-in zoom-in-95">
              <div className="flex gap-1 h-4 items-center">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1 bg-primary rounded-full animate-grow" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }}></div>
                ))}
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Ouvindo...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input (hidden in live mode to focus on voice) */}
      {!isLive && (
        <div className="p-4 border-t border-gray-100 bg-white shadow-inner">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre soja, milho, tecnologia..."
              className="flex-1 border-none bg-gray-100 rounded-full px-5 text-sm focus:ring-2 focus:ring-primary h-11 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-primary text-white w-11 h-11 rounded-full flex items-center justify-center hover:bg-green-700 disabled:opacity-50 transition-all shadow-md shadow-green-900/10"
            >
              <i className="fas fa-paper-plane text-sm"></i>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes grow {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-grow {
          animation: grow 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GeminiAssistant;
