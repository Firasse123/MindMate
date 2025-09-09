"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const SplashScreen = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const particles = useMemo(() => {
    if (!isClient) return [];
    return [...Array(40)].map(() => ({
      size: Math.random() * 6 + 2,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 2,
    }));
  }, [isClient]);

  if (!isClient) return null; // render nothing on server

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1 }}
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: "linear-gradient(45deg, #60a5fa, #c084fc, #38bdf8)",
            left: p.x,
            top: p.y,
          }}
          animate={{
            y: [p.y, -100],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
          }}
        />
      ))}
      <motion.div className="relative z-10">
        <Brain className="w-32 h-32 text-blue-400" />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
