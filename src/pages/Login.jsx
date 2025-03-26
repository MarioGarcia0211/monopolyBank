import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/login.css";
import { auth } from "../firebase";

function Login() {
  // Estados para almacenar el correo y la contraseña ingresados por el usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Maneja el envío del formulario de inicio de sesión
  function handleLogin(e) {
    // Evita el recargo de la página
    e.preventDefault();

    // Validación: verificar que los campos no estén vacíos
    if (!email || !password) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    // Autenticación con Firebase
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Notificación de éxito
        toast.success("Inicio de sesión exitoso");
        // Redirige al usuario a la página de inicio
        navigate("/inicio");
      })
      .catch((error) => {
        console.error("Error al iniciar sesión:", error);
        handleAuthError(error.code);
      });
  }

  // Manejo de errores de autenticación basado en los códigos de Firebase
  function handleAuthError(errorCode) {
    switch (errorCode) {
      case "auth/invalid-credential":
        toast.error("Correo o contraseña incorrectos");
        break;
      case "auth/user-not-found":
        toast.error("El usuario no está registrado");
        break;
      case "auth/wrong-password":
        toast.error("Contraseña incorrecta");
        break;
      case "auth/invalid-email":
        toast.error("Correo no válido");
        break;
      case "auth/user-disabled":
        toast.error("Este usuario ha sido deshabilitado");
        break;
      default:
        toast.error("Error al iniciar sesión. Inténtalo nuevamente.");
        break;
    }
  }

  return (
    <div className="container-login">
      <div className="card card-login">
        <div className="card-body card-body-login">
          <h1 className="text-center">Iniciar Sesión</h1>

          <form onSubmit={handleLogin}>
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
                Iniciar Sesión
              </button>
            </div>
          </form>

          <p className="mt-3 text-center">
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;