"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/EditPostModal.module.css";   // ← módulo CSS

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const EditPostModal = ({ isOpen, onClose, post, onPostUpdate }) => {
  const [content, setContent] = useState(post.content || "");
  const [keepExistingImage, setKeepExistingImage] = useState(!!post.image);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ────────────────────────────────────────────────────────── */
  /* sync props → state                                        */
  /* ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (post) {
      setContent(post.content || "");
      setKeepExistingImage(!!post.image);
      setImage(null);
      setError("");
    }
  }, [post]);

  /* ────────────────────────────────────────────────────────── */
  /* handlers                                                  */
  /* ────────────────────────────────────────────────────────── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setKeepExistingImage(false);
    }
  };

  const handleSubmit = async (e) => {
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

      const { data } = await axios.put(
        `${BASE_URL}/api/posts/${post.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      onPostUpdate({ ...post, ...data });
      onClose();
    } catch (err) {
      console.error("Error al actualizar publicación:", err);
      setError(
        err.response?.data?.message || "Error al actualizar la publicación"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────────────────────────────── */
  /* render                                                    */
  /* ────────────────────────────────────────────────────────── */
  if (!isOpen) return null;

  return (
    <div className={styles["modal-overlay"]} onClick={onClose}>
      <div
        className={styles["edit-post-modal"]}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles["modal-header"]}>
          <h2>Editar Publicación</h2>
          <button
            type="button"
            className={styles["close-button"]}
            onClick={onClose}
          >
            &#x2715;
          </button>
        </header>

        {error && <div className={styles["error-message"]}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* contenido */}
          <div className={styles["form-group"]}>
            <label className={styles["form-label"]}>Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles["textarea"]}
              rows={4}
            />
          </div>

          {/* imagen */}
          <div className={styles["image-preview-container"]}>
            <label className={styles["keep-image"]}>
              <input
                type="checkbox"
                checked={keepExistingImage}
                onChange={(e) => setKeepExistingImage(e.target.checked)}
              />
              Mantener imagen actual
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles["file-input"]}
            />

            {/* preview si se selecciona imagen nueva */}
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className={styles["image-preview"]}
              />
            )}
          </div>

          {/* botones */}
          <div className={styles["form-actions"]}>
            <button
              type="button"
              className={styles["cancel-button"]}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles["save-button"]}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
