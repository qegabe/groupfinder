function simplifyError(error: string) {
  if (error.includes("User already exists with username")) {
    return { username: { error: true, helperText: "Username already taken" } };
  }
  return { message: error };
}

function parseFormErrors(error: string) {
  let errArray;
  try {
    errArray = JSON.parse(error);
  } catch {
    return simplifyError(error);
  }

  const errors: any = {};
  if (Array.isArray(errArray)) {
    for (let e of errArray) {
      const prop = e.match(/^instance\.(\w+)/)[1];
      if (prop) {
        if (e.includes("does not meet minimum length")) {
          errors[prop as keyof object] = {
            error: true,
            helperText: `Too Short, Must be atleast ${
              e[e.length - 1]
            } character(s) long`,
          };
        } else if (e.includes("is not of a type(s) string")) {
          errors[prop as keyof object] = {
            error: true,
            helperText: "Please Enter",
          };
        } else {
          errors[prop as keyof object] = {
            error: true,
          };
        }
      }
    }
  }

  return errors;
}

export default parseFormErrors;
