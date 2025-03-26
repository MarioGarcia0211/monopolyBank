import React, { useState, useEffect, useRef } from "react";
import {
    getFirestore,
    doc,
    setDoc,
    query,
    collection,
    where,
    getDocs,
    updateDoc,
    onSnapshot
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/createGame.css";

const CreateGame = () => {
    const [codigo, setCodigo] = useState("");
    const [participantes, setParticipantes] = useState([]);
    const [estado, setEstado] = useState("No iniciada");

    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();

    const isExecuted = useRef(false);

    const generarCodigo = () => Math.floor(1000 + Math.random() * 9000).toString();

    useEffect(() => {
        if (isExecuted.current) return;
        isExecuted.current = true;

        const verificarYCrearPartida = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const userNombre = user.displayName || "Jugador";

            // Consulta si el usuario tiene una partida existente
            const partidasQuery = query(collection(db, "partidas"), where("uidCreador", "==", user.uid));
            const querySnapshot = await getDocs(partidasQuery);

            if (!querySnapshot.empty) {
                const partidaExistente = querySnapshot.docs[0].data();

                // Si la partida aún no ha terminado, continuar en ella
                if (partidaExistente.estado === "No iniciada" || partidaExistente.estado === "iniciada") {
                    setCodigo(partidaExistente.codigo);
                    setParticipantes(partidaExistente.jugadores);
                    setEstado(partidaExistente.estado);

                    // Si la partida ya está iniciada, redirigir automáticamente
                    if (partidaExistente.estado === "iniciada") {
                        navigate(`/partida/${partidaExistente.codigo}`);
                    }

                    return;
                }
            }

            // Si no hay partidas activas, crear una nueva
            const nuevoCodigo = generarCodigo();
            const partidasRef = doc(db, "partidas", nuevoCodigo);

            await setDoc(partidasRef, {
                codigo: nuevoCodigo,
                estado: "No iniciada",
                uidCreador: user.uid,
                usuarioCreador: userNombre,
                jugadores: [
                    { uid: user.uid, nombre: userNombre, saldo: 1500 }
                ]
            });

            setCodigo(nuevoCodigo);
            setParticipantes([{ uid: user.uid, nombre: userNombre, saldo: 1500 }]);
            setEstado("No iniciada");

            // Escuchar cambios en la partida
            const unsub = onSnapshot(partidasRef, (docSnap) => {
                if (docSnap.exists()) {
                    setParticipantes(docSnap.data().jugadores);
                    setEstado(docSnap.data().estado);

                    if (docSnap.data().estado === "iniciada") {
                        navigate(`/partida/${nuevoCodigo}`);
                    }
                }
            });

            return () => unsub();
        };

        verificarYCrearPartida();
    }, [navigate]);

    const copiarCodigo = () => {
        navigator.clipboard.writeText(codigo);
        alert("Código copiado: " + codigo);
    };

    const iniciarPartida = async () => {
        const partidaRef = doc(db, "partidas", codigo);
        await updateDoc(partidaRef, { estado: "iniciada" });
    };

    return (
        <div className="container-create text-center">
            <div className="card card-create">
                <div className="card-body card-body-create">
                    <h3 className="me-2">Código: {codigo}</h3>

                    <h5>Estado de la partida: <span className="badge bg-info">{estado}</span></h5>

                    <h4>Lista de participantes</h4>
                    <ul className="list-group">
                        {participantes.map((p, index) => (
                            <li key={index} className="list-group-item">
                                {p.nombre} - ${p.saldo}
                            </li>
                        ))}
                    </ul>

                    {estado === "No iniciada" && (
                        <div className="d-grid">
                            <button className="btn btn-primary mt-3" onClick={iniciarPartida}>
                                Iniciar partida
                            </button>
                            <button className="btn btn-danger mt-3" onClick={() => navigate("/inicio")}>
                                Volver
                            </button>
                        </div>

                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateGame;