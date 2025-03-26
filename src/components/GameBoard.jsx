import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../styles/gameBoard.css";

const GameBoard = () => {
    const { codigo } = useParams(); // Obtiene el código de la URL
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
                            .filter(p => p.uid !== jugadorActual?.uid) // Filtra al jugador actual
                            .map((p, index) => (
                                <li key={index} className="list-group-item d-flex justify-content-between">
                                    {p.nombre} <span>${p.saldo}</span>
                                </li>
                            ))}
                    </ul>


                    <div className="d-flex justify-content-between mt-3">
                        <div className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Opciones
                            </button>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">Bancarrota</a></li>
                                <li><a className="dropdown-item" href="#">Salir del juego</a></li>
                            </ul>
                        </div>
                        <button className="btn btn-primary">Transacciones</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameBoard;