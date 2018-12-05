
const fs = require('fs');
const path = require('path');
const process = require('process');
const getBlockBookFee = require('./helper/blockbook');

let argPath = process.argv[2] || process.cwd();
const exportPath = path.normalize(argPath);

if(!fs.existsSync(exportPath)) {
  console.error('Path does not exist');
  process.exit();
}

const coinsArr = [
  {coin: 'bitcoin', getFee: getBlockBookFee('wss://btc-blockbook1.coinid.org')},
  {coin: 'testnet', getFee: getBlockBookFee('wss://testnet-blockbook1.coinid.org')},
  {coin: 'myriad', getFee: getBlockBookFee('wss://xmy-blockbook1.coinid.org')},
  {coin: 'groestlcoin', getFee: getBlockBookFee('wss://blockbook.groestlcoin.org')},
  {coin: 'groestlcoin-testnet', getFee: getBlockBookFee('wss://blockbook-test.groestlcoin.org')},
];

const pArr = coinsArr.map(({coin, getFee}) => {
  return getFee()
  .then((feeArr) => {
    const file = `${exportPath}/${coin}.json`;
    fs.writeFileSync(file, JSON.stringify({data: feeArr}));

    console.log(`Wrote file ${file}`);
    return { coin, file}
  });
});

Promise.all(pArr).then((res) => {
  console.log('All done!');
}).catch((error) => {
  console.log({error})
});
