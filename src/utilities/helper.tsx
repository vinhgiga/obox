function logger(type: keyof Console, ...args: any[]) {

  if (import.meta.env.VITE_DEV_MODE === "true") {
    (console[type] as (...data: any[]) => void)(...args);
  }
}

export { logger };
