
const fs = require('fs');
const getBlockBookFee = require('./helper/blockbook');

const coinsArr = [
  {coin: 'bitcoin', getFee: getBlockBookFee('wss://btc-blockbook1.coinid.org')},
  {coin: 'testnet', getFee: getBlockBookFee('wss://testnet-blockbook1.coinid.org')},
  {coin: 'myriad', getFee: getBlockBookFee('wss://xmy-blockbook1.coinid.org')},
  {coin: 'groestlcoin', getFee: getBlockBookFee('wss://blockbook.groestlcoin.org:9145')},
];

const pArr = coinsArr.map(({coin, getFee}) => {
  return getFee()
  .then((feeArr) => {
    if(!fs.existsSync('./export')) {
      fs.mkdirSync('./export');
    }
    const file = `./export/${coin}.json`;
    fs.writeFileSync(`./export/${coin}.json`, JSON.stringify({data: feeArr}));

    console.log(`Wrote file ${file}`);
    return { coin, file}
  });
});

Promise.all(pArr).then((res) => {
  console.log('All done!');
}).catch((error) => {
  console.log({error})
});