import Web3 from 'web3';

export default async function getWeb3() {
    try {
        // @ts-ignore
        if (window.ethereum) {
            // @ts-ignore
            const web3 = new Web3(window.ethereum);
            // @ts-ignore
            await window.ethereum.enable();

            return web3;
            // @ts-ignore
        } else if (window.web3) {
            // @ts-ignore
            return  new Web3(window.web3.currentProvider);
        } else {
            const provider = new Web3.providers.HttpProvider('localhost:8545');
            return  new Web3(provider);
        }
    } catch (err) {
        throw err;
    }
}