import chalk from "chalk";
import logSymbols from "log-symbols";
import gradient from "gradient-string";
import ora from "ora";
import terminalLink from "terminal-link";


export const spacer = () => console.log(" ");
export const greenLog = (text) => console.log(chalk.green(text));
export const redLog = (text) => console.log(chalk.red(text));
export const yellowLog = (text) => console.log(chalk.yellow(text));
export const cyanLog = (text) => console.log(chalk.cyan(text));
export const titleGradient = gradient("cyan", "magenta");

export const info = (text) => cyanLog(`${logSymbols.info} ${text}`);
export const warning = (text) => yellowLog(`${logSymbols.warning} ${text}`);
export const error = (text) => redLog(`${logSymbols.error} ${text}`);
export const success = (text) => greenLog(`${logSymbols.success} ${text}`);

export const slugify = (string) => {
  const a = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  const b = "aaaaeeeeiiiioooouuuunc------";
  const p = new RegExp(a.split("").join("|"), "g");

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

export const loader = ({ text }) =>
  ora({ color: "magenta", text, spinner: "flip" });
export const link = (text, url) => terminalLink(text, url);
