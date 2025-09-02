// ANSI 颜色代码
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

export function customLog(type: string, msg: string) {
  const coloredType = `${colors.cyan}${colors.bright}<====== ${type} =======>${colors.reset}`;
  const coloredMsg = `${colors.cyan}${msg}${colors.reset}`;
  console.info(coloredType, coloredMsg);
}

export function customError(type: string, msg: string) {
  const coloredType = `${colors.red}${colors.bright}<====== ${type} =======>${colors.reset}`;
  const coloredMsg = `${colors.red}${msg}${colors.reset}`;
  console.error(coloredType, coloredMsg);
}

// 额外的彩色日志函数
export function customSuccess(type: string, msg: string) {
  const coloredType = `${colors.green}${colors.bright}<====== ${type} =======>${colors.reset}`;
  const coloredMsg = `${colors.green}${msg}${colors.reset}`;
  console.log(coloredType, coloredMsg);
}

export function customWarning(type: string, msg: string) {
  const coloredType = `${colors.yellow}${colors.bright}<====== ${type} =======>${colors.reset}`;
  const coloredMsg = `${colors.yellow}${msg}${colors.reset}`;
  console.warn(coloredType, coloredMsg);
}
