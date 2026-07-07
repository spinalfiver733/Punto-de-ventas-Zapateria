import { useEffect, useState } from "react";
import api from "../config/api.js";
import '../styles/estilosPages/InventarioPublico.css';

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
        <div className="inv-page">

            <div className="inv-header">
                <h1>VENTAS DEL DÍA</h1>
            </div>

            <div className="inv-table-wrap">
                {ventas.length === 0 ? (
                    <p className="inv-mensaje">No hay ventas registradas hoy.</p>
                ) : (
                    <table className="inv-table">
                        <thead>
                            <tr>
                                <th className="col-num">#</th>
                                <th className="col-text">Producto</th>
                                <th className="col-text">Número</th>
                                <th className="col-text">Color</th>
                                <th className="col-num">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventas.map((venta, index) => (
                                <tr key={venta.PK_VENTA}>
                                    <td className="col-num">{index + 1}</td>
                                    <td className="col-text">{`${venta.MARCA} ${venta.MODELO}`}</td>
                                    <td className="col-text">{venta.TALLA}</td>
                                    <td className="col-text">{venta.COLOR}</td>
                                    <td className="col-num">${venta.PRECIO}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
};

export default VentasPage;