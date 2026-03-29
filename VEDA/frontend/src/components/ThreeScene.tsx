"use client";

import { useTheme } from "@/components/ThemeContext";

export default function ThreeScene({ isThinking }: { isThinking: boolean }) {
  const { isDark } = useTheme();

  const accentAlpha = isDark ? 0.5 : 0.35;
  const glowAlpha = isDark ? 0.3 : 0.15;

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ height: "140px" }}>
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, var(--veda-orb-bg) 0%, transparent 70%)`,
        }}
      />

      {/* Outer ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: "120px",
          height: "120px",
          border: `1px solid rgba(108,92,231,${isDark ? 0.12 : 0.15})`,
          animation: `spin-slow ${isThinking ? "4s" : "12s"} linear infinite`,
          transition: "all 1s ease",
        }}
      />

      {/* Middle ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: "90px",
          height: "90px",
          border: `1px solid rgba(0,206,201,${isDark ? 0.1 : 0.12})`,
          animation: `spin-slow ${isThinking ? "3s" : "8s"} linear infinite reverse`,
          transition: "all 1s ease",
        }}
      />

      {/* Core orb */}
      <div
        className="relative rounded-full"
        style={{
          width: "50px",
          height: "50px",
          background: isThinking
            ? `radial-gradient(circle, rgba(0,206,201,${accentAlpha + 0.1}) 0%, rgba(108,92,231,${accentAlpha - 0.1}) 50%, transparent 70%)`
            : `radial-gradient(circle, rgba(108,92,231,${accentAlpha}) 0%, rgba(108,92,231,${accentAlpha * 0.4}) 50%, transparent 70%)`,
          boxShadow: isThinking
            ? `0 0 40px rgba(0,206,201,${glowAlpha}), 0 0 80px rgba(0,206,201,${glowAlpha * 0.3})`
            : `0 0 30px rgba(108,92,231,${glowAlpha}), 0 0 60px rgba(108,92,231,${glowAlpha * 0.2})`,
          animation: `pulse-glow ${isThinking ? "1s" : "3s"} ease-in-out infinite`,
          transition: "all 0.8s ease",
        }}
      />

      {/* Subtle particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: "2px",
            height: "2px",
            background: isThinking
              ? `rgba(0,206,201,${isDark ? 0.4 : 0.5})`
              : `rgba(108,92,231,${isDark ? 0.3 : 0.4})`,
            top: `${30 + Math.sin((i * Math.PI) / 3) * 40}%`,
            left: `${50 + Math.cos((i * Math.PI) / 3) * 8}%`,
            animation: `pulse-glow ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            transition: "all 0.8s ease",
          }}
        />
      ))}

      {/* Status text */}
      <div
        className="absolute bottom-3 text-center"
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: isThinking ? "var(--veda-cyan)" : "var(--veda-accent)",
          opacity: isDark ? 0.6 : 0.7,
          transition: "color 0.5s ease",
        }}
      >
        {isThinking ? "Processing" : "VEDA"}
      </div>
    </div>
  );
}
