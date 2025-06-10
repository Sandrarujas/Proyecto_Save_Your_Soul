import { useState, useEffect } from 'react';

// Base URL de la API (configurada en .env como REACT_APP_API_BASE_URL)
const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Componente Avatar:
 * - Muestra un placeholder si no hay src o hay error de carga
 * - Soporta URLs absolutas (http(s)://) y relativas (BASE_URL)
 * - Añade un parámetro "v" si se pasa la prop version para bust cache
 */
const Avatar = ({ src, username, size = 40, version = '' }) => {
  const [error, setError] = useState(false);

  // Cada vez que cambian src o version, reseteamos el flag de error
  useEffect(() => {
    setError(false);
  }, [src, version]);

  const getImageUrl = () => {
    // Si no hay imagen o hubo error, uso placeholder con dimensiones
    if (!src || error) {
      return `/placeholder.svg?height=${size}&width=${size}`;
    }

    // Determinar si es URL absoluta
    const isAbsolute = src.startsWith('http') || src.startsWith('//');
    const fullUrl = isAbsolute ? src : `${BASE_URL}${src}`;

    // Añadir bust cache si version está presente
    return version ? `${fullUrl}?v=${version}` : fullUrl;
  };

  return (
    <img
      src={getImageUrl()}
      alt={username || 'Usuario'}
      className="avatar-image"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
      }}
      onError={() => setError(true)}
    />
  );
};

export default Avatar;
