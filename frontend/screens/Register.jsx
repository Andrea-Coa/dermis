import { motion } from 'framer-motion';
import { useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import { NavigationContainer } from '@react-navigation/native';

const Register = () => {
  const navigate = NavigationContainer();
  const [formData, setFormData] = useState({
    nombre: '',
    nickname: '',
    edad: '',
    correo: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos cuando tengas la conexión
    alert('Formulario enviado (simulación)');
    // navigate('/completado');
  };

  // Función para el botón de prueba
  const handleTestButton = () => {
    navigate('/facial-recognition'); // Navega a tu pantalla de análisis
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 flex flex-col items-center py-8 px-4"
    >
      {/* Logo animado */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mb-6"
      >
        <svg width="120" height="120" viewBox="0 0 200 200" className="drop-shadow-lg">
          <path 
            d="M50,50 L50,150" 
            stroke="#FF8A7A" 
            strokeWidth="12" 
            strokeLinecap="round"
            fill="none"
          />
          <path 
            d="M50,50 Q100,50 100,100 Q100,150 50,150" 
            stroke="#E57373" 
            strokeWidth="12" 
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </motion.div>

      {/* Título */}
      <motion.h1 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-3xl font-bold text-rose-800 mb-2 text-center"
      >
        Bienvenid@ a Dermis
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-rose-700 mb-8 text-center max-w-md"
      >
        Para pertenecer a la comunidad Dermis, te pedimos completes los siguientes datos:
      </motion.p>

      {/* Formulario */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-rose-100"
      >
        <div className="space-y-5">
          {/* Campos del formulario (igual que antes) */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-rose-800 mb-1">
              Nombre:
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-rose-200 focus:ring-2 focus:ring-rose-300 focus:border-rose-300 bg-rose-50/50 text-rose-900 placeholder-rose-300 transition-all"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-rose-800 mb-1">
              Nickname:
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-rose-200 focus:ring-2 focus:ring-rose-300 focus:border-rose-300 bg-rose-50/50 text-rose-900 placeholder-rose-300 transition-all"
              placeholder="Cómo quieres que te llamemos"
              required
            />
          </div>

          <div>
            <label htmlFor="edad" className="block text-sm font-medium text-rose-800 mb-1">
              Edad:
            </label>
            <input
              type="number"
              id="edad"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-rose-200 focus:ring-2 focus:ring-rose-300 focus:border-rose-300 bg-rose-50/50 text-rose-900 placeholder-rose-300 transition-all"
              placeholder="Tu edad"
              min="13"
              max="99"
              required
            />
          </div>

          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-rose-800 mb-1">
              Correo:
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-rose-200 focus:ring-2 focus:ring-rose-300 focus:border-rose-300 bg-rose-50/50 text-rose-900 placeholder-rose-300 transition-all"
              placeholder="tu@correo.com"
              required
            />
          </div>

          {/* Botón de envío real (deshabilitado temporalmente) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-rose-400 to-salmon-500 text-white py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-rose-200/50 transition-all opacity-50 cursor-not-allowed"
            disabled
            title="Funcionalidad no disponible aún"
          >
            Unirse a la comunidad (próximamente)
          </motion.button>

          {/* Botón de prueba para ir al Analyzer */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleTestButton}
            className="w-full mt-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-amber-200/50 transition-all"
          >
            Ir a Análisis (Modo Prueba)
          </motion.button>
        </div>
      </motion.form>

      {/* Enlace para login */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-6 text-rose-700"
      >
        ¿Ya tienes cuenta? 
        <button 
          onClick={() => navigate('/')} //corregir
          className="ml-2 font-semibold text-rose-600 hover:text-rose-800 underline"
        >
          Inicia sesión
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Register;