import { useState, useEffect } from 'react';
import axios from 'axios';

const GeneracionCodigoBarras = () => {
    const [numCodigos, setNumCodigos] = useState(1);
    const [ultimoCodigo, setUltimoCodigo] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [codigosGenerados, setCodigosGenerados] = useState(false);
    const [codigosActuales, setCodigosActuales] = useState([]);
    const [hayHuecos, setHayHuecos] = useState(false);
    
    // API base URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        // Consultar el último código de barras en la base de datos
        consultarUltimoCodigo();
    }, []);

    const consultarUltimoCodigo = async () => {
        try {
            setCargando(true);
            const response = await axios.get(`${API_URL}/codigo-barras/ultimo-codigo`);
            
            if (response.data.success) {
                const codigo = parseInt(response.data.ultimoCodigo);
                setUltimoCodigo(codigo);
            } else {
                throw new Error('No se pudo obtener el último código de barras');
            }
        } catch (err) {
            console.error('Error al consultar el último código:', err);
            setError('Error al consultar la base de datos. Inténtelo de nuevo más tarde.');
        } finally {
            setCargando(false);
        }
    };

    const obtenerCodigosDisponibles = async (cantidad) => {
        try {
            const response = await axios.get(`${API_URL}/codigo-barras/codigos-disponibles/${cantidad}`);
            
            if (response.data.success) {
                // Comprobar si hay huecos en la secuencia
                const codigosNumericos = response.data.codigosDisponibles.map(c => parseInt(c));
                const hayHuecosEnSecuencia = codigosNumericos.some(c => c <= ultimoCodigo);
                setHayHuecos(hayHuecosEnSecuencia);
                
                return response.data.codigosDisponibles;
            } else {
                throw new Error('No se pudieron obtener códigos disponibles');
            }
        } catch (err) {
            console.error('Error al obtener códigos disponibles:', err);
            throw err;
        }
    };

    const handleGenerar = async () => {
        if (isNaN(numCodigos) || numCodigos < 1) {
            alert('Ingrese un número válido de códigos.');
            return;
        }

        try {
            setCargando(true);
            
            // Obtener códigos disponibles (incluyendo huecos)
            const codigosDisponibles = await obtenerCodigosDisponibles(numCodigos);
            
            setCodigosActuales(codigosDisponibles);
            setCodigosGenerados(true);
            
            // Actualizar el último código si hemos generado nuevos códigos más allá del último
            if (codigosDisponibles.length > 0) {
                const ultimoGenerado = Math.max(...codigosDisponibles.map(c => parseInt(c)));
                
                if (ultimoGenerado > ultimoCodigo) {
                    setUltimoCodigo(ultimoGenerado);
                }
            }
        } catch (error) {
            console.error('Error al generar códigos:', error);
            alert('Ocurrió un error al generar los códigos. Por favor, inténtelo de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    const handleImprimir = () => {
        // Aquí puedes implementar la lógica para imprimir los códigos
        alert(`Se imprimirán los siguientes códigos: ${codigosActuales.join(', ')}`);
        // Puedes enviar estos códigos a una API de impresión o usar otra lógica según tus necesidades
    };

    const handleRefresh = () => {
        consultarUltimoCodigo();
        setCodigosGenerados(false);
        setCodigosActuales([]);
        setHayHuecos(false);
    };

    if (cargando && !codigosGenerados) {
        return <div className="loading">Cargando... Por favor espere mientras consultamos la base de datos.</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error">{error}</div>
                <button onClick={consultarUltimoCodigo} className="btn-primary">Reintentar</button>
            </div>
        );
    }

    return (
        <div className="generacion-codigo-barras">
            <h3>Generar e Imprimir Códigos de Barras</h3>
            
            <div className="info-container" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <p><strong>Último código registrado en la base:</strong> {String(ultimoCodigo).padStart(6, '0')}</p>
                <p><strong>Siguiente código disponible:</strong> {String(ultimoCodigo + 1).padStart(6, '0')}</p>
            </div>
            
            <div className="controls" style={{ marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label htmlFor="numCodes">¿Cuántos códigos desea generar?</label>
                    <input 
                        type="number" 
                        id="numCodes"
                        min="1"
                        value={numCodigos}
                        onChange={(e) => setNumCodigos(parseInt(e.target.value) || 1)}
                        className="form-control"
                        style={{ margin: '0 10px' }}
                        disabled={cargando}
                    />
                </div>

                <button 
                    onClick={handleGenerar}
                    className="btn-primary"
                    style={{ marginRight: '10px' }}
                    disabled={cargando}
                >
                    {cargando ? 'Generando...' : 'Generar Códigos'}
                </button>
                
                <button 
                    onClick={handleImprimir}
                    className="btn-secondary"
                    disabled={!codigosGenerados || cargando}
                    style={{ marginRight: '10px' }}
                >
                    Imprimir Códigos
                </button>
                
                <button 
                    onClick={handleRefresh}
                    className="btn-outline"
                    disabled={cargando}
                >
                    Actualizar
                </button>
            </div>
            
            {codigosGenerados && (
                <div className="codigos-info" style={{ marginTop: '15px', padding: '10px', backgroundColor: hayHuecos ? '#e8f4ff' : '#f0f9e8', borderRadius: '5px' }}>
                    <p>Se han generado {codigosActuales.length} códigos</p>
                    
                    {hayHuecos && (
                        <p className="nota" style={{ color: '#0066cc' }}>
                            <strong>Nota:</strong> Se han incluido códigos de "huecos" en la secuencia para optimizar el uso de códigos.
                        </p>
                    )}
                    
                    <p className="range">
                        Rango: desde <strong>{codigosActuales[0]}</strong> hasta <strong>{codigosActuales[codigosActuales.length - 1]}</strong>
                        {hayHuecos && " (pueden no ser consecutivos)"}
                    </p>
                    
                    <div className="codigos-lista">
                        <p><strong>Códigos generados:</strong></p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {codigosActuales.map((codigo, index) => (
                                <span key={index} style={{ 
                                    padding: '5px 10px', 
                                    backgroundColor: '#f1f1f1', 
                                    borderRadius: '4px',
                                    border: '1px solid #ddd'
                                }}>
                                    {codigo}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <p className="nota" style={{ marginTop: '15px' }}>
                        Estos códigos se utilizarán al registrar nuevos productos en el inventario.
                    </p>
                </div>
            )}

            <style>
                {`
                    .loading {
                        padding: 20px;
                        text-align: center;
                        font-style: italic;
                        color: #666;
                    }
                    
                    .error-container {
                        padding: 20px;
                        text-align: center;
                    }
                    
                    .error {
                        color: #dc3545;
                        margin-bottom: 15px;
                    }
                    
                    .nota {
                        font-style: italic;
                        color: #6c757d;
                        font-size: 0.9em;
                    }
                    
                    .btn-primary {
                        background-color: #007bff;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    
                    .btn-secondary {
                        background-color: #6c757d;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    
                    .btn-outline {
                        background-color: transparent;
                        color: #007bff;
                        border: 1px solid #007bff;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    
                    .codigos-lista {
                        margin-top: 15px;
                    }
                    
                    button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }
                `}
            </style>
        </div>
    );
};

export default GeneracionCodigoBarras;