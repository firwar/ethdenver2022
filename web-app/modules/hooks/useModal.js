import { createContext } from "react";

const ModalContext = createContext({
  modalOpen: false,
  setModalOpen: () => {},
});

export default ModalContext;
