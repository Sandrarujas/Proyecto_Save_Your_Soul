import { useState, useEffect } from "react";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

/**
 * Avatar
 * - Si `src` es falsy o falla la carga ⇒ placeholder redondo del tamaño indicado
 * - Acepta rutas absolutas y relativas (prefijadas con BASE_URL)
 * - Añade `?v=` para bust-cache cuando pasas la prop `version`
 */
const Avatar = ({ src, username, size = 40, version = "" }) => {
  const [failed, setFailed] = useState(false);

  // Reinicia el flag cuando cambian src o version
  useEffect(() => setFailed(false), [src, version]);

  const getImageUrl = () => {
    if (!src || failed) {
      // placeholder con las mismas dimensiones
      return `/placeholder.svg?height=${size}&width=${size}`;
    }

    const absolute = src.startsWith("http") || src.startsWith("//");
    const full = absolute ? src : `${BASE_URL}${src}`;

    return version ? `${full}?v=${version}` : full;
  };

  return (
    <img
      src={getImageUrl()}
      alt=""                              
      className="avatar-image"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
      }}
      onError={() => setFailed(true)}     
    />
  );
};

export default Avatar;
