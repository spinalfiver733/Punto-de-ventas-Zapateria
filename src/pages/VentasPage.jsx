import { useEffect, useState } from "react";
import api from "../config/api.js";

const VentasPage = () => {
    const [ventas, setVentas] = useState([]);
    
    useEffect(() => {
        const obtenerVentas = async () => {
            try {
                const ahora = new Date();
                const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
                
                const response = await api.get(`/api/ventas/historial?fecha=${hoy}`);
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
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Número</th>
                        <th>Color</th>
                        <th>Precio</th>
                    </tr>
                </thead>
                <tbody>
                    {ventas.map(venta => (
                        <tr key={venta.PK_VENTA}>
                            <td>{`${venta.MARCA} ${venta.MODELO}`}</td>
                            <td>{venta.TALLA}</td>
                            <td>{venta.COLOR}</td>
                            <td>{venta.PRECIO}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VentasPage;