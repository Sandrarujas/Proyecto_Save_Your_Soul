"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import styles from "../styles/EditProfileModal.module.css"
import { AuthContext } from "../context/AuthContext"

const BASE_URL = process.env.REACT_APP_API_BASE_URL

const EditProfileModal = ({ isOpen, onClose, profile, onProfileUpdate }) => {
  const { updateUser } = useContext(AuthContext)
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "")
      setPreviewImage(
        profile.profileImage?.startsWith("http")
          ? profile.profileImage
          : `${BASE_URL}${profile.profileImage}`
      )
      setProfileImage(null)
      setError("")
    }
  }, [profile])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 1) Actualizar bio
      const bioRes = await axios.put(
        `${BASE_URL}/api/users/bio`,
        { bio },
        { withCredentials: true }
      )

      // 2) Preparamos la URL final del avatar
      let newAvatar = profile.profileImage

      // 3) Si hay imagen nueva, la subimos en multipart/form-data
      if (profileImage) {
        const fd = new FormData()
        fd.append("profileImage", profileImage)

        const imgRes = await axios({
          method: "put",
          url: `${BASE_URL}/api/users/profile-image`,
          data: fd,
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        })

        // Bust-cache con timestamp
        newAvatar = imgRes.data.profileImage + `?t=${Date.now()}`
      }

      // 4) Actualizamos el contexto global y el estado del padre
      updateUser({ bio: bioRes.data.bio, profileImage: newAvatar })
      onProfileUpdate({ bio: bioRes.data.bio, profileImage: newAvatar })

      onClose()
    } catch (err) {
      console.error("Error al actualizar perfil:", err)
      setError(
        err.response?.data?.message ||
          "Error al actualizar el perfil. Inténtalo de nuevo."
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.editProfileModal}>
        <div className={styles.modalHeader}>
          <h2>Editar Perfil</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
          >
            &times;
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.profileImageUpload}>
            <label>Foto de Perfil</label>
            <img
              src={previewImage || "/placeholder.svg?height=150&width=150"}
              alt="Vista previa"
              className={styles.previewImage}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
          </div>

          <div>
            <label>Biografía</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Escribe algo sobre ti..."
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <small>{bio.length}/500 caracteres</small>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? "Guardando…" : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal
