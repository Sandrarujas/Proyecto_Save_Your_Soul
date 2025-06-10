"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Avatar from "./Avatar"
import styles from "../styles/Notifications.module.css"

const NotificationList = () => {
  const {
    notifications,
    unreadCount,
    notificationsLoading,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useContext(AuthContext)

  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (showDropdown) {
      fetchNotifications().catch(() => {
        setError("No se pudieron cargar las notificaciones")
      })
    }
  }, [showDropdown, fetchNotifications])

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev)
    setError("")
  }

  const renderNotificationContent = (notification) => {
    const { type, senderUsername, commentContent } = notification
    switch (type) {
      case "like":
        return `${senderUsername} le dio like a tu publicación`
      case "comment":
        return commentContent
          ? `${senderUsername} comentó: "${commentContent}"`
          : `${senderUsername} comentó en tu publicación`
      case "follow":
        return `${senderUsername} comenzó a seguirte`
      default:
        return `Nueva notificación de ${senderUsername}`
    }
  }

  const renderNotificationLink = (notification) => {
    const { type, postId, commentId, senderUsername } = notification
    switch (type) {
      case "like":
        return postId ? `/post/${postId}` : `/profile/${senderUsername}`
      case "comment":
        return postId
          ? `/post/${postId}#comment-${commentId}`
          : `/profile/${senderUsername}`
      case "follow":
        return `/profile/${senderUsername}`
      default:
        return "#"
    }
  }

  const renderNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <i className={`fas fa-heart ${styles["notification-icon"]} ${styles.like}`}></i>
      case "comment":
        return <i className={`fas fa-comment ${styles["notification-icon"]} ${styles.comment}`}></i>
      case "follow":
        return <i className={`fas fa-user-plus ${styles["notification-icon"]} ${styles.follow}`}></i>
      default:
        return <i className={`fas fa-bell ${styles["notification-icon"]}`}></i>
    }
  }

  return (
    <div className={styles["notification-container"]}>
      {/* Icono de campana con contador */}
      <div
        className={styles["notification-bell"]}
        onClick={toggleDropdown}
        role="button"
        tabIndex={0}
        aria-label="Mostrar notificaciones"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className={styles["notification-badge"]}>{unreadCount}</span>
        )}
      </div>

      {/* Dropdown de notificaciones */}
      {showDropdown && (
        <div className={styles["notification-dropdown"]}>
          <div className={styles["notification-header"]}>
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                className={styles["mark-all-read"]}
                onClick={markAllNotificationsAsRead}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {notificationsLoading ? (
            <div className={styles["notification-loading"]}>Cargando…</div>
          ) : error ? (
            <div className={styles["notification-error"]}>{error}</div>
          ) : notifications.length > 0 ? (
            <div className={styles["notification-list"]}>
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={renderNotificationLink(notification)}
                  className={`${styles["notification-item"]} ${!notification.isRead ? styles["unread"] : ""}`}
                  onClick={() => !notification.isRead && markNotificationAsRead(notification.id)}
                >
                  <div className={styles["notification-avatar"]}>
                    <Avatar
                      src={notification.senderProfileImage}
                      username={notification.senderUsername}
                      size={40}
                    />
                    {renderNotificationIcon(notification.type)}
                  </div>

                  <div className={styles["notification-content"]}>
                    <p>{renderNotificationContent(notification)}</p>
                    <span className={styles["notification-time"]}>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {!notification.isRead && (
                    <div className={styles["notification-dot"]}></div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles["notification-empty"]}>No tienes notificaciones</div>
          )}

          <div className={styles["notification-footer"]}>
            <Link to="/notifications" className={styles["view-all"]}>
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationList;
