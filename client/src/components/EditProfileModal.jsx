import { useState, useEffect } from "react"
import axios from "axios"
import styles from "../styles/EditProfileModal.module.css"

// Elimina cualquier pragma especial de Next.js
const BASE_URL = process.env.REACT_APP_API_BASE_URL || ""

const EditProfileModal = ({ isOpen, onClose, profile, onProfileUpdate }) => {
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "")
      setPreviewImage(getImageUrl(profile.profileImage))
      setProfileImage(null)
      setError("")
    }
  }, [profile])

  const getImageUrl = (imagePath) => {
    if (!imagePath) return ""
    if (imagePath.startsWith("http") || imagePath.startsWith("//")) return imagePath
    return `${BASE_URL}${imagePath}`
  }

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
      const bioResponse = await axios.put(
        `${BASE_URL}/api/users/bio`,
        { bio },
        { withCredentials: true }
      )

      let imageResponse = null
      if (profileImage) {
        // 2) Enviar nueva imagen
        const formData = new FormData()
        formData.append("profileImage", profileImage)
        imageResponse = await axios.patch(
          `${BASE_URL}/api/users/profile-image`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true
          }
        )
      }

      // 3) Actualizar en el padre
      onProfileUpdate({
        bio: bioResponse.data.bio,
        profileImage: imageResponse
          ? imageResponse.data.profileImage
          : profile.profileImage,
      })

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
          <button onClick={onClose} disabled={loading} className={styles.closeButton}>
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
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/placeholder.svg?height=150&width=150"
              }}
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
            <button type="button" onClick={onClose} disabled={loading} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className={styles.saveButton}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal
