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

    // Agregar esta función en tu componente
const handleDiagnostico = async () => {
    try {
        setCargando(true);
        
        const response = await axios.post(`${API_URL}/codigo-barras/diagnostico-impresora`, {
            codigo: 'TEST001'
        });

        if (response.data.success) {
            console.log('📊 Resultados del diagnóstico:', response.data);
            
            const { resultados } = response.data;
            let mensaje = `🔧 Diagnóstico Completo:\n\n`;
            mensaje += `✅ Impresión directa: ${resultados.pruebaDirecta?.exito ? 'FUNCIONA' : 'FALLA'}\n`;
            mensaje += `✅ BarTender: ${resultados.pruebaBarTender?.exito ? 'FUNCIONA' : 'FALLA'}\n`;
            mensaje += `✅ Estado impresora: ${resultados.estadoImpresora?.exito ? 'OK' : 'ERROR'}\n\n`;
            mensaje += `💡 Recomendaciones:\n${response.data.recomendaciones.join('\n')}`;
            
            alert(mensaje);
        }
        
    } catch (error) {
        console.error('Error en diagnóstico:', error);
        alert(`❌ Error en diagnóstico: ${error.response?.data?.mensaje || error.message}`);
    } finally {
        setCargando(false);
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

// En tu componente GeneracionCodigoBarras, reemplaza la función handleImprimir:

const handleImprimir = async () => {
    if (!codigosActuales || codigosActuales.length === 0) {
        alert('No hay códigos para imprimir');
        return;
    }

    // Confirmar antes de imprimir
    const confirmar = window.confirm(
        `¿Estás seguro de que deseas imprimir ${codigosActuales.length} etiquetas?\n\n` +
        `Códigos: ${codigosActuales.slice(0, 5).join(', ')}${codigosActuales.length > 5 ? '...' : ''}`
    );

    if (!confirmar) return;

    try {
        setCargando(true);
        
        console.log('Enviando códigos a imprimir:', codigosActuales);
        
        // Enviar códigos al endpoint de impresión
        const response = await axios.post(`${API_URL}/codigo-barras/imprimir`, {
            codigos: codigosActuales
        });

        if (response.data.success) {
            const { exitosos, fallidos, total } = response.data;
            
            let mensaje = `🎉 Proceso de impresión completado\n\n`;
            mensaje += `📊 Resumen:\n`;
            mensaje += `Total procesados: ${total}\n`;
            mensaje += `✅ Exitosos: ${exitosos}\n`;
            mensaje += `❌ Fallidos: ${fallidos}\n`;
            
            // Si hay fallidos, mostrar detalles
            if (fallidos > 0) {
                mensaje += `\n⚠️ Códigos con problemas:\n`;
                const errores = response.data.resultados
                    .filter(r => r.status === 'error')
                    .slice(0, 5); // Mostrar solo los primeros 5 errores
                
                errores.forEach(r => {
                    mensaje += `• ${r.codigo}: ${r.error}\n`;
                });
                
                if (response.data.resultados.filter(r => r.status === 'error').length > 5) {
                    mensaje += `• ... y ${response.data.resultados.filter(r => r.status === 'error').length - 5} más\n`;
                }
            }
            
            alert(mensaje);
            
            // Si todo fue exitoso, limpiar los códigos generados
            if (fallidos === 0) {
                setCodigosGenerados(false);
                setCodigosActuales([]);
            }
            
        } else {
            throw new Error(response.data.message || 'Error desconocido en el servidor');
        }
        
    } catch (error) {
        console.error('Error al enviar códigos a imprimir:', error);
        
        let mensajeError = '❌ Error al procesar la impresión\n\n';
        
        if (error.response) {
            // Error del servidor
            mensajeError += `Error del servidor: ${error.response.data?.message || error.response.statusText}\n`;
            mensajeError += `Código de estado: ${error.response.status}`;
        } else if (error.request) {
            // Error de red
            mensajeError += 'No se pudo conectar con el servidor.\n';
            mensajeError += 'Verifica tu conexión a internet y que el servidor esté funcionando.';
        } else {
            // Otro tipo de error
            mensajeError += `Error: ${error.message}`;
        }
        
        alert(mensajeError);
    } finally {
        setCargando(false);
    }
};

    const handleRefresh = () => {
        consultarUltimoCodigo();
        setCodigosGenerados(false);
        setCodigosActuales([]);
        setHayHuecos(false);
    };

    if (cargando && !codigosGenerados) {
        return (
            <div className="loading" style={styles.loading}>
                Cargando... Por favor espere mientras consultamos la base de datos.
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container" style={styles.errorContainer}>
                <div className="error" style={styles.error}>{error}</div>
                <button 
                    onClick={consultarUltimoCodigo} 
                    style={styles.btnPrimary}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="generacion-codigo-barras" style={styles.container}>
            <h3 style={styles.title}>Generar e Imprimir Códigos de Barras</h3>
                                <button 
    onClick={handleDiagnostico}
    style={{...styles.btnSecondary, marginRight: '10px', backgroundColor: '#17a2b8'}}
    disabled={cargando}
>
    🔧 Diagnóstico Completo
</button>
            
            <div style={styles.infoContainer}>
                <p><strong>Último código registrado en la base:</strong> {String(ultimoCodigo).padStart(6, '0')}</p>
                <p><strong>Siguiente código disponible:</strong> {String(ultimoCodigo + 1).padStart(6, '0')}</p>
            </div>
            
            <div style={styles.controls}>
                <div style={styles.formGroup}>
                    <label htmlFor="numCodes" style={styles.label}>¿Cuántos códigos desea generar?</label>
                    <input 
                        type="text" 
                        id="numCodes"
                        value={numCodigos}
                        onChange={(e) => {
                            // Solo permitir números
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            // Convertir a entero o usar 1 como valor predeterminado si está vacío
                            const numValue = value;
                            setNumCodigos(numValue);
                        }}
                        style={styles.input}
                        disabled={cargando}
                    />
                </div>

                <div style={styles.buttonGroup}>
                    <button 
                        onClick={handleGenerar}
                        style={{...styles.btnPrimary, marginRight: '10px'}}
                        disabled={cargando}
                    >
                        {cargando ? 'Generando...' : 'Generar Códigos'}
                    </button>
                    
                    <button 
                        onClick={handleImprimir}
                        style={{...styles.btnSecondary, marginRight: '10px'}}
                        disabled={!codigosGenerados || cargando}
                    >
                        Imprimir Códigos
                    </button>
                    
                    <button 
                        onClick={handleRefresh}
                        style={styles.btnOutline}
                        disabled={cargando}
                    >
                        Actualizar
                    </button>
                </div>
            </div>
            
            {codigosGenerados && (
                <div style={hayHuecos ? styles.codigosInfoHuecos : styles.codigosInfo}>
                    <p>Se han generado {codigosActuales.length} códigos</p>
                    
                    {hayHuecos && (
                        <p style={styles.notaAzul}>
                            <strong>Nota:</strong> Se han incluido códigos de huecos en la secuencia para optimizar el uso de códigos.
                        </p>
                    )}
                    
                    <p className="range">
                        Rango: desde <strong>{codigosActuales[0]}</strong> hasta <strong>{codigosActuales[codigosActuales.length - 1]}</strong>
                        {hayHuecos && " (pueden no ser consecutivos)"}
                    </p>
                    
                    <div style={styles.codigosLista}>
                        <p><strong>Códigos generados:</strong></p>
                        <div style={styles.codigosGrid}>
                            {codigosActuales.map((codigo, index) => (
                                <span key={index} style={styles.codigoItem}>
                                    {codigo}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    
                    <p style={styles.nota}>
                        Estos códigos se utilizarán al registrar nuevos productos en el inventario.
                    </p>
                </div>
            )}
        </div>
    );
};

// Definir todos los estilos en un objeto para mejor organización y rendimiento
const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    },
    title: {
        color: '#0056b3',
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '24px'
    },
    infoContainer: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f0f7ff',
        borderRadius: '5px',
        border: '1px solid #cce5ff',
        color: '#0056b3'
    },
    controls: {
        marginBottom: '25px'
    },
    formGroup: {
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    label: {
        marginRight: '15px',
        fontWeight: 'bold',
        minWidth: '200px'
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ced4da',
        fontSize: '16px',
        flex: '1',
        minWidth: '100px',
        maxWidth: '200px'
    },
    buttonGroup: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    btnPrimary: {
        backgroundColor: '#0d6efd',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        fontSize: '14px'
    },
    btnSecondary: {
        backgroundColor: '#5a6268',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        fontSize: '14px'
    },
    btnOutline: {
        backgroundColor: 'transparent',
        color: '#0d6efd',
        border: '1px solid #0d6efd',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s',
        fontSize: '14px'
    },
    codigosInfo: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#e8f5e9',
        borderRadius: '5px',
        border: '1px solid #c8e6c9',
        color: '#2e7d32'
    },
    codigosInfoHuecos: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#e3f2fd',
        borderRadius: '5px',
        border: '1px solid #bbdefb',
        color: '#0d47a1'
    },
    notaAzul: {
        fontStyle: 'italic',
        color: '#0d47a1',
        fontSize: '0.95em',
        backgroundColor: '#e3f2fd',
        padding: '8px',
        borderRadius: '4px'
    },
    codigosLista: {
        marginTop: '20px'
    },
    codigosGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '10px'
    },
    codigoItem: {
        padding: '8px 15px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        border: '1px solid #ddd',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        fontSize: '0.9em',
        fontFamily: 'monospace'
    },
    nota: {
        marginTop: '20px',
        fontStyle: 'italic',
        color: '#666',
        fontSize: '0.9em',
        backgroundColor: '#f8f9fa',
        padding: '8px',
        borderRadius: '4px'
    },
    loading: {
        padding: '30px',
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#666',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px 0'
    },
    errorContainer: {
        padding: '30px',
        textAlign: 'center',
        backgroundColor: '#fff9fa',
        borderRadius: '8px',
        margin: '20px 0',
        border: '1px solid #ffcdd2'
    },
    error: {
        color: '#d32f2f',
        marginBottom: '20px',
        fontWeight: 'bold'
    }
};

export default GeneracionCodigoBarras;