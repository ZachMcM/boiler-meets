import React from 'react';

export default function PurdueTrainHeader() {
  return (
    <div className="w-full pl-10 relative h-12 overflow-hidden">
      {/* Railroad track - single line positioned under wheels */}
      <div className="w-full absolute bottom-1">
        <div className="w-[calc(100%-(var(--spacing)*20))] h-1 rounded bg-gray-400"></div>
      </div>

      {/* Animated Train */}
      <div className="absolute -top-[18px] left-0 w-full h-full animate-train-chug">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 260" width="80" height="40" role="img" aria-labelledby="t d" className="absolute" style={{ top: '20px' }}>
          <title id="t">Cartoon Train</title>
          <desc id="d">Rounded, welcoming minimal train silhouette with soft accents and a smile.</desc>
          <defs>
            <style>{`
              :root {
                --ink: #1c1c1c;
                --accent: #d9b873;
                --blush: #f0a8a8;
                --window: #ffffff;
              }
            `}</style>
          </defs>
          {/* Cowcatcher (rounded) */}
          <path d="M364 150h28c3 0 6 1 8 3l61 49c2 1 1 4-1 4h-52c-3 0-6-1-8-3l-36-29c-2-2-1-6 0-8z"
                fill="var(--ink)" />
          {/* Frame */}
          <rect x="90" y="150" width="312" height="20" rx="10" fill="var(--ink)"/>
          {/* Boiler body */}
          <rect x="176" y="92" width="190" height="62" rx="24" fill="var(--ink)"/>
          {/* Smokebox face plate (slightly lighter ring) */}
          <circle cx="360" cy="123" r="36" fill="var(--ink)"/>
          <circle cx="360" cy="123" r="30" fill="none" stroke="var(--accent)" strokeWidth="6" />
          <circle cx="360" cy="123" r="8" fill="var(--accent)" stroke="var(--accent)" strokeWidth="6" />
          {/* Stack (rounded, cartoon scale) */}
          <rect x="202" y="54" width="48" height="28" rx="10" fill="var(--ink)"/>
          <rect x="194" y="44" width="64" height="12" rx="6" fill="var(--ink)"/>
          {/* Puff of steam (animated) */}
          <g className="animate-smoke-1" fill="var(--ink)" opacity="0.18">
            <circle cx="235" cy="32" r="10"/>
          </g>
          <g className="animate-smoke-2" fill="var(--ink)" opacity="0.18">
            <circle cx="252" cy="22" r="8"/>
          </g>
          <g className="animate-smoke-3" fill="var(--ink)" opacity="0.18">
            <circle cx="268" cy="14" r="6"/>
          </g>
          {/* Cab (rounded) */}
          <rect x="84" y="82" width="106" height="72" rx="14" fill="var(--ink)"/>
          {/* Big friendly window */}
          <rect x="98" y="95" width="70" height="34" rx="10" fill="var(--window)" opacity="0.9"/>
          {/* Accent stripe along boiler */}
          <rect x="182" y="122" width="150" height="10" rx="5" fill="var(--accent)"/>
          {/* Wheels: chunkier & round */}
          <g fill="var(--ink)">
            <circle cx="130" cy="210" r="36"/>
            <circle cx="235" cy="210" r="36"/>
            <circle cx="338" cy="210" r="36"/>
          </g>
          {/* Wheel hubs (accent) */}
          <g fill="var(--accent)">
            <circle cx="130" cy="210" r="8"/>
            <circle cx="235" cy="210" r="8"/>
            <circle cx="338" cy="210" r="8"/>
          </g>
          {/* Rods (rounded stroke) */}
          <g fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M130 210 L235 210 L338 210"/>
          </g>
        </svg>
      </div>

      <style>{`
        .animate-train-chug {
          animation: train-chug 10s linear infinite;
        }

        @keyframes train-chug {
          0% {
            transform: translateX(1%);
            opacity: 0;
          }
          5% {
            transform: translateX(1%);
            opacity: 1;
          }
          95% {
            transform: translateX(95%);
            opacity: 1;
          }
          100% {
            transform: translateX(95%);
            opacity: 0;
          }
        }

        .animate-smoke-1 circle { animation: rise 2s linear infinite; animation-delay: 0s; }
        .animate-smoke-2 circle { animation: rise 2s linear infinite; animation-delay: 1.3s; }
        .animate-smoke-3 circle { animation: rise 2s linear infinite; animation-delay: 2.6s; }

        @keyframes rise {
            0% {
                transform: translate(0, 0) scale(1);
                opacity: 0.25;
            }
            40% {
                opacity: 0.4;
            }
            70% {
                transform: translate(-256px, -24px) scale(1.4);
                opacity: 0.2;
            }
            100% {
                transform: translate(-512px, -48px) scale(1.8);
                opacity: 0;
            }
        }
      `}</style>
    </div>
  );
}