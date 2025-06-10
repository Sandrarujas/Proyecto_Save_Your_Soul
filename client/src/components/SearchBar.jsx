"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaSearch, FaTimes } from "react-icons/fa"
import styles from "../styles/SearchBar.module.css"

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  // Al abrir en móvil, enfocamos el input
  useEffect(() => {
    if (mobileOpen) {
      const inp = document.getElementById("mobile-search-input")
      if (inp) inp.focus()
    }
  }, [mobileOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
      setSearchTerm("")
      setMobileOpen(false)
    }
  }

  return (
    <div className={styles.searchWrapper}>
      {/* Botón lupa para móvil */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
      >
        {mobileOpen ? <FaTimes /> : <FaSearch />}
      </button>

      {/* Formulario: siempre visible en desktop, sólo al abrir en móvil */}
      <form
        onSubmit={handleSubmit}
        className={`${styles.searchForm} ${
          mobileOpen ? styles.open : ""
        }`}
      >
        <input
          id={mobileOpen ? "mobile-search-input" : undefined}
          type="text"
          placeholder="Buscar usuarios o publicaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          <FaSearch />
        </button>
      </form>
    </div>
  )
}

export default SearchBar
