'use client';

import { useState } from 'react';
import Image from 'next/image';

type TrailerPlayerProps = {
  thumbnailSrc: string;
  videoSrc: string;
};

export default function TrailerPlayer({ thumbnailSrc, videoSrc }: TrailerPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full h-full group">
      {!isPlaying ? (
        // Thumbnail with play button
        <button
          onClick={() => setIsPlaying(true)}
          className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none"
        >
          {/* Thumbnail Image */}
          <Image
            src={thumbnailSrc}
            alt="DEADARM Trailer"
            fill
            className="object-cover rounded-sm"
          />
          
          {/* Dark overlay */}
          {/* <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" /> */}
          
          {/* Play button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="tracking-[0.3em] text-white text-sm font-light mb-3 opacity-90">PLAY TRAILER</span>
            <div className="w-16 h-16 rounded-full border-2 border-white/80 flex items-center justify-center group-hover:border-white group-hover:scale-110 transition-all bg-white/10 backdrop-blur-sm">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </button>
      ) : (
        // Video iframe
        <iframe
          className="absolute inset-0 w-full h-full rounded-sm"
          src={videoSrc}
          title="DEADARM Trailer"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        />
      )}
    </div>
  );
}

