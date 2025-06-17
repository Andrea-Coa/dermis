import { motion } from 'framer-motion';
import { useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';

import { NavigationContainer } from '@react-navigation/native';

const Intro = () => {
  const navigate = NavigationContainer();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/register'); //ir aqui luego de tantos segundos
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Partes del logo (puedes ajustar según tu diseño real)
  const logoParts = [
    { id: 1, color: '#FFDBB4', path: 'M50,50 L50,150' }, // Línea vertical
    { id: 2, color: '#E5B887', path: 'M50,50 Q100,50 100,100' }, // Curva superior
    { id: 3, color: '#D2A16D', path: 'M100,100 Q100,150 50,150' }, // Curva inferior
    // Añade más partes según tu diseño
  ];

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <svg width="300" height="300" viewBox="0 0 200 200">
        {logoParts.map((part, index) => (
          <motion.path
            key={part.id}
            d={part.path}
            stroke={part.color}
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 0.9, 1.1, 1], // Efecto de rebote
              opacity: 1,
            }}
            transition={{
              delay: index * 0.2,
              duration: 0.8,
              times: [0, 0.5, 0.7, 0.9, 1], // Controla los puntos clave de la animación
              ease: "easeOut"
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default Intro;