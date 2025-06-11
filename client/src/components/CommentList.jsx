// src/components/CommentList.jsx
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Avatar from "./Avatar";
import { AuthContext } from "../context/AuthContext";
import styles from "../styles/Post.module.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const CommentList = ({
  comments: initialComments,
  postId,                 // ← ⬅︎ lo pasas desde Post.jsx
  onNewComment,           // ← ⬅︎ opcional: notificar al padre
  photoVersion = "",
}) => {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const { user } = useContext(AuthContext);        // usuario logueado

  // ────────────────────────────────────────────────────────────
  // Publicar un comentario
  // ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    // 1. Envía el comentario al backend
    const { data } = await axios.post(
      `${BASE_URL}/api/posts/${postId}/comments`,
      { content },
      { withCredentials: true }
    );

    // 2. Completa el objeto con los datos del usuario logueado
    const fullComment = {
      ...data,
      user: {
        id: user.id,
        username: user.username,
        profileImage: user.profileImage?.startsWith("http")
          ? user.profileImage
          : `${BASE_URL}${user.profileImage}`,
      },
    };

    // 3. Inserta el comentario en la lista
    setComments((prev) => [fullComment, ...prev]);

    // 4. Limpia el input y avisa al padre si hace falta
    setContent("");
    onNewComment && onNewComment(fullComment);
  };

  return (
    <div className={styles["comments-list"]}>
      {/* Formulario para escribir un comentario */}
      <form onSubmit={handleSubmit} className={styles["comment-form"]}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un comentario…"
          className={styles["comment-input"]}
        />
        <button type="submit" className={styles["comment-submit"]}>
          Publicar
        </button>
      </form>

      {/* Lista de comentarios */}
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
