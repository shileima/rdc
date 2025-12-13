export const homeStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  @keyframes breathing {
    0%, 100% {
      opacity: 0.25;
      transform: scale(1) translate(0, 0);
    }
    33% {
      opacity: 0.5;
      transform: scale(1.2) translate(20px, -20px);
    }
    66% {
      opacity: 0.35;
      transform: scale(1.1) translate(-15px, 15px);
    }
  }
  @keyframes breathing-delayed {
    0%, 100% {
      opacity: 0.2;
      transform: scale(1) translate(0, 0);
    }
    33% {
      opacity: 0.45;
      transform: scale(1.25) translate(-25px, 25px);
    }
    66% {
      opacity: 0.3;
      transform: scale(1.15) translate(20px, -15px);
    }
  }
  @keyframes breathing-slow {
    0%, 100% {
      opacity: 0.22;
      transform: scale(1) translate(0, 0);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.15) translate(15px, 20px);
    }
  }
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) skewX(-15deg);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(200%) skewX(-15deg);
      opacity: 0;
    }
  }
  @keyframes background-breathing {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.95;
    }
  }
  @keyframes pulse-slow {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.05);
    }
  }
  @keyframes grid-breathing {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.5;
    }
  }
  @keyframes gradient-shift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
  .animate-background-breathing {
    animation: background-breathing 6s ease-in-out infinite;
  }
  .animate-pulse-slow {
    animation: pulse-slow 8s ease-in-out infinite;
  }
  .animate-grid-breathing {
    animation: grid-breathing 4s ease-in-out infinite;
  }
  .radial-gradient-breathe {
    background: radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
  }
  .animate-breathing {
    animation: breathing 4s ease-in-out infinite;
  }
  .animate-breathing-delayed {
    animation: breathing-delayed 5s ease-in-out infinite;
    animation-delay: 1s;
  }
  .animate-breathing-slow {
    animation: breathing-slow 6s ease-in-out infinite;
    animation-delay: 2s;
  }
  .animate-gradient-shift {
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
  }
  .animate-shimmer {
    animation: shimmer 8s linear infinite;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`

