
function logger(level: "info" | "warn" | "error", ...data: any[]) {
	if (import.meta.env.DEV_MODE === "true") {
		console[level](...data);
	}
}

export { logger };