export const handleZodError = (err) => {
  console.log("[-] Zod error: ", [err.issues?.[0]?.message, err.issues?.[0]?.path[0]?.toString() || "unkown"])
  return [err.issues?.[0]?.message, err.issues?.[0]?.path[0]?.toString() || "unkown"]
} 