import React, { useState, useEffect, useRef } from "react";
import {
    getFirestore,
    doc,
    setDoc,
    updateDoc,
    onSnapshot
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { BsFiles } from "react-icons/bs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

        const crearNuevaPartida = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const userNombre = user.displayName || "Jugador";
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

        crearNuevaPartida();
    }, [navigate]);

    const copiarCodigo = () => {
        navigator.clipboard.writeText(codigo);
        toast.success("Código copiado al portapapeles!", {
            autoClose: 2000,
            theme: "light",
        });
    };

    const iniciarPartida = async () => {
        const partidaRef = doc(db, "partidas", codigo);
        await updateDoc(partidaRef, { estado: "iniciada" });
    };

    return (
        <div className="container-create text-center">
            <div className="card card-create">
                <div className="card-body card-body-create">
                    <h3 className="codigo-container">
                        Código: <span>{codigo}</span>
                        <button className="btn btn-outline-secondary" onClick={copiarCodigo}>
                            <BsFiles />
                        </button>
                    </h3>

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