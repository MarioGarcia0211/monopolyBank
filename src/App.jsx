// import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreateGame from "./components/CreateGame";
import JoinGame from "./components/JoinGame";
import GameBoard from "./components/GameBoard";
import Transaction from "./components/Transaction";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="fondo">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/inicio" element={<Home />} />
            <Route path="/create-game" element={<CreateGame />} />
            <Route path="/join-game" element={<JoinGame />}/>
            <Route path="/partida/:codigo" element={<GameBoard/>}/>
            <Route path="/transaction" element={<Transaction/>} />
          </Routes>
          <ToastContainer />
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
