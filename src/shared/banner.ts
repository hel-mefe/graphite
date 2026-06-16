import { Logger } from "./logger" ;

export function printBanner(log: Logger): void {
  // Keep it compact to avoid noisy logs in watch mode.
  log.info("   ____                 _     _ _       ") ;
  log.info("  / ___|_ __ __ _ _ __ | |__ (_) |_ ___ ") ;
  log.info(" | |  _| '__/ _` | '_ \\| '_ \\| | __/ _ \\") ;
  log.info(" | |_| | | | (_| | |_) | | | | | ||  __/") ;
  log.info("  \\____|_|  \\__,_| .__/|_| |_|_|\\__\\___|") ;
  log.info("                 |_|                    ") ;
}

