
import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, Video, Mic, Upload, 
  Wand2, Play, Loader2, Maximize, 
  Trash2, BrainCircuit, Search, MapPin, 
  Volume2, Radio, Square, Headphones
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { AspectRatio, ImageSize } from '../types';

export const ArchitectSandbox: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'image' | 'video' | 'analyze' | 'voice' | 'speech'>('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [imageSize, setImageSize] = useState<ImageSize>("1K");
  
  // Audio State
  const [isLive, setIsLive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const checkKey = async () => {
    if (typeof window.aistudio !== 'undefined') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) return;
    await checkKey();
    setIsGenerating(true);
    try {
      let res;
      if (uploadedFile) {
        res = await geminiService.editImage(uploadedFile, prompt);
      } else {
        res = await geminiService.generateImage(prompt, aspectRatio, imageSize);
      }
      setResult(res);
    } catch (err) {
      alert("Generation failed. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt && !uploadedFile) return;
    await checkKey();
    setIsGenerating(true);
    try {
      const videoUrl = await geminiService.generateVideo(
        prompt, 
        uploadedFile || undefined, 
        aspectRatio === '9:16' ? '9:16' : '16:9'
      );
      setResult(videoUrl);
    } catch (err) {
      alert("Video generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setIsGenerating(true);
    try {
      const mimeType = uploadedFile.split(';')[0].split(':')[1];
      const res = await geminiService.analyzeMedia(uploadedFile, mimeType, prompt || "Analyze this media.");
      setResult(res);
    } catch (err) {
      alert("Analysis failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTTS = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const base64Audio = await geminiService.generateSpeech(prompt);
      if (base64Audio) {
        const audioData = atob(base64Audio);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i);
        }
        
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(view, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
        setResult("Audio generated and playing...");
      }
    } catch (err) {
      alert("Speech generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio helper
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
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
  };

  const handleLiveToggle = async () => {
    if (isLive) {
      if (liveSessionRef.current) liveSessionRef.current.close();
      setIsLive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = outCtx;

      const sessionPromise = geminiService.connectLive({
        onopen: () => {
          const source = inCtx.createMediaStreamSource(stream);
          const processor = inCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
            
            const binary = String.fromCharCode(...new Uint8Array(int16.buffer));
            const base64 = btoa(binary);
            
            sessionPromise.then(session => {
              session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
            });
          };
          source.connect(processor);
          processor.connect(inCtx.destination);
          setIsLive(true);
        },
        onmessage: async (msg) => {
          const base64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64) {
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            
            const buffer = await decodeAudioData(bytes, outCtx, 24000, 1);
            const source = outCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outCtx.destination);
            
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e) => console.error("Live Error", e),
        onclose: () => setIsLive(false)
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      alert("Could not start live session. Check permissions.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[700px]">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
            {(['image', 'video', 'analyze', 'voice', 'speech'] as const).map((tool) => (
              <button
                key={tool}
                onClick={() => { setActiveTool(tool); setResult(null); }}
                className={`flex-1 flex flex-col items-center py-3 px-2 rounded-lg transition-all min-w-[70px] ${
                  activeTool === tool ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tool === 'image' && <ImageIcon size={18} />}
                {tool === 'video' && <Video size={18} />}
                {tool === 'analyze' && <BrainCircuit size={18} />}
                {tool === 'voice' && <Radio size={18} />}
                {tool === 'speech' && <Volume2 size={18} />}
                <span className="text-[9px] font-bold uppercase mt-1">{tool}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {(activeTool !== 'voice') && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Input Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    activeTool === 'image' ? "A complex Azure VNet diagram..." :
                    activeTool === 'video' ? "Animate the data flow in this diagram..." :
                    activeTool === 'speech' ? "Welcome to the AI Infrastructure dashboard." :
                    "Describe the security vulnerabilities in this Dockerfile..."
                  }
                  className="w-full h-24 mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
                />
              </div>
            )}

            {activeTool === 'image' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Aspect Ratio</label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    {["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Resolution</label>
                  <select 
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as ImageSize)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    {["1K", "2K", "4K"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            {(activeTool === 'image' || activeTool === 'video' || activeTool === 'analyze') && (
              <div className="pt-2">
                <label className="block w-full cursor-pointer bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl text-center text-sm font-bold transition-all">
                  <div className="flex items-center justify-center gap-2">
                    <Upload size={18} />
                    {uploadedFile ? "Media Loaded" : "Upload Reference"}
                  </div>
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                </label>
                {uploadedFile && (
                  <button onClick={() => setUploadedFile(null)} className="mt-2 w-full text-[10px] text-rose-500 hover:bg-rose-50 p-1 rounded font-bold uppercase">
                    Clear Media
                  </button>
                )}
              </div>
            )}

            {activeTool === 'voice' ? (
              <button
                onClick={handleLiveToggle}
                className={`w-full p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isLive ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                }`}
              >
                {isLive ? <Square size={20} /> : <Mic size={20} />}
                {isLive ? "Stop Live Session" : "Start Voice Consultation"}
              </button>
            ) : (
              <button
                onClick={
                  activeTool === 'image' ? handleGenerateImage : 
                  activeTool === 'video' ? handleGenerateVideo : 
                  activeTool === 'speech' ? handleTTS :
                  handleAnalyze
                }
                disabled={isGenerating || (!prompt && !uploadedFile)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all"
              >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                {isGenerating ? "Processing..." : "Execute Lab Action"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <h4 className="text-xs font-bold text-indigo-800 flex items-center gap-2 mb-1">
            <Headphones size={14} /> Low Latency Mode
          </h4>
          <p className="text-[11px] text-indigo-700 leading-relaxed">
            Live Voice uses 16kHz audio input and 24kHz raw PCM output for near-instant interaction.
          </p>
        </div>
      </div>

      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative min-h-[400px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-xs font-bold text-slate-600 uppercase">
                {isLive ? 'Live Voice Session' : 'Output Terminal'}
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            {isGenerating ? (
              <div className="text-center animate-pulse">
                <Loader2 size={48} className="text-indigo-400 animate-spin mx-auto mb-4" />
                <p className="font-bold text-slate-800">Processing with Gemini Intelligence...</p>
              </div>
            ) : isLive ? (
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25" />
                  <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center relative shadow-2xl">
                    <Mic size={48} className="text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Voice Session Active</h3>
                  <p className="text-sm text-slate-500">The Architect is listening to your queries.</p>
                </div>
              </div>
            ) : result ? (
              activeTool === 'analyze' ? (
                <div className="w-full h-full overflow-y-auto bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {result}
                </div>
              ) : activeTool === 'video' ? (
                <video src={result} controls className="max-w-full max-h-full rounded-lg shadow-2xl" />
              ) : activeTool === 'speech' ? (
                <div className="text-center">
                   <div className="p-8 bg-emerald-50 rounded-full inline-block mb-4">
                     <Volume2 size={48} className="text-emerald-600" />
                   </div>
                   <p className="font-bold text-slate-800">Audio playback initiated.</p>
                </div>
              ) : (
                <img src={result} alt="Generated" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" />
              )
            ) : (
              <div className="text-center text-slate-300">
                <div className="mb-4 flex justify-center opacity-20">
                  <Wand2 size={80} />
                </div>
                <p className="font-medium">Ready for input</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
