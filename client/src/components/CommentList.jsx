// src/components/CommentList.jsx
"use client";

import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Avatar from "./Avatar";
import { AuthContext } from "../context/AuthContext";
import styles from "../styles/Post.module.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const CommentList = ({
  comments: initialComments,
  postId,
  photoVersion = "",
}) => {
  const { user } = useContext(AuthContext);          // usuario logueado

  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ────────────── enviar comentario ────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      /* 1. POST al backend */
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${postId}/comments`,
        { content },
        { headers: { "Content-Type": "application/json" } }
      );

      /* 2. Completar si el back no envía username/foto */
      const fullComment = data.user?.username
        ? data                                // ya viene “poblado”
        : {
            ...data,
            user: {
              id: user.id,
              username: user.username,
              profileImage: user.profileImage?.startsWith("http")
                ? user.profileImage
                : `${BASE_URL}${user.profileImage}`,
            },
          };

      /* 3. Insertar al principio de la lista */
      setComments((prev) => [fullComment, ...prev]);
      setContent("");
    } catch (err) {
      console.error(err);
      setError("No se pudo publicar el comentario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["comments-list"]}>
      {/* ─── Formulario ─────────────────────────── */}
      <form onSubmit={handleSubmit} className={styles["comment-form"]}>
        <input
          type="text"
          className={styles["comment-input"]}
          placeholder="Escribe un comentario…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="submit"
          className={styles["comment-submit"]}
          disabled={loading || !content.trim()}
        >
          {loading ? "…" : "Publicar"}
        </button>
      </form>

      {error && <p className={styles["error"]}>{error}</p>}

      {/* ─── Lista de comentarios ───────────────── */}
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className={styles.comment}>
            <div className={styles["comment-header"]}>
              <Link
                to={`/profile/${comment.user.username}`}
                className={styles["comment-user"]}
              >
                <Avatar
                  src={comment.user.profileImage}
                  username={comment.user.username}
                  size={30}
                  version={photoVersion}
                  className={styles["comment-user-image"]}
                />
                <span className={styles["comment-username"]}>
                  {comment.user.username}
                </span>
              </Link>
              <span className={styles["comment-date"]}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className={styles["comment-content"]}>
              <p>{comment.content}</p>
            </div>
          </div>
        ))
      ) : (
        <p className={styles["no-comments"]}>No hay comentarios aún.</p>
      )}
    </div>
  );
};

export default CommentList;
