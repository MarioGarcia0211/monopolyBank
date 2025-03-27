// import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreateGame from "./components/CreateGame";
import JoinGame from "./components/JoinGame";
import GameBoard from "./components/GameBoard";
import Transaction from "./components/Transaction";
import { auth } from "./firebase";

function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Escuchar cambios en la autenticación de Firebase
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Guarda el usuario si está autenticado
    });

    return () => unsubscribe(); // Limpia la suscripción cuando el componente se desmonta
  }, []);


  return (
    <>
      <BrowserRouter>
        <div className="fondo">
          <Routes>
            <Route path="/" element={user ? <Home /> : <Navigate to="/login" />}/>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            
            <Route path="/inicio" element={<Home />} />
            <Route path="/create-game" element={<CreateGame />} />
            <Route path="/join-game" element={<JoinGame />} />
            <Route path="/partida/:codigo" element={<GameBoard />} />
            <Route path="/transaction/:codigo" element={<Transaction />} />
          </Routes>
          <ToastContainer />
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
