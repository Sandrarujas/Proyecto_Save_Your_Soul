"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/EditPostModal.module.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const EditPostModal = ({ isOpen, onClose, post, onPostUpdate }) => {
  const [content, setContent] = useState(post.content || "");
  const [keepExistingImage, setKeepExistingImage] = useState(!!post.image);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (post) {
      setContent(post.content || "");
      setKeepExistingImage(!!post.image);
      setImage(null);
      setError("");
    }
  }, [post]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setKeepExistingImage(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!content && !keepExistingImage && !image) {
      setError("La publicación debe tener contenido o imagen");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      } else if (!keepExistingImage && post.image) {
        formData.append("image", "");
      }

      const res = await axios({
        method: "put",
        url: `${BASE_URL}/api/posts/${post.id}`,
        data: formData,
        
        headers: { "Content-Type": "multipart/form-data" }
      });

      const updatedPost = {
        ...post,
        content: res.data.content,
        image: res.data.image
      };

      onPostUpdate(updatedPost);
      onClose();
    } catch (err) {
      console.error("Error al actualizar publicación:", err);
      setError(err.response?.data?.message || "Error al actualizar la publicación");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.editModal}>
        <h2>Editar Publicación</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escribe tu publicación..."
            rows={4}
          />

          <div className={styles.imageSection}>
            <label>
              <input
                type="checkbox"
                checked={keepExistingImage}
                onChange={e => setKeepExistingImage(e.target.checked)}
              />
              Mantener imagen actual
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
