import { useEffect, useRef, useCallback } from 'react';
import useAuthStore from './authStore';

/**
 * Hook personalizado para detectar inactividad del usuario
 * Cierra sesión automáticamente después del tiempo especificado sin actividad
 * y redirige directamente al login
 * 
 * @param {number} inactivityTime - Tiempo de inactividad en milisegundos (default: 4 horas)
 */
const useInactivityLogout = (inactivityTime = 4 * 60 * 60 * 1000) => { // 4 horas por defecto
  const logout = useAuthStore((state) => state.logout);
  const timeoutRef = useRef(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // ✅ Usar useCallback para estabilizar la función
  const resetTimer = useCallback(() => {
    // Limpiar el timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Solo configurar el timer si el usuario está autenticado
    if (isAuthenticated) {
      // Configurar nuevo timeout
      timeoutRef.current = setTimeout(() => {
        // ✅ Solo logueamos en desarrollo
        if (import.meta.env.DEV) {
          console.log('Sesión cerrada por inactividad - Redirigiendo al login');
        }
        logout();
        // Redirigir directamente al login
        window.location.href = '/login';
      }, inactivityTime);
    }
  }, [isAuthenticated, inactivityTime, logout]); // ✅ Incluir logout en dependencias

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Eventos que detectan actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Iniciar el timer
    resetTimer();

    // Agregar event listeners para detectar actividad
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup: remover event listeners y limpiar timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, resetTimer]); // ✅ resetTimer ya incluye todas las dependencias necesarias

  return null;
};

export default useInactivityLogout;