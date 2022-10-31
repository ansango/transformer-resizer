import path from "path";

import sharp from "sharp";
import { pkg } from "../config.mjs";

import {
  error,
  info,
  slugify,
  spacer,
  success,
  link,
  loader,
} from "../lib/utils.mjs";

import { readFiles } from "../lib/files.mjs";
import { getFolder, sizes } from "./config.mjs";
import { createFolder } from "../lib/folders.mjs";
import { route } from "../lib/route.mjs";

export const webSiteProgram = async () => {
  const directory = route("images");
  createFolder(directory);
  const { folderName } = await getFolder();
  const resizedDirectory = route(slugify(`${folderName}-website`));
  createFolder(resizedDirectory);
  const reelDirectory = route(slugify(`${folderName}-reel`));
  createFolder(reelDirectory);

  info(`Let's start! 🚀`);

  const spinner = loader({ text: "Reading files..." }).start();

  try {
    const files = await readFiles(directory);
    const totalFiles = files.length ?? 0;
    spinner.stopAndPersist({
      symbol: "🙌",
      text: `Found ${totalFiles} files!`,
    });
    spacer();
    info(`Starting to resize... 📸`);

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
          if (isPortrait) {
            await image
              .webp({
                quality: 90,
              })

              .toFile(`${resizedDirectory}/${filename.split(".")[0]}.webp`);
          } else {
            await image
              .webp({
                quality: 90,
              })
              .toFile(`${resizedDirectory}/${filename.split(".")[0]}.webp`);
          }
          spinner.stopAndPersist({
            symbol: "🙌",
            text: `Resized ${filename}!`,
          });
          spacer();

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
    spacer();
    spinner.stopAndPersist({
      symbol: "📱",
      text: `Generating thumbs for Instagram reels...`,
    });

    await Promise.all(
      files.map(async (file, indexFile) => {
        const { filename } = file;
        const image = await sharp(`${directory}/${filename}`);

        try {
          await image
            .jpeg({ quality: 90 })
            .resize({ width: 1080, height: 1920, fit: "cover" })
            .toFile(`${reelDirectory}/${indexFile + 1}.jpg`);
        } catch (err) {
          spinner.fail(`${filename}`);
          error(err);
        }
      })
    );

    spinner.stopAndPersist({
      symbol: "🙌",
      text: `Generated thumbs for Instagram reels!`,
    });

    spacer();
    info(`Done! 🎉`);
    spacer();
    console.table({
      "Total files": totalFiles,
      "Resized files": files.length,
      "Resized directory": resizedDirectory,
    });
    spacer();
    console.table(data);
    success("All done! 🎉");
    spacer();
    spacer();
    info(
      `Have a nice day! 😃 and check out ${link("my website", pkg.author.url)}!`
    );
  } catch (err) {
    spinner.fail("Something went wrong!");
    error(err);
  }
};
