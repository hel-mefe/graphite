export type LogLevel = "debug" | "info" | "warn" | "error" | "success" ;

export interface LoggerOptions {
  brand?: string ;
  enabled?: boolean ;
  colors?: boolean ;
}

const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  magenta: "\x1b[35m",
} as const ;

function supportsColor(): boolean {
  if ("NO_COLOR" in process.env) return false ;
  if (process.env.FORCE_COLOR === "0") return false ;
  return Boolean(process.stdout.isTTY) ;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0") ;
}

function timestamp(): string {
  const d = new Date() ;
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}` ;
}

export class Logger {
  private readonly brand: string ;
  private readonly enabled: boolean ;
  private readonly colors: boolean ;

  constructor(opts: LoggerOptions = {}) {
    this.brand = opts.brand ?? "graphite" ;
    this.enabled = opts.enabled ?? true ;
    this.colors = opts.colors ?? supportsColor() ;
  }

  debug(msg: string): void {
    this.log("debug", msg) ;
  }
  info(msg: string): void {
    this.log("info", msg) ;
  }
  warn(msg: string): void {
    this.log("warn", msg) ;
  }
  error(msg: string): void {
    this.log("error", msg) ;
  }
  success(msg: string): void {
    this.log("success", msg) ;
  }

  section(title: string): void {
    const label = this.colors ? `${ANSI.magenta}${title}${ANSI.reset}` : title ;
    this.info(label) ;
  }

  private log(level: LogLevel, msg: string): void {
    if (!this.enabled) return ;
    const t = this.colors ? `${ANSI.gray}${timestamp()}${ANSI.reset}` : timestamp() ;
    const prefix = this.formatPrefix(level) ;
    const line = `${t} ${prefix} ${msg}` ;

    if (level === "error") console.error(line) ;
    else if (level === "warn") console.warn(line) ;
    else console.log(line) ;
  }

  private formatPrefix(level: LogLevel): string {
    const base = `[${this.brand}]` ;
    if (!this.colors) return base ;

    const colored =
      level === "debug" ? `${ANSI.dim}${ANSI.blue}${base}${ANSI.reset}` :
      level === "info" ? `${ANSI.blue}${base}${ANSI.reset}` :
      level === "warn" ? `${ANSI.yellow}${base}${ANSI.reset}` :
      level === "error" ? `${ANSI.red}${base}${ANSI.reset}` :
      `${ANSI.green}${base}${ANSI.reset}` ;

    return colored ;
  }
}

export const logger = new Logger() ;

