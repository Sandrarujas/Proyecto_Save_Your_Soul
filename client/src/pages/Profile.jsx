// src/pages/Profile.jsx
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Post from "../components/Post";
import EditProfileModal from "../components/EditProfileModal";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const Profile = () => {
  const { username } = useParams();
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const isOwnProfile = user?.id === profile?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: prof }, { data: postsRes }] = await Promise.all([
          axios.get(`${BASE_URL}/api/users/${username}`, { withCredentials: true }),
          axios.get(`${BASE_URL}/api/posts/user/${username}`, { withCredentials: true }),
        ]);
        setProfile(prof);
        setPosts(postsRes);
      } catch (err) {
        console.error(err);
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  const handleProfileUpdate = (upd) => {
    setProfile((p) => ({ ...p, ...upd }));
    if (upd.profileImage) {
      setPosts((ps) =>
        ps.map((pt) =>
          pt.user.id === profile.id
            ? { ...pt, user: { ...pt.user, profileImage: upd.profileImage } }
            : pt
        )
      );
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts((ps) => ps.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handlePostDelete = (postId) => {
    setPosts((ps) => ps.filter((p) => p.id !== postId));
  };

  if (loading)  return <div>Cargando perfil…</div>;
  if (error)    return <div className="error">{error}</div>;
  if (!profile) return <div>Usuario no encontrado</div>;

  return (
    <div className="profile-container">
      {/* Cabecera de perfil… */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}

      <section className="posts-section">
        {posts.length ? (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
            />
          ))
        ) : (
          <p>No tienes publicaciones aún.</p>
        )}
      </section>
    </div>
  );
};

export default Profile;
