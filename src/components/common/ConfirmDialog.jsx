import './ConfirmDialog.css';

const ConfirmDialog = ({ open, onConfirm, onCancel, title, content }) => {
  if (!open) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <h2>{title}</h2>
        <p>{content}</p>
        <div className="confirm-dialog-buttons">
          <button className="cancel-button" onClick={onCancel}>Cancelar</button>
          <button className="confirm-button" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;