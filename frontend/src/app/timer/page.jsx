"use client";
import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Coffee, Clock, Brain, Target, Zap, Music, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
export default function MindMateStudyTimer() {
const router=useRouter();
 const { token, isAuthenticated, isCheckingAuth, user, checkAuth } = useAuthStore();

            useEffect(() => {
        // Check auth on page load
        checkAuth();
      }, [checkAuth]);
    
        useEffect(() => {
          // Only redirect when we're done checking auth
          if (!isCheckingAuth) {
            if (!isAuthenticated) {
              router.replace("/login");
            } else if (isAuthenticated && !user?.isVerified) {
              router.replace("/verify-email");
            }
          }
        }, [isAuthenticated, user, isCheckingAuth, router]);
  const PRESETS = [
    { label: "Pomodoro", sublabel: "25 min", value: 25, type: "study", icon: Target },
    { label: "Deep Work", sublabel: "50 min", value: 50, type: "study", icon: Brain },
    { label: "Power Hour", sublabel: "60 min", value: 60, type: "study", icon: Zap },
  ];
  
  const BREAK_PRESETS = [
    { label: "Short Break", sublabel: "5 min", value: 5, type: "break", icon: Coffee },
    { label: "Long Break", sublabel: "15 min", value: 15, type: "break", icon: Coffee },
  ];

  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(25 * 60);
  const [sessionType, setSessionType] = useState("study");
  const [completedSessions, setCompletedSessions] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const tickRef = useRef(null);
  const audioRef = useRef(null);

  const handleFocusMode = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleMusicPlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setMusicPlaying(true);
    }
  };

  const handleMusicPause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!running) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }

    if (!startTimestamp) setStartTimestamp(Date.now());

    tickRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (!startTimestamp) return Math.max(prev - 1, 0);
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        const remaining = Math.max(durationSeconds - elapsed, 0);

        if (remaining <= 0) {
          clearInterval(tickRef.current);
          tickRef.current = null;
          setRunning(false);
          setStartTimestamp(null);
          setCompletedSessions(c => c + 1);

          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            const message = sessionType === "study" 
              ? `Study session complete! Time for a well-deserved break.` 
              : `Break finished! Ready to dive back into focused work?`;
            new Notification(sessionType === "study" ? "🎯 Study Complete!" : "☕ Break Complete!", { body: message });
          }
        }

        return remaining;
      });
    }, 1000);

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [running, startTimestamp, durationSeconds, sessionType]);

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const setPreset = (m, type = "study") => {
    setMinutes(m);
    const sec = m * 60;
    setDurationSeconds(sec);
    setSecondsLeft(sec);
    setSessionType(type);
    setRunning(false);
    setStartTimestamp(null);
  };

  const handleStart = () => {
    if (secondsLeft <= 0) setSecondsLeft(durationSeconds);
    setStartTimestamp(Date.now() - (durationSeconds - secondsLeft) * 1000);
    setRunning(true);
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  };
  
  const handlePause = () => { setRunning(false); setStartTimestamp(null); };
  const handleReset = () => { setRunning(false); setSecondsLeft(durationSeconds); setStartTimestamp(null); };

  const handleCustomInput = (value) => {
    const v = Number(value || 0);
    if (Number.isFinite(v) && v > 0) setPreset(Math.round(v), "study");
  };
  
  const handleCustomSubmit = () => {
    const value = parseInt(customInput);
    if (value && value > 0 && value <= 180) { setPreset(value, "study"); setCustomInput(""); }
  };
  
  const handleCustomKeyDown = (e) => { if (e.key === "Enter") handleCustomSubmit(); };

  const progress = durationSeconds > 0 ? (durationSeconds - secondsLeft) / durationSeconds : 0;
  const colors = { primary:"#8961FF", secondary:"#53B4EE", accent:"#57AFF0", background:"#180C3D", card:"#160C3C" };
  const currentColor = sessionType === "study" ? colors.primary : colors.accent;

   if (isCheckingAuth || !isAuthenticated || !user?.isVerified) {
    return null;
 }
  return (
    <div className="h-screen w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)' }}>
      <Navbar/>
      <div className="relative z-10 h-full flex flex-col">

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-7xl mx-auto flex items-center gap-16">
            
            {/* Left Side - Presets */}
            <div className="flex flex-col gap-4 min-w-64">
              <h3 className="text-xl font-bold text-white mb-4 text-center">{sessionType === "study" ? "Study Sessions" : "Break Sessions"}</h3>
              <div className="flex gap-2 mb-4">
                <button onClick={() => !running && setSessionType("study")} disabled={running} className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${sessionType === "study" ? 'bg-white text-gray-800 shadow-lg':'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'} ${running?'opacity-50 cursor-not-allowed':''}`}>
                  <Clock className="w-4 h-4" /> Study
                </button>
                <button onClick={() => !running && setSessionType("break")} disabled={running} className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${sessionType === "break" ? 'bg-white text-gray-800 shadow-lg':'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'} ${running?'opacity-50 cursor-not-allowed':''}`}>
                  <Coffee className="w-4 h-4" /> Break
                </button>
              </div>

              {(sessionType === "study" ? PRESETS : BREAK_PRESETS).map((preset) => {
                const Icon = preset.icon;
                const isActive = minutes === preset.value && sessionType === preset.type;
                return (
                  <button key={`${preset.value}-${preset.type}`} onClick={() => setPreset(preset.value, preset.type)} disabled={running} className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all hover:scale-105 ${isActive?'shadow-lg scale-105':'hover:shadow-md'} ${running?'opacity-50 cursor-not-allowed':''}`} style={isActive?{backgroundColor:`${sessionType==='study'?colors.primary:colors.accent}20`,border:`2px solid ${sessionType==='study'?colors.primary:colors.accent}`}:{backgroundColor:`${colors.card}40`,border:'2px solid rgba(255,255,255,0.1)',backdropFilter:'blur(20px)'}}>
                    <Icon className="w-5 h-5" style={{ color: isActive ? (sessionType==='study'?colors.primary:colors.accent) : colors.secondary }} />
                    <div className="text-left">
                      <div className="font-semibold" style={{ color: isActive ? (sessionType==='study'?colors.primary:colors.accent) : 'white' }}>{preset.label}</div>
                      <div className="text-slate-400 text-sm">{preset.sublabel}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Center - Timer */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative mb-8" style={{ width: 300, height: 300 }}>
                <div className="absolute inset-0 rounded-full animate-pulse" style={{ background:`conic-gradient(from 0deg, ${currentColor}20, transparent, ${currentColor}20)`, filter:'blur(20px)'}}></div>
                <svg width="300" height="300" viewBox="0 0 300 300" className="transform -rotate-90 relative z-10">
                  <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="150" cy="150" r="130" fill="none" stroke={currentColor} strokeWidth="8" strokeDasharray={`${progress*2*Math.PI*130} ${2*Math.PI*130}`} strokeLinecap="round" style={{ filter:`drop-shadow(0 0 20px ${currentColor}60)`, transition:'all 0.3s ease'}} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {sessionType==='study'?<Clock className="w-6 h-6" style={{color:currentColor}}/>:<Coffee className="w-6 h-6" style={{color:currentColor}}/>}
                      <h2 className="text-xl font-bold" style={{color:currentColor}}>{sessionType==='study'?'Focus Mode':'Break Time'}</h2>
                    </div>
                    <div className="text-6xl font-mono font-bold mb-3" style={{color:currentColor,textShadow:`0 0 30px ${currentColor}40`}}>{format(secondsLeft)}</div>
                    <div className="text-slate-300 mb-2">{minutes} minute session</div>
                    <div className="text-sm font-medium px-4 py-1 rounded-full" style={{backgroundColor:`${currentColor}20`,color:currentColor}}>{(progress*100).toFixed(0)}% Complete</div>
                  </div>
                </div>
              </div>

              {/* Timer Controls - Only Main Buttons */}
              <div className="flex gap-4 mb-4">
                {!running ? (
                  <button 
                    onClick={handleStart} 
                    className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 transform hover:shadow-2xl"
                    style={{ 
                      backgroundColor: currentColor, 
                      boxShadow: `0 12px 40px ${currentColor}40`,
                      background: `linear-gradient(135deg, ${currentColor}, ${currentColor}DD)`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <Play className="w-6 h-6 group-hover:scale-110 transition-transform relative z-10" />
                    <span className="relative z-10">Start Session</span>
                  </button>
                ) : (
                  <button 
                    onClick={handlePause} 
                    className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 transform hover:shadow-2xl"
                    style={{ 
                      backgroundColor: colors.secondary, 
                      boxShadow: `0 12px 40px ${colors.secondary}40`,
                      background: `linear-gradient(135deg, ${colors.secondary}, ${colors.secondary}DD)`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <Pause className="w-6 h-6 group-hover:scale-110 transition-transform relative z-10" />
                    <span className="relative z-10">Pause</span>
                  </button>
                )}
                
                <button 
                  onClick={handleReset} 
                  className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg bg-slate-700/80 text-white transition-all hover:bg-slate-600 hover:scale-105 transform border border-slate-600/50 backdrop-blur-sm hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500 relative z-10" />
                  <span className="relative z-10">Reset</span>
                </button>
              </div>
            </div>

            {/* Right Side - Custom Timer & Tips */}
            <div className="flex flex-col gap-6 min-w-64">
              <div className="p-6 rounded-xl backdrop-blur-xl border" style={{backgroundColor:`${colors.card}40`,borderColor:`${colors.secondary}30`}}>
                <h4 className="text-white font-bold mb-4 text-center">Custom Timer</h4>
                <div className="flex gap-3">
                  <input type="number" min="1" max="180" value={customInput} onChange={(e)=>setCustomInput(e.target.value)} onKeyDown={handleCustomKeyDown} placeholder="Minutes" disabled={running} className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 text-center"/>
                  <button onClick={handleCustomSubmit} disabled={running||!customInput||parseInt(customInput)<=0} className="px-6 py-3 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" style={{backgroundColor:colors.secondary}}>Set</button>
                </div>
              </div>
              <div className="p-6 rounded-xl backdrop-blur-xl border text-center" style={{backgroundColor:`${colors.card}40`,borderColor:`${currentColor}30`}}>
                <h4 className="text-white font-bold mb-4">Focus Tips</h4>
                <div className="space-y-3">
                  <div className="text-sm text-slate-300">💡 Remove distractions from your workspace</div>
                  <div className="text-sm text-slate-300">🎵 Try instrumental music or white noise</div>
                  <div className="text-sm text-slate-300">💧 Keep water nearby to stay hydrated</div>
                  <div className="text-sm text-slate-300">🧘 Take deep breaths before starting</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Text */}
        <div className="text-center pb-8 px-8">
          <div className="max-w-2xl mx-auto">
           
          </div>
        </div>
      </div>

      {/* Enhanced Corner Controls */}
      {/* Music Control - Bottom Left - Floating Orb Style */}
      <div className="fixed bottom-8 left-8 z-20">
        <div className="relative">
          {/* Pulsing Ring Animation */}
          <div className="absolute inset-0 rounded-full animate-ping" style={{ 
            opacity: 0.2,
            scale: musicPlaying ? '1.2' : '1.0',
            transition: 'all 0.3s ease'
          }}></div>
          
          {/* Main Button */}
          <button
            onClick={musicPlaying ? handleMusicPause : handleMusicPlay}
            className="group relative overflow-hidden w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 transform"
            style={{
              backgroundColor: musicPlaying ? colors.accent : colors.secondary,
              boxShadow: `0 8px 32px ${musicPlaying ? colors.accent : colors.secondary}60`,
              background: `linear-gradient(135deg, ${musicPlaying ? colors.accent : colors.secondary}, ${musicPlaying ? colors.accent : colors.secondary}DD)`
            }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            {/* Icon */}
            {musicPlaying ? 
              <VolumeX className="w-7 h-7 text-white relative z-10 group-hover:scale-110 transition-transform" /> :
              <Volume2 className="w-7 h-7 text-white relative z-10 group-hover:scale-110 transition-transform" />
            }
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
              {musicPlaying ? 'Pause Music' : 'Play Music'}
            </div>
          </div>
        </div>
      </div>

      {/* Focus Mode - Bottom Right - Floating Orb Style */}
      <div className="fixed bottom-8 right-8 z-20">
        <div className="relative">
          {/* Pulsing Ring Animation */}
          <div className="absolute inset-0 rounded-full animate-pulse" style={{ 
            backgroundColor: colors.primary,
            opacity: isFullscreen ? 0.4 : 0.2,
            scale: isFullscreen ? '1.3' : '1.0',
            transition: 'all 0.3s ease'
          }}></div>
          
          {/* Main Button */}
          <button
            onClick={handleFocusMode}
            className="group relative overflow-hidden w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 transform"
            style={{
              backgroundColor: colors.primary,
              boxShadow: `0 8px 32px ${colors.primary}60`,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}DD)`
            }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            {/* Icon with Rotation Effect */}
            <div className="relative z-10 group-hover:rotate-12 transition-transform duration-300">
              {isFullscreen ? 
                <Minimize className="w-7 h-7 text-white" /> :
                <Maximize className="w-7 h-7 text-white" />
              }
            </div>
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-1/2 transform translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
              {isFullscreen ? 'Exit Focus' : 'Focus Mode'}
            </div>
          </div>
        </div>
      </div>

      {/* Audio */}
      <audio ref={audioRef} src="/audio/study.mp3" type="audio/mpeg" loop preload="auto" />
    </div>
  );
}