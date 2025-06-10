import { useState, useEffect } from 'react';

// Base URL de la API (con fallback)
const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const Avatar = ({ src, username, size = 40, version = '' }) => {
  const [error, setError] = useState(false);

  // Cuando cambian src o version, reseteamos error para reintentar cargar
  useEffect(() => {
    setError(false);
  }, [src, version]);

  // Construye la URL de la imagen, o devuelve el placeholder si hay error o no hay src
  const getImageUrl = () => {
    if (error || !src) {
      return `/placeholder.svg?height=${size}&width=${size}`;
    }
    const isAbsolute = src.startsWith('http') || src.startsWith('//');
    const fullUrl = isAbsolute ? src : `${BASE_URL}${src}`;
    // Agregar version para bust cache si se proporciona
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
