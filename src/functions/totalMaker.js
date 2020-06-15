import fs from 'fs';
import writeJSONFile from './jsonWriter.js';

function dataReducer(path, status) {
  return new Promise((res, rej) => {
    try {
      fs.readFile(path, 'utf-8', (err, data) => {
        const json = JSON.parse(data);
        const statusObj = json
          .filter(el => el.countryRegion !== 'US' || el.combinedKey === 'US')
          .map(i => Object.entries(i.caseData))
          .flat()
          .reduce((acc, item) => {
            let [date, value] = item;
            value = parseInt(value) ?? 0;
            if (typeof acc[date] === 'undefined') acc[date] = 0;
            acc[date] += value;
            return acc;
          }, {});
        res(statusObj);
      });
    } catch (err) {
      console.error(err);
      rej(err);
    }
  });
}

function objCreator() {
  return Promise.all(
    ['confirmed', 'deaths', 'recovered'].map(
      status =>
        new Promise(async (res, rej) => {
          try {
            const filePath = `./data/${status}.json`;
            const convertObj = await dataReducer(filePath, status);
            res(convertObj);
          } catch (err) {
            console.error(err);
            rej(err);
          }
        })
    )
  );
}

function totalMaker() {
  return new Promise(async (res, rej) => {
    try {
      const arrData = await objCreator();
      console.log(arrData);
      await writeJSONFile(arrData, './data/totals.json').then(() => res());
    } catch (err) {
      console.error(err);
      rej(err);
    }
  });
}

totalMaker();
