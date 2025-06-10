// src/components/CommentList.jsx
import { Link } from "react-router-dom"
import Avatar from "./Avatar"
import styles from "../styles/Post.module.css"

const CommentList = ({ comments, photoVersion = "" }) => {
  return (
    <div className={styles["comments-list"]}>
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
  )
}

export default CommentList
