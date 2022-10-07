import { readFile } from "fs/promises";
const pkg = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url))
);
import path from "path";
import fs from "fs";
import chalk from "chalk";
import figlet from "figlet";
import ora from "ora";
import terminalLink from "terminal-link";
import gradient from "gradient-string";
import logSymbols from "log-symbols";
import prompt from "prompt";
import sharp from "sharp";

const spacer = () => console.log(" ");
const greenLog = (text) => console.log(chalk.green(text));
const redLog = (text) => console.log(chalk.red(text));
const yellowLog = (text) => console.log(chalk.yellow(text));
const cyanLog = (text) => console.log(chalk.cyan(text));

const titleGradient = gradient("cyan", "magenta");
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
const info = () => {
  cyanLog(`${logSymbols.info} Version: ${pkg.version}`);
  cyanLog(
    `${logSymbols.info} Author: ${pkg.author.name} - ${pkg.author.email}`
  );
};

const warning = (text) => yellowLog(`${logSymbols.warning} ${text}`);

const warnings = () => {
  warning(
    `Before you start, please make sure you have a folder called ".images" in the root of this project. 😃`
  );
};

function promiseAllP(items, block) {
  var promises = [];
  items.forEach(function (item, index) {
    promises.push(
      (function (item, i) {
        return new Promise(function (resolve, reject) {
          return block.apply(this, [item, index, resolve, reject]);
        });
      })(item, index)
    );
  });
  return Promise.all(promises);
}

function readFiles(dirname) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, function (err, filenames) {
      if (err) return reject(err);
      promiseAllP(filenames, (filename, index, resolve, reject) => {
        fs.readFile(
          path.resolve(dirname, filename),
          "utf-8",
          function (err, content) {
            if (err) {
              spinner.fail(`${filename}`);
              return reject(err);
            }
            return resolve({ filename, content });
          }
        );
      })
        .then((results) => {
          return resolve(results);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  });
}

const loader = ({ text }) => ora({ color: "magenta", text, spinner: "flip" });
const link = (text, url) => terminalLink(text, url);
const XL = {
  width: 2048,
  height: 1365,
};

const L = {
  width: 1024,
  height: 683,
};
const M = {
  width: 768,
  height: 512,
};

const S = {
  width: 600,
  height: 400,
};

const sizes = [XL, L, M, S];

const schema = {
  properties: {
    folderName: {
      message: "Enter the name of the output folder",
      required: true,
    },
  },
};

const slugify = (string) => {
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

const getFolder = async () => {
  prompt.start();
  return await prompt.get(schema);
};

const createFolder = (folderName) => {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
};

const main = async () => {
  const directory = path.join(process.cwd(), `images`);
  createFolder(directory);

  title();
  spacer();
  description();
  spacer();
  info();
  spacer();
  warnings();
  spacer();

  const { folderName } = await getFolder();
  const resizedDirectory = path.join(process.cwd(), slugify(folderName));
  createFolder(resizedDirectory);

  cyanLog(`${logSymbols.info} Let's start! 🚀`);

  const spinner = loader({ text: "Reading files..." }).start();

  try {
    const files = await readFiles(directory);
    const totalFiles = files.length ?? 0;
    spinner.stopAndPersist({
      symbol: "🙌",
      text: `Found ${totalFiles} files!`,
    });
    spacer();
    cyanLog(`${logSymbols.info} Starting to resize... 📸`);

    const data = await Promise.all(
      files.map(async (file, indexFile) => {
        const { filename } = file;
        const spinner = loader({ text: `Resizing ${filename}...` }).start();
        const image = await sharp(`${directory}/${filename}`);
        const metadata = await image.metadata();
        const { width, height } = metadata;
        const isLandscape = width > height;
        const isPortrait = height > width;

        try {
          await Promise.all(
            sizes.map(async (size) => {
              const newSizeDirectory = path.join(
                resizedDirectory,
                `${indexFile + 1}`
              );

              if (!fs.existsSync(newSizeDirectory)) {
                fs.mkdirSync(newSizeDirectory);
              }

              const { width, height } = size;
              if (isLandscape) {
                await image
                  .webp({
                    quality: 90,
                  })
                  .resize({ width, height, fit: "cover" })
                  .toFile(`${newSizeDirectory}/${width}x${height}.webp`);
              } else if (isPortrait) {
                await image
                  .webp({
                    quality: 90,
                  })
                  .resize({ width: height, height: width, fit: "cover" })
                  .toFile(`${newSizeDirectory}/${width}x${height}.webp`);
              }
              spinner.stopAndPersist({
                symbol: "🙌",
                text: `Resized ${filename} to ${width}x${height}!`,
              });
            })
          );
          return {
            filename,
            width,
            height,
            isLandscape,
            isPortrait,
          };
        } catch (error) {
          spinner.fail(`${filename}`);
          redLog(`${logSymbols.error} ${error}`);
        }
      })
    );
    cyanLog(`${logSymbols.info} Done! 🎉`);
    spacer();
    console.table({
      "Total files": totalFiles,
      "Resized files": files.length,
      "Resized directory": resizedDirectory,
    });
    spacer();
    console.table(data);
    greenLog(`${logSymbols.success} All done! 🎉`);
    spacer();
    spacer();
    cyanLog(
      `${logSymbols.info} Have a nice day! 😃 and check out ${link(
        "my website",
        pkg.author.url
      )}!`
    );
  } catch (error) {
    spinner.fail("Something went wrong!");
    redLog(error);
  }
};

main();
