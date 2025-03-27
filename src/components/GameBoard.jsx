import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { BsBoxArrowRight } from "react-icons/bs";
import { toast } from "react-toastify";
import "../styles/gameBoard.css";

const GameBoard = () => {
    const { codigo } = useParams();  
    const navigate = useNavigate();  
    const [partida, setPartida] = useState(null);
    const [jugadorActual, setJugadorActual] = useState(null);
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        // Esperar a que Firebase cargue el usuario
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Usuario autenticado:", user.uid);
                cargarPartida(user.uid);
            } else {
                console.error("No hay usuario autenticado.");
                navigate("/login");
            }
        });

        return () => unsubscribeAuth(); // Limpieza del listener
    }, [codigo, db, navigate]);

    const cargarPartida = (userId) => {
        if (!codigo) return;

        const partidaRef = doc(db, "partidas", codigo);

        const unsub = onSnapshot(partidaRef, (docSnap) => {
            if (docSnap.exists()) {
                const partidaData = docSnap.data();
                setPartida(partidaData);

                // Buscar el jugador actual en la partida
                const jugador = partidaData.jugadores.find(j => j.uid === userId);
                setJugadorActual(jugador);

                if (!jugador) return;

                // Última transacción
                const ultimaTransaccion = partidaData.transacciones?.slice(-1)[0];

                if (ultimaTransaccion && ultimaTransaccion.destino === jugador.nombre) {
                    toast.info(`${ultimaTransaccion.origen} te transfirió $${ultimaTransaccion.monto}`, {
                        autoClose: 5000,
                        theme: "light",
                    });
                }
            } else {
                console.error("No se encontró la partida en Firestore.");
                navigate("/inicio"); // Redirigir si el código de la partida es inválido
            }
        });

        return () => unsub();
    };

    if (!partida) return (
        <div className="spinner-container carga">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    // Función para declarar bancarrota
    const handleBancarrota = () => {
        if (!jugadorActual) return;
        if (jugadorActual.saldo > 0) {
            alert("No puedes declararte en bancarrota si aún tienes saldo.");
            return;
        }
        navigate(`/inicio`);  
    };

    // Función para salir del juego (cerrar sesión)
    const handleSalir = async () => {
        await signOut(auth);
        navigate("/login");
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