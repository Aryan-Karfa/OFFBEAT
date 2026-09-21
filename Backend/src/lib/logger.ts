type LogLevel = "info" | "warn" | "error" | "debug";

export class Logger {
  private format(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const payload: Record<string, unknown> = {
      timestamp,
      level: level.toUpperCase(),
      message,
    };

    if (meta && typeof meta === "object") {
      Object.assign(payload, meta);
    } else if (meta !== undefined) {
      payload.context = meta;
    }

    return JSON.stringify(payload);
  }

  public info(message: string, meta?: unknown): void {
    console.log(this.format("info", message, meta));
  }

  public warn(message: string, meta?: unknown): void {
    console.warn(this.format("warn", message, meta));
  }

  public error(message: string, meta?: unknown): void {
    console.error(this.format("error", message, meta));
  }

  public debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.format("debug", message, meta));
    }
  }
}

export const logger = new Logger();
