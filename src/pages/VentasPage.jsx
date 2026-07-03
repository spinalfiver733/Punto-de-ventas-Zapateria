import { useEffect, useState } from "react";
import api from "../config/api.js";

const VentasPage = () => {
    const [ventas, setVentas] = useState([]);
    
    useEffect(() => {
        const obtenerVentas = async () => {
            try {
                const ahora = new Date();
                const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
                
                console.log('Fecha que se manda al backend:', hoy);
                
                const response = await api.get(`/api/ventas/historial?fecha=${hoy}`);
                
                console.log('Ventas recibidas:', response.data);
                setVentas(response.data);
            } catch (error) {
                console.error("Error al obtener las ventas:", error);
            }
        };

        obtenerVentas();
    }, []);

    return (
        <div>
            <h1>Ventas del día</h1>
            {ventas.map(venta => (
                <p key={venta.PK_VENTA}>{venta.MODELO} - {venta.PRECIO}</p>
            ))}
        </div>
    );
};

export default VentasPage;