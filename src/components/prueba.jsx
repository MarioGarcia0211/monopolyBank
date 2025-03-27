import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";  // Importar useParams
import { getFirestore, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../styles/transaction.css";

const Transaction = () => {
    const { codigo } = useParams(); // Obtener el código de la URL
    const [monto, setMonto] = useState("");
    const [tipo, setTipo] = useState("enviar");
    const [destino, setDestino] = useState("");
    const [partida, setPartida] = useState(null);
    const [transacciones, setTransacciones] = useState([]);

    const db = getFirestore();
    const auth = getAuth();
    const usuarioActual = auth.currentUser;

    useEffect(() => {
        if (!codigo) return;  // Evita ejecutar si codigo es undefined

        const partidaRef = doc(db, "partidas", codigo);
        const unsub = onSnapshot(partidaRef, (docSnap) => {
            if (docSnap.exists()) {
                setPartida(docSnap.data());
                setTransacciones(docSnap.data().transacciones || []);
            }
        });

        return () => unsub();
    }, [codigo, db]);

    const handleConfirmar = async (e) => {
        e.preventDefault();
        if (!monto || isNaN(monto) || monto <= 0) {
            alert("Ingrese un monto válido.");
            return;
        }

        const montoNum = parseFloat(monto);
        const jugadorActual = partida?.jugadores.find(j => j.uid === usuarioActual?.uid);
        const jugadorDestino = partida?.jugadores.find(j => j.uid === destino);

        if (!jugadorActual) {
            alert("Jugador no encontrado.");
            return;
        }

        if (tipo === "enviar") {
            if (!jugadorDestino) {
                alert("Seleccione un destino válido.");
                return;
            }
            if (jugadorActual.saldo < montoNum) {
                alert("Saldo insuficiente.");
                return;
            }

            // Actualizar saldos
            jugadorActual.saldo -= montoNum;
            jugadorDestino.saldo += montoNum;
        } else if (tipo === "cobrar") {
            jugadorActual.saldo += montoNum;
        }

        // Agregar la transacción al historial
        const nuevaTransaccion = {
            id: Date.now(),
            origen: jugadorActual.nombre,
            destino: tipo === "enviar" ? jugadorDestino.nombre : "Banco",
            monto: montoNum,
            tipo: tipo
        };

        const partidaRef = doc(db, "partidas", codigo);
        await updateDoc(partidaRef, {
            jugadores: partida.jugadores,
            transacciones: [...transacciones, nuevaTransaccion]
        });

        setMonto("");
        setDestino("");
    };

    return (
        <div className="container-transaction">
            <div className="card card-transaction">
                <div className="card-body card-body-transaction">
                    <form onSubmit={handleConfirmar}>
                        <h2 className="text-center">Transacciones</h2>

                        <div className="row align-items-center">
                            <div className="col-md-4">
                                <label className="form-label">Monto</label>
                                <input 
                                    type="number"
                                    className="form-control"
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">Tipo</label>
                                <select 
                                    className="form-select"
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                >
                                    <option value="enviar">Enviar dinero</option>
                                    <option value="cobrar">Cobrar del banco</option>
                                </select>
                            </div>

                            {tipo === "enviar" && (
                                <div className="col-md-4">
                                    <label className="form-label">Destino</label>
                                    <select 
                                        className="form-select"
                                        value={destino}
                                        onChange={(e) => setDestino(e.target.value)}
                                    >
                                        <option value="">Seleccionar jugador</option>
                                        {partida?.jugadores
                                            .filter(j => j.uid !== usuarioActual?.uid)
                                            .map(j => (
                                                <option key={j.uid} value={j.uid}>
                                                    {j.nombre}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <br />

                        <div className='text-center'>
                            <button type="submit" className="btn btn-success">Confirmar</button>
                        </div>

                        <br />

                        <div className="border-top pt-3 p-0">
                            <h5 className="text-center">Historial de transacciones</h5>
                            <div className="list-group">
                                {transacciones.map((t, index) => (
                                    <div key={index} className="list-group-item d-flex justify-content-between">
                                        <div>
                                            <h6 className="mb-1">
                                                {t.origen} {t.tipo === "enviar" ? "→" : "⤴"} {t.destino}
                                            </h6>
                                            <small className="text-muted">
                                                {t.tipo === "enviar" ? "Transferencia" : "Depósito del banco"}
                                            </small>
                                        </div>
                                        <span className={`badge ${t.tipo === "enviar" ? "bg-danger" : "bg-success"}`}>
                                            {t.tipo === "enviar" ? "- $" : "+ $"}{t.monto}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Transaction;