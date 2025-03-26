import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const Inicio = () => {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const db = getFirestore();

        // Detectar usuario autenticado
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // Buscar el nombre en Firestore
                const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
                if (userDoc.exists()) {
                    setUserName(userDoc.data().name);
                } else {
                    setUserName(currentUser.displayName || "Usuario");
                }
            } else {
                setUser(null);
                setUserName("");
            }
        });

        return () => unsubscribe();
    }, []);

    // Función para cerrar sesión
    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            navigate("/login"); // Redirige al login
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };

    return (
        <div className="container-inicio">
            <div className="card card-inicio">
                <div className="card-body card-body-inicio">
                    <h2 className="text-center">Monopoly</h2>
                    <p>Bienvenido, {userName}</p>

                    <div className="d-grid gap-2">
                        <button className="btn btn-primary" onClick={() => navigate("/create-game")}>Crear partida</button>
                        <button className="btn btn-secondary" onClick={() => navigate("/join-game")}>Unirse a partida</button>
                        <button className="btn btn-danger" onClick={handleLogout}>Cerrar sesión</button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Inicio;
