// app/not-found.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const blobMotion = {
  hidden: { scale: 0.8, rotate: 0 },
  visible: {
    scale: [1, 1.2, 1],
    rotate: [0, -10, 10, 0],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-pink-100 dark:from-zinc-900 dark:to-black p-8 text-center">
      {/* Blob animado */}
      <motion.div
        className="relative mb-6"
        variants={blobMotion}
        initial="hidden"
        animate="visible"
      >
        {/* círculo laranja */}
        <div className="bg-orange-400 w-32 h-32 rounded-full flex items-center justify-center">
          {/* rostinho simpático */}
          <div className="space-y-1">
            <div className="flex justify-between px-6">
              <span className="block w-20 h-20 bg-white rounded-full"></span>
              <span className="block w-20 h-20 bg-white rounded-full"></span>
            </div>
            <div className="w-6 h-1 bg-white mx-auto rounded"></div>
          </div>
        </div>
      </motion.div>

      {/* Título e texto */}
      <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-200 mb-2">
        Ops! Página não encontrada
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Parece que esse cantinho sumiu do mapa. Mas não se preocupe, a gente te devolve rapidinho!
      </p>

      {/* Botão de voltar */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-orange-500 px-6 py-3 text-lg font-semibold text-white shadow hover:bg-orange-600 transition"
        >
          ← Voltar para a Home
        </Link>
      </motion.div>
    </div>
  );
}
