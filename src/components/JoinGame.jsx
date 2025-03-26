import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/joinGame.css";
import { toast } from "react-toastify";

const JoinGame = () => {
    const [codigoIngresado, setCodigoIngresado] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [esperandoInicio, setEsperandoInicio] = useState(false);
    const [partidaIniciada, setPartidaIniciada] = useState(false);
    const [jugadores, setJugadores] = useState([]);
    const [saldo, setSaldo] = useState(1500); // Saldo inicial

    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();

    const unirseAPartida = async () => {
        if (!codigoIngresado) {
            toast.error("Ingresa un código valido.", { autoClose: 3000, theme: "light" });
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            setMensaje("Debes iniciar sesión.");
            toast.error("Debes iniciar sesión.", { autoClose: 3000, theme: "light" });
            return;
        }

        const { displayName, uid } = user;
        const jugadorActual = displayName || "Jugador";

        const partidaRef = doc(db, "partidas", codigoIngresado);
        const partidaSnap = await getDoc(partidaRef);

        if (partidaSnap.exists()) {
            const partidaData = partidaSnap.data();

            // Verificar si el jugador ya está en la partida por UID
            const jugadorExiste = partidaData.jugadores.some(j => j.uid === uid);

            if (jugadorExiste) {
                setMensaje("Ya estás en esta partida.");
                toast.info("Ya estás en esta partida.", { autoClose: 3000, theme: "light" });
                return;
            }

            // Agregar el jugador con nombre, saldo inicial y UID
            const nuevoJugador = { nombre: jugadorActual, saldo: 1500, uid };

            await updateDoc(partidaRef, {
                jugadores: [...partidaData.jugadores, nuevoJugador],
            });

            setEsperandoInicio(true);
            toast.success("Te has unido a la partida.", { autoClose: 3000, theme: "light" });
            setMensaje("Te has unido a la partida. Esperando que el anfitrión inicie...");

            // Escuchar cambios en la partida
            onSnapshot(partidaRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setJugadores(data.jugadores);

                    const miJugador = data.jugadores.find(j => j.uid === uid);
                    if (miJugador) setSaldo(miJugador.saldo);

                    if (data.estado === "iniciada") {
                        setPartidaIniciada(true);
                        setEsperandoInicio(false);
                    }
                }
            });
        } else {
            toast.error("La partida no existe.", { autoClose: 3000, theme: "light" });
        }
    };

    // 👇 Redirigir cuando la partida se inicia
    useEffect(() => {
        if (partidaIniciada) {
            navigate("/partida/" + codigoIngresado);
        }
    }, [partidaIniciada, navigate]);

    return (
        <div className="container-join text-center">
            <div className="card card-join">
                <div className="card-body-join">
                    <h3>Unirse a una partida</h3>
                    <input
                        type="text"
                        className="form-control my-2"
                        placeholder="Código de la partida"
                        value={codigoIngresado}
                        onChange={(e) => setCodigoIngresado(e.target.value)}
                        disabled={esperandoInicio}
                    />

                    <div className="d-grid">
                        <button className="btn btn-success" onClick={unirseAPartida} disabled={esperandoInicio}>
                            {esperandoInicio ? "Esperando..." : "Unirse"}
                        </button>

                        <button className="btn btn-danger mt-2" onClick={() => navigate("/inicio")}>
                            Cancelar
                        </button>
                    </div>


                    {esperandoInicio && (
                        <div className="mt-3">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Esperando...</span>
                            </div>
                        </div>
                    )}

                    {mensaje && <p className="mt-2">{mensaje}</p>}
                </div>
            </div>
        </div>
    );
};

export default JoinGame;