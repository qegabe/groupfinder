import {
  ChangeEvent,
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  useState,
} from "react";

function useFormData<S>(
  initial: S
): [S, ChangeEventHandler, Dispatch<SetStateAction<S>>] {
  const [formData, setFormData] = useState(initial);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setFormData((fd: S) => ({
      ...fd,
      [event.target.id]: event.target.value,
    }));
  }

  return [formData, handleChange, setFormData];
}

export default useFormData;
