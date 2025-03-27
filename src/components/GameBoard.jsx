import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { BsBoxArrowRight } from "react-icons/bs";
import "../styles/gameBoard.css";


const GameBoard = () => {
    const { codigo } = useParams(); 
    const navigate = useNavigate(); 
    const [partida, setPartida] = useState(null);
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const partidaRef = doc(db, "partidas", codigo);

        // Escuchar cambios en la partida en tiempo real
        const unsub = onSnapshot(partidaRef, (docSnap) => {
            if (docSnap.exists()) {
                setPartida(docSnap.data());
            }
        });

        return () => unsub();
    }, [codigo, db]);

    if (!partida) return <h2>Cargando partida...</h2>;

    const jugadorActual = partida.jugadores.find(j => j.uid === auth.currentUser?.uid);

    // Función para declarar bancarrota
    const handleBancarrota = async () => {
        if (!jugadorActual) return;

        if (jugadorActual.saldo > 0) {
            alert("No puedes declararte en bancarrota si aún tienes saldo.");
            return;
        }
            // Redirige al inicio del juego pero no cierra la sesión 
        navigate(`/inicio`); 
    };

    // Función para salir del juego (cerrar sesión)
    const handleSalir = async () => {
        await signOut(auth);
        navigate("/login"); // Redirige al login
    };

    return (
        <div className="container-game">
            <div className="card card-game">
                <div className="card-body-game">
                    <h4>{jugadorActual?.nombre || "Jugador"}</h4>
                    <h4 className="text-center">${jugadorActual?.saldo || 0}</h4>
                    <hr />

                    <h5 className="text-center">Lista de participantes</h5>
                    <ul className="list-group">
                        {partida.jugadores
                            .filter(p => p.uid !== jugadorActual?.uid)
                            .map((p, index) => (
                                <li key={index} className="list-group-item d-flex justify-content-between">
                                    {p.nombre} <span>${p.saldo}</span>
                                </li>
                            ))}
                    </ul>



                    <div className="d-flex justify-content-between mt-3 gap-2">

                        <div className="dropdown">
                            <button className="btn btn-secondary btn-despegable dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <BsBoxArrowRight />
                            </button>
                            <ul className="dropdown-menu">
                                <li><button className="dropdown-item" onClick={handleBancarrota}>Bancarrota</button></li>
                                <li><button className="dropdown-item" onClick={handleSalir}>Salir del juego</button></li>
                            </ul>
                        </div>
                        <button className="btn btn-primary btn-transacciones">
                            <Link to={`/transaction/${codigo}`} className="text-white text-decoration-none">
                                Transacciones
                            </Link>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
