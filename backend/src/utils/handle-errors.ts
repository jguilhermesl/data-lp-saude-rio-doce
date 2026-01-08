export const handleErrors = (err: any, errDefaultMessage?: string) => {
  console.log(err)
  if (err.response?.data?.errors[0]?.description) {
    return err.response?.data?.errors[0].description
  }
  if (err.response?.data?.message) {
    return err.response?.data?.message
  }
  if (err?.message) {
    return err.message
  }

  return errDefaultMessage || "Algo deu errado.";
}