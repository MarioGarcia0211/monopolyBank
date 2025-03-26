import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  const auth = getAuth();
  const db = getFirestore();

  // Función para verificar si el nombre de usuario ya existe
  const verificarNombreUnico = async (nombre) => {
    const q = query(collection(db, "usuarios"), where("name", "==", nombre));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Retorna true si el nombre ya está en uso
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Todos los campos son obligatorios", { autoClose: 3000, theme: "light" });
      return;
    }

    try {
      // Verificar si el nombre ya está en uso
      const existeNombre = await verificarNombreUnico(name);
      if (existeNombre) {
        toast.error("El nombre de usuario ya está en uso.", { autoClose: 3000, theme: "light" });
        return;
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Actualizar el perfil del usuario con el nombre
      await updateProfile(user, { displayName: name });

      // Guardar datos en Firestore con el uid como ID del documento
      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        name,
        email,
      });

      toast.success("Registro exitoso. Inicia sesión.", { autoClose: 3000, theme: "light" });
      navigate("/login");
    } catch (error) {
      handleAuthError(error.code);
    }
  };

  const handleAuthError = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        toast.error("El correo ya está registrado.");
        break;
      case "auth/invalid-email":
        toast.error("Correo inválido.");
        break;
      case "auth/weak-password":
        toast.error("La contraseña debe tener al menos 6 caracteres.");
        break;
      default:
        toast.error("Error al registrar. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="container-register">
      <div className="card card-register mx-auto">
        <div className="card-body card-body-register">
          <h2 className="text-center">Registro</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label">Nombre de usuario</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                Registrarse
              </button>
            </div>
          </form>
          <p className="text-center mt-3">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;