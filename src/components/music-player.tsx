'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Radio, Minimize2, Maximize2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MusicPlayerProps {
  stationName?: string;
  streamUrl?: string;
  favicon?: string;
  tags?: string[];
}

export default function MusicPlayer({
  stationName = "SomaFM Synphaera Radio",
  streamUrl = "https://ice1.somafm.com/synphaera-256-mp3",
  favicon = "https://somafm.com/img3/synphaera400.jpg",
  tags = ["ambient", "electronic", "space"]
}: MusicPlayerProps) {
  
  const alternativeUrls = [
    "/api/stream?url=" + encodeURIComponent("https://ice1.somafm.com/synphaera-256-mp3"),
    "/api/stream?url=" + encodeURIComponent("https://ice6.somafm.com/synphaera-256-mp3"), 
    "/api/stream?url=" + encodeURIComponent("https://ice2.somafm.com/synphaera-256-mp3"),
    "/api/stream?url=" + encodeURIComponent("https://ice5.somafm.com/synphaera-256-mp3"),
    "/api/stream?url=" + encodeURIComponent("https://ice3.somafm.com/synphaera-256-mp3")
  ];
  
  const originalUrls = [
    "https://ice1.somafm.com/synphaera-256-mp3",
    "https://ice6.somafm.com/synphaera-256-mp3", 
    "https://ice2.somafm.com/synphaera-256-mp3",
    "https://ice5.somafm.com/synphaera-256-mp3",
    "https://ice3.somafm.com/synphaera-256-mp3"
  ];
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isSwitchingServer, setIsSwitchingServer] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const tryNextUrl = async () => {
    if (!audioRef.current) return false;
    
    const audio = audioRef.current;
    const nextIndex = (currentUrlIndex + 1) % alternativeUrls.length;
    const wasPlaying = isPlaying;
    
    setIsSwitchingServer(true);
    
    try {
      if (wasPlaying) {
        audio.pause();
        setIsPlaying(false);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      audio.src = alternativeUrls[nextIndex];
      audio.load();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (wasPlaying) {
        await audio.play();
        setIsPlaying(true);
      }
      
      setCurrentUrlIndex(nextIndex);
      setError(null);
      setIsSwitchingServer(false);
      return true;
    } catch (err) {
      console.error(`Erro com URL ${nextIndex}:`, err);
      setIsSwitchingServer(false);
      return false;
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (!userInteracted) {
      console.log('⚠️ Usuário precisa interagir primeiro');
      return;
    }

    const audio = audioRef.current;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        audio.src = alternativeUrls[currentUrlIndex];
        audio.load();
        await audio.play();
        setIsPlaying(true);
        setError(null);
        console.log('🎵 Música iniciada!');
      } catch (err) {
        console.error('Erro ao tocar:', err);
        
        let success = false;
        for (let i = 0; i < alternativeUrls.length - 1; i++) {
          success = await tryNextUrl();
          if (success) break;
        }
        
        if (!success) {
          setError('Todas as conexões falharam. Tente novamente mais tarde.');
          setIsPlaying(false);
        }
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
    }
    setIsMuted(newVolume[0] === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume[0] / 100;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        console.log('👤 Usuário interagiu - música disponível para reprodução');
      }
    };

    const events = ['click', 'touchstart', 'keydown'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [userInteracted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, []);

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-50"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-background/95 backdrop-blur-sm border-border/50 shadow-2xl overflow-hidden">
        <audio
          ref={audioRef}
          src={alternativeUrls[currentUrlIndex]}
          preload="auto"
        />

        <AnimatePresence>
          {isMinimized ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 flex items-center gap-2"
            >
                             <Button
                 size="sm"
                 variant="ghost"
                 onClick={togglePlay}
                 className="w-8 h-8 p-0 relative"
                 title={!userInteracted ? "Clique em qualquer lugar da página para iniciar a música" : ""}
               >
                 {isPlaying ? (
                   <Pause className="w-4 h-4" />
                 ) : userInteracted ? (
                   <Play className="w-4 h-4" />
                 ) : (
                   <div className="relative">
                     <Music className="w-4 h-4 text-primary/60" />
                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                   </div>
                 )}
               </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(false)}
                className="w-8 h-8 p-0"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4 w-80"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Music Player</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(true)}
                  className="w-8 h-8 p-0"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={favicon} 
                    alt={stationName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{stationName}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <div className="flex-1 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="w-8 h-8 p-0"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  
                  <div className="flex-1">
                    <Slider
                      value={isMuted ? [0] : volume}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {isMuted ? 0 : volume[0]}%
                  </span>
                </div>
              </div>

              {isPlaying && (
                <div className="flex items-center gap-2 text-xs text-green-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Ao vivo</span>
                </div>
              )}

              <div className="border-t border-border/20 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-foreground">
                      Servidor Ativo
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ice{currentUrlIndex === 0 ? '1' : currentUrlIndex === 1 ? '6' : currentUrlIndex === 2 ? '2' : currentUrlIndex === 3 ? '5' : '3'}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await tryNextUrl();
                    }}
                    disabled={isSwitchingServer}
                    className="flex-1 text-xs h-8"
                  >
                    {isSwitchingServer ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Trocando...</span>
                      </div>
                    ) : (
                      "🔄 Trocar Servidor"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(originalUrls[currentUrlIndex], '_blank')}
                    className="text-xs h-8 px-2"
                  >
                    🔗 Testar
                  </Button>
                </div>
                
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentUrlIndex 
                          ? 'bg-green-500 animate-pulse' 
                          : 'bg-muted-foreground/30'
                      }`}
                      title={`Servidor ice${index === 0 ? '1' : index === 1 ? '6' : index === 2 ? '2' : index === 3 ? '5' : '3'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}