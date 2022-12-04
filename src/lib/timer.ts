let data = 2;
export const updateDataTimer = () => {
  let count = 0;
  let interval = setInterval(() => {
    data++;
    count++;
    console.log("data timer", data);
    if (count >= 10000) {
      clearInterval(interval);
    }
  }, 9 * 1000);
};
