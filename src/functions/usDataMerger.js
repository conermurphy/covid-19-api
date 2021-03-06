import fs from 'fs';
import writeJSONFile from './jsonWriter.js';

const countryRegex = /(Country_Region)/g;
const provinceRegex = /(Province_State)/g;
const combinedKeyRegex = /(Combined_Key)/g;

function replaceData(data) {
  return new Promise((res, rej) => {
    try {
      let finalData = JSON.stringify(data);
      finalData = finalData.replace(countryRegex, 'Country/Region');
      finalData = finalData.replace(provinceRegex, 'Province/State');
      finalData = finalData.replace(combinedKeyRegex, 'Combined/Key');
      finalData = JSON.parse(finalData);
      const cleanData = finalData.map(d => {
        delete d.UID;
        delete d.iso2;
        delete d.iso3;
        delete d.code3;
        delete d.FIPS;
        delete d.Admin2;
        delete d.Population;
        return d;
      });
      res(cleanData);
    } catch (err) {
      console.error(err);
      rej(err);
    }
  });
}

export default function() {
  return Promise.all(
    ['confirmed', 'deaths'].map(
      status =>
        new Promise(async (res, rej) => {
          try {
            const usFileName = `./data/US-${status}.json`;
            const finalFileName = `./data/${status}.json`;

            const originalData = JSON.parse(fs.readFileSync(finalFileName));
            const usData = JSON.parse(fs.readFileSync(usFileName));
            originalData.push(...usData);

            const finalData = await replaceData(originalData);

            await writeJSONFile(finalData, finalFileName).then(() => res());
          } catch (err) {
            console.error(err);
            rej(err);
          }
        })
    )
  );
}
