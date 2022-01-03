const axios = require("axios");
const fs = require("fs");

const download = require("download");

const outputDir = "output/";
const link = process.argv[2];

fs.rmSync(outputDir, { recursive: true, force: true });

fs.mkdirSync(outputDir);

axios.get(link).then((data) => {
  fs.writeFileSync(outputDir + "master.m3u8", data.data);

  const playListsPath = data.data
    .match(/[^"]*\.m3u8/g)
    .map((str) => str.replace("\n", ""));

  for (const path of playListsPath) {
    const pathName = path.replace(/[^/]*\.m3u8/g, "");

    fs.mkdirSync(outputDir + pathName, {
      recursive: true,
    });

    axios.get(link.replace(/[^/]*\.m3u8/g, "") + path).then(async (data) => {
      fs.writeFileSync(outputDir + path, data.data);

      const filesPaths = data.data
        .match(/^[a-zA-Z0-9]*\.[a-zA-Z0-9]*$/gm)
        .map((str) => str.replace("\n", ""));

      for (const file of filesPaths) {
        console.log(link.replace(/[^/]*\.m3u8/g, "") + pathName + file);
        console.log(outputDir + pathName + file);

        await download(
          link.replace(/[^/]*\.m3u8/g, "") + pathName + file,
          outputDir + pathName
        );
      }
    });
  }
});
