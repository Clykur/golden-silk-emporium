"use client";

import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

import { HERO_VIDEO } from "@/lib/media";

export function VideoCommerce() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        try {
          await videoRef.current.play();
        } catch (error) {
          setIsPlaying(false);
        }
      }
    }
  };

  return (
    <section className="gsap-section py-24 md:py-32 bg-background">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center justify-between">
          <div className="w-full md:w-1/2 flex flex-col justify-center order-2 md:order-1">
            <p className="eyebrow mb-6">Drapeva in Motion</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
              Grace in <br />
              <span className="font-serif italic font-light">Every Step</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-10 max-w-xl">
              Every saree tells a story through its movement. Discover the graceful drape, rich
              textures, and intricate details through immersive videos designed to bring the
              collection closer to you. Experience the elegance before it arrives at your doorstep.
            </p>

            <div className="flex items-center gap-6">
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-16 h-16 rounded-full border border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-1" />
                )}
              </button>
              <div className="text-sm font-medium tracking-widest uppercase">
                {isPlaying ? "Pause Video" : "Watch the drape"}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex justify-center order-1 md:order-2">
            <div
              className="relative aspect-[9/16] h-[60vh] md:h-[75vh] overflow-hidden rounded-sm group cursor-pointer shadow-2xl"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              >
                <source src="/videos/saree_in_motion.mp4" type="video/mp4" />
              </video>

              {!isPlaying && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300">
                  <div className="w-20 h-20 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
