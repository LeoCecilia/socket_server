import { dataProps } from "../data/data";

// let data = 2;
/**
 * update data
 * TODO: maybe save data into data.json
 * @param data
 */
export const updateDataTimer = (
  data: dataProps,
  callback: (data: dataProps) => void,
  interval: number
) => {
  let count = 0;
  let tick = setInterval(() => {
    callback(data);
    console.log("data timer", data);
    if (count >= 10000) {
      clearInterval(tick);
    }
  }, interval);
};
