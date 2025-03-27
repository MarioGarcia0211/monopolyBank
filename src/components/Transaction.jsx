import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import "../styles/transaction.css";

const Transaction = () => {
    const { codigo } = useParams();
    const [monto, setMonto] = useState("");
    const [tipo, setTipo] = useState("enviar");
    const [destino, setDestino] = useState("");
    const [partida, setPartida] = useState(null);
    const [transacciones, setTransacciones] = useState([]);
    const [jugadorActual, setJugadorActual] = useState(null);

    const db = getFirestore();
    const auth = getAuth();
    const usuarioActual = auth.currentUser;

    useEffect(() => {
        if (!codigo) return;

        const partidaRef = doc(db, "partidas", codigo);
        const unsub = onSnapshot(partidaRef, (docSnap) => {
            if (docSnap.exists()) {
                const partidaData = docSnap.data();
                setPartida(partidaData);
                setTransacciones(partidaData.transacciones || []);

                const jugador = partidaData.jugadores.find(j => j.uid === usuarioActual?.uid);
                setJugadorActual(jugador);
            }
        });

        return () => unsub();
    }, [codigo, db, usuarioActual]);

    const handleConfirmar = async (e) => {
        e.preventDefault();
        if (!monto || isNaN(monto) || monto <= 0) {
            toast.error("Ingrese un monto válido.", { autoClose: 3000, theme: "light" });
            return;
        }

        const montoNum = parseFloat(monto);

        if (!jugadorActual) {
            toast.error("Jugador no encontrado.", { autoClose: 3000, theme: "light" });
            return;
        }

        let nuevaTransaccion = {
            id: Date.now(),
            origen: jugadorActual.nombre,
            destino: "",
            monto: montoNum,
            tipo: tipo,
            fecha: new Date().toLocaleString() // Agrega la fecha y hora
        };

        if (tipo === "enviar") {
            const jugadorDestino = partida?.jugadores.find(j => j.uid === destino);
            if (!jugadorDestino) {
                toast.error("Seleccione un destino válido.", { autoClose: 3000, theme: "light" });
                return;
            }
            if (jugadorActual.saldo < montoNum) {
                toast.error("Saldo insuficiente.", { autoClose: 3000, theme: "light" });
                return;
            }
            jugadorActual.saldo -= montoNum;
            jugadorDestino.saldo += montoNum;
            nuevaTransaccion.destino = jugadorDestino.nombre;
        } else if (tipo === "cobrar") {
            jugadorActual.saldo += montoNum;
            nuevaTransaccion.destino = "Banco";
        } else if (tipo === "pagar") {
            if (jugadorActual.saldo < montoNum) {
                toast.error("Saldo insuficiente para pagar al banco.", { autoClose: 3000, theme: "light" });
                return;
            }
            jugadorActual.saldo -= montoNum;
            nuevaTransaccion.destino = "Banco";
        }

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
                        <h4 className="text-center">Transacciones</h4>

                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <label className="form-label">Usuario Actual</label>
                                <input type="text" className="form-control" value={jugadorActual?.nombre || ""} readOnly />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Saldo</label>
                                <input type="number" className="form-control" value={jugadorActual?.saldo || 0} readOnly />
                            </div>

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
                                    <option value="pagar">Pagar al banco</option>
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
                            <div className="historial-container">
                                <div className="list-group list-group-historial">
                                    {transacciones.slice().reverse().map((t, index) => (
                                        <div key={index} className="list-group-item list-group-item-historial d-flex justify-content-between">
                                            <div>
                                                <h6 className="mb-1">
                                                    {t.tipo === "enviar" || t.tipo === "pagar" ? `${t.origen} -> ${t.destino}` : `${t.destino} -> ${t.origen}`}
                                                </h6>
                                                <small className="text-muted">
                                                    {t.tipo === "enviar" ? "Transferencia" : t.tipo === "cobrar" ? "Depósito del banco" : "Pago al banco"}
                                                </small>
                                                <br />
                                                <small className="text-muted">{t.fecha}</small> {/* Muestra la fecha de la transacción */}
                                            </div>
                                            <span className={`badge ${t.tipo === "enviar" || t.tipo === "pagar" ? "bg-danger" : "bg-success"}`}>
                                                {t.tipo === "enviar" || t.tipo === "pagar" ? "- $" : "+ $"}{Math.abs(t.monto)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Transaction;