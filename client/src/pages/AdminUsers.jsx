"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import styles from "../styles/Admin.module.css"
import { useNavigate } from "react-router-dom"  

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminUsers = () => {

  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("") 

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  const fetchUsers = async (page = 1) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${BASE_URL}/api/admin/users?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
        setPagination({ total: data.length, pages: 1 }) 
      } else {
        const errorText = await response.text()
        console.error("Error en la respuesta:", response.status, errorText)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchUsers(currentPage)
        alert("Usuario eliminado correctamente")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error al eliminar el usuario")
    }
  }

  if (loading) {
    return <div className={styles["admin-loading"]}>Cargando usuarios...</div>
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={styles["admin-users"]}>
      <button 
      className={styles["admin-btn"]} 
      onClick={() => navigate(-1)}  
      style={{ marginBottom: "10px" }}
      >
               ← Volver atrás
      </button>
      <div className={styles["admin-header"]}>
        <h1>Gestión de Usuarios</h1>
        <p>Total: {pagination.total} usuarios</p>
        <button onClick={() => fetchUsers(currentPage)} className={styles["admin-btn"]}>
          Recargar
        </button>
        <input
          type="text"
          placeholder="Filtrar por nombre de usuario"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles["filter-input"]}
        />
      </div>

      <div className={styles["users-table"]}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles["role-badge"]} ${styles[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles["user-actions"]}>
                      {isAdmin() && user.role !== "admin" && (
                        <button
                          className={`${styles["action-btn"]} ${styles["delete"]}`}
                          onClick={() => deleteUser(user.id, user.username)}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No se encontraron usuarios con ese nombre.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles["pagination"]}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {pagination.pages}
        </span>
        <button
          disabled={currentPage === pagination.pages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default AdminUsers
