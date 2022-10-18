import { readFile } from "fs/promises";
import figlet from "figlet";
import {
  greenLog,
  info,
  spacer,
  titleGradient,
  warning,
} from "./lib/utils.mjs";

export const pkg = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url))
);

const title = () =>
  console.log(
    titleGradient(
      figlet.textSync(pkg.name, {
        font: "Graffiti",
        horizontalLayout: "fitted",
        verticalLayout: "fitted",
        width: 90,
      })
    )
  );

const description = () => greenLog(`Welcome to RESIZER - ${pkg.description}`);

const information = () => {
  info(`Version: ${pkg.version}`);
  info(`Author: ${pkg.author.name} - ${pkg.author.email}`);
};

const warnings = () =>
  warning(
    `Before you start, please make sure you have a folder called ".images" in the root of this project. 😃`
  );

export const introduction = () => {
  title();
  spacer();
  description();
  spacer();
  information();
  spacer();
  warnings();
  spacer();
};
