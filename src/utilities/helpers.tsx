function logger(level: "info" | "warn" | "error", ...data: any[]) {
  if (import.meta.env.VITE_DEV_MODE === "true") {
    console[level](...data);
  }
}

export { logger };
