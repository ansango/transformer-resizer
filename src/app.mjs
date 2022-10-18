import prompt from "prompt";

import { introduction } from "./config.mjs";
import { webSiteProgram } from "./website/index.mjs";

const schemaProgram = {
  properties: {
    program: {
      description: "Website or ecommerce? (web | ecom)",
      required: true,
      pattern: /^(web|ecom)$/,
    },
  },
};

const getProgram = async () => {
  prompt.start();
  return await prompt.get(schemaProgram);
};

const main = async () => {
  introduction();
  const { program } = await getProgram();
  switch (program) {
    case "web":
      await webSiteProgram();
      break;
    case "ecom":
      console.log("ecommerce");
      break;
    default:
      throw new Error("Invalid program");
  }
};

main();
