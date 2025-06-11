// src/components/Post.jsx
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import CommentList from "./CommentList";
import EditPostModal from "./EditPostModal";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const Post = ({ post, onPostUpdate, onPostDelete }) => {
  const { user, updatePostLikes, updatePostComments, deletePost: deleteFromCtx } = useContext(AuthContext);

  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(post.liked);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [loadingComments, setLoadingComments] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === post.user.id;
  const imgUrl = post.image?.startsWith("http")
    ? post.image
    : `${BASE_URL}${post.image}`;

  async function handleLike() {
    await axios.post(`${BASE_URL}/api/posts/${post.id}/like`, {}, { withCredentials: true });
    const nl = !liked, cnt = nl ? likes + 1 : likes - 1;
    setLiked(nl); setLikes(cnt);
    updatePostLikes(post.id, nl, cnt);
    onPostUpdate({ ...post, liked: nl, likes: cnt });
  }

  async function handleDelete() {
    if (!window.confirm("¿Eliminar esta publicación?")) return;
    setIsDeleting(true);
    await axios.delete(`${BASE_URL}/api/posts/${post.id}`, { withCredentials: true });
    deleteFromCtx(post.id);
    onPostDelete(post.id);
  }

  const openEdit = () => { setShowOptions(false); setIsEditOpen(true); };
  const applyEdit = (upd) => { setImageError(false); onPostUpdate(upd); setIsEditOpen(false); };

  return (
    <div className="post-card">
      <header>
        <Link to={`/profile/${post.user.username}`}>
          <img
            src={post.user.profileImage ? `${BASE_URL}${post.user.profileImage}` : "/placeholder.svg"}
            alt={post.user.username}
            className="avatar"
            onError={() => setImageError(true)}
          />
          <span>{post.user.username}</span>
        </Link>
        {isOwner && (
          <div className="options">
            <button onClick={() => setShowOptions((v) => !v)}>⋮</button>
            {showOptions && (
              <>
                <button onClick={openEdit} disabled={isDeleting}>Editar</button>
                <button onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Eliminando…" : "Eliminar"}
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <p>{post.content}</p>
      {imgUrl && !imageError && (
        <img
          src={imgUrl}
          alt="Post"
          className="post-image"
          onError={() => setImageError(true)}
        />
      )}

      <footer>
        <button onClick={handleLike}>{liked ? "❤️" : "🤍"} {likes}</button>
        <button onClick={() => setShowComments((v) => !v)}>💬 {commentCount}</button>
      </footer>

      {showComments && (
        <CommentList
  comments={comments}
  postId={post.id}
  onNewComment={(newComment) => {
    console.log("CRUDO DEL BACK-END →", newComment);

    // 1️⃣  Mete el comentario que llega TAL CUAL
    setComments(prev => [newComment, ...prev]);

    // 2️⃣  Suma uno al contador asegurándote de usar el valor fresco
    setCommentCount(prev => prev + 1);

    // 3️⃣  Si mantienes tu helper de contexto…
    updatePostComments(post.id, commentCount + 1);      // (o cámbialo a prev + 1)

    // 4️⃣  Notifica al padre (feed) con el mismo objeto que acabamos de guardar
    onPostUpdate(prevPost => ({
      ...prevPost,
      comments: [newComment, ...prevPost.comments],
      commentCount: prevPost.commentCount + 1,
    }));
  }}
/>

      )}

      {isEditOpen && (
        <EditPostModal
          isOpen={isEditOpen}
          post={post}
          onClose={() => setIsEditOpen(false)}
          onPostUpdate={applyEdit}
        />
      )}
    </div>
  );
};

export default Post;
