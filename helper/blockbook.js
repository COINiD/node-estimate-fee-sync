const io = require('socket.io-client');

const getAllFees = (url) => {
  const socket = io(url, { transports: ['websocket'], rejectUnauthorized: false });

  const getFee = (blocks) => {
    return new Promise((resolve, reject) => {
      const conservative = true;
      socket.send({ method: 'estimateSmartFee', params: [blocks, conservative] }, ({result}) => {
        const feeBtcPerKb = Number(result);
        const feeSatPerByte = Math.ceil(1e8*feeBtcPerKb/1024);
        resolve([blocks, feeSatPerByte]);
      });
    });
  };

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.disconnect();
      reject(`${url} took to long...`);
    }, 10000);

    const pArr = Array(50).fill().map((e, i) => getFee(i+2));
    Promise.all(pArr)
    .then((res) => {
      clearTimeout(timer);
      socket.disconnect();

      let lastFee;
      const feeArr = res.reduce((a, [block, fee]) => {
        if(!Number.isInteger(block) || !Number.isInteger(fee)) {
          throw('Wierd format');
        }
          
        if(lastFee !== fee) {
          lastFee = fee;

          a.push([block, fee]);
        }
        return a;
      }, []);

      resolve(feeArr);
    });
  });
}

module.exports = (url) => {
  return () => getAllFees(url);
}