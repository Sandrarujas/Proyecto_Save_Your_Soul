"use client";

import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Avatar from "./Avatar";
import { AuthContext } from "../context/AuthContext";
import styles from "../styles/Post.module.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const CommentList = ({ comments: initialComments, postId, photoVersion = "" }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${postId}/comments`,
        { content },
        { headers: { "Content-Type": "application/json" } }
      );

      // Si el back no envía username/foto, complétalo con el usuario logueado
      const fullComment = data.user?.username
        ? data
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

      setComments((prev) => [fullComment, ...prev]);
      setContent("");
    } catch {
      setError("No se pudo publicar el comentario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["comments-list"]}>
      {/* Formulario — solo UNO */}
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

      {comments.length ? (
        comments.map((comment) => (
          <div key={comment.id} className={styles.comment}>
            <div className={styles["comment-header"]}>
              <Link to={`/profile/${comment.user.username}`} className={styles["comment-user"]}>
                <Avatar
                  src={comment.user.profileImage}
                  username={comment.user.username}
                  size={30}
                  version={photoVersion}
                  className={styles["comment-user-image"]}
                />
                <span className={styles["comment-username"]}>{comment.user.username}</span>
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
