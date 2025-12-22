import ReactDOM from "react-dom";
import SharePopup from "./SharePopup";

export default function SharePopupPortal({ url, onClose }) {
  return ReactDOM.createPortal(
    <SharePopup url={url} onClose={onClose} />,
    document.body,
  );
}
