import React from "react";
import nexplayLogoImg from "../assets/images/nexplay_logo.jpg";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  variant?: "image" | "compact";
}

export default function NexPlayLogo({
  className = "",
  size = "md",
  showSubtitle = false,
  variant = "image",
}: LogoProps) {
  // Height and dimensions matching the scale
  const imgSizeClass = {
    sm: "h-11 sm:h-12 w-auto",
    md: "h-14 sm:h-16 w-auto",
    lg: "h-20 sm:h-24 w-auto",
    xl: "h-28 sm:h-32 w-auto",
  }[size];

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.4)] flex-shrink-0 bg-black">
          <img
            src={nexplayLogoImg}
            alt="NexPlay"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center font-display font-black text-xl tracking-tight uppercase">
          <span className="text-white">NEX</span>
          <span className="text-cyan-400">PLAY</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="relative group">
        {/* Luminous cyan backlight blur */}
        <div className="absolute inset-0 bg-cyan-500/25 blur-xl rounded-2xl pointer-events-none group-hover:bg-cyan-500/40 transition-all duration-300"></div>

        {/* High resolution official NexPlay Logo */}
        <img
          src={nexplayLogoImg}
          alt="NexPlay - Recargas de Videojuegos"
          className={`${imgSizeClass} relative z-10 object-contain rounded-2xl drop-shadow-[0_0_20px_rgba(0,194,255,0.45)]`}
        />
      </div>

      {showSubtitle && (
        <div className="flex items-center gap-2 mt-1.5 w-full justify-center">
          <div className="h-[2px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-cyan-400"></div>
          <span className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-bold text-cyan-400 drop-shadow-[0_0_6px_rgba(0,194,255,0.7)] whitespace-nowrap">
            Recargas de Videojuegos
          </span>
          <div className="h-[2px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-cyan-400"></div>
        </div>
      )}
    </div>
  );
}
