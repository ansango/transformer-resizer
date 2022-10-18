import prompt from "prompt";

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

export const sizes = [XL, L, M, S];

const schema = {
  properties: {
    folderName: {
      description: "Enter the name of the output folder",
      required: true,
    },
  },
};

export const getFolder = async () => {
  prompt.start();
  return await prompt.get(schema);
};
