import { createContext } from "react";

const ToastContext = createContext({
  toast: null,
  setToast: () => {},
});

export default ToastContext;
