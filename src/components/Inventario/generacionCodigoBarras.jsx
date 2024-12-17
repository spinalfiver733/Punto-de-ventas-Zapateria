import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const GeneracionCodigoBarras = () => {
    const [numCodigos, setNumCodigos] = useState(1);
    const printAreaRef = useRef(null);
    const [codigosGenerados, setCodigosGenerados] = useState(false);

    useEffect(() => {
        // Cargar JsBarcode desde CDN si es necesario
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const generarCodigoBarra = (codigo, contenedor) => {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, codigo, {
            format: "CODE128",
            displayValue: true,
            width: 2,
            height: 100
        });
        contenedor.appendChild(canvas);
    };

    const handleGenerar = () => {
        if (isNaN(numCodigos) || numCodigos < 1) {
            alert('Ingrese un número válido de códigos.');
            return;
        }

        if (printAreaRef.current) {
            printAreaRef.current.innerHTML = ''; // Limpiar área de impresión
            
            for (let i = 1; i <= numCodigos; i++) {
                const codigo = String(i).padStart(6, '0');
                generarCodigoBarra(codigo, printAreaRef.current);
            }
            setCodigosGenerados(true);
        }
    };

    const handleImprimir = () => {
        window.print();
    };

    return (
        <div className="generacion-codigo-barras">
            <h3>Generar e Imprimir Códigos de Barras</h3>
            
            <div className="controls" style={{ marginBottom: '20px' }}>
                <div className="form-group">
                    <label htmlFor="numCodes">¿Cuántos códigos desea imprimir?</label>
                    <input 
                        type="number" 
                        id="numCodes"
                        min="1"
                        value={numCodigos}
                        onChange={(e) => setNumCodigos(parseInt(e.target.value))}
                        className="form-control"
                        style={{ margin: '0 10px' }}
                    />
                </div>

                <button 
                    onClick={handleGenerar}
                    className="btn-primary"
                    style={{ marginRight: '10px' }}
                >
                    Generar Códigos
                </button>
                
                <button 
                    onClick={handleImprimir}
                    className="btn-secondary"
                    disabled={!codigosGenerados}
                >
                    Imprimir Códigos
                </button>
            </div>

            {/* Área de impresión */}
            <div 
                ref={printAreaRef} 
                id="printArea"
                style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center'
                }}
            />

            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #printArea, #printArea * {
                            visibility: visible;
                        }
                        #printArea {
                            position: absolute;
                            top: 0;
                            left: 0;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default GeneracionCodigoBarras;