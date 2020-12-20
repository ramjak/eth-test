import React, {useCallback, useEffect, useState} from 'react';
import './App.css';
import Web3 from 'web3';
import WeenusTokenContract from './WeenusTokenABI.json';
import {statusEnum} from "./types/constant";
import getWeb3 from "./helpers/getWeb3";
import SendForm from "./components/sendForm";

function App() {
  const [w3, setW3] = useState<Web3 | null>(null);
  const [currentContract, setCurrentContract] = useState<any>(null);
  const [status, setStatus] = useState<statusEnum>(statusEnum.loading);
  const [transactionStatus, setTransactionStatus] = useState<statusEnum>(statusEnum.none);
  // const [accounts, setAccounts] = useState<string[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [ethBalance, setEthBalance] = useState('0');
  const [weenusBalance, setWeenusBalance] = useState('0');
  const [transactionHash, setTransactionHash] = useState('');

  const loadEthBalance = useCallback(async (web3, acc) => {
    const currentEthBalance = await web3.eth.getBalance(acc);
    setEthBalance(currentEthBalance);
    console.log({ currentEthBalance });
  }, []);

  const loadWeenusBalance = useCallback(async (contract: any, acc: string) => {
    const currentWeenusBalance = await contract.methods.balanceOf(acc).call();
    setWeenusBalance(currentWeenusBalance);
    console.log({currentWeenusBalance});
  }, []);

  const initiate = useCallback(async () => {
    let web3;
    try {
      web3 = await getWeb3();
      setW3(web3);
      setStatus(statusEnum.success);
    } catch (e) {
      setStatus(statusEnum.failed);
    }

    if (web3) {
      const contract = new web3.eth.Contract(
          // @ts-ignore
          WeenusTokenContract,
          '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA'
      );
      setCurrentContract(contract);

      // todo: user should be able to choose current account account
      const retrievedAccounts = await web3.eth.getAccounts();
      // setAccounts(retrievedAccounts);
      setCurrentAccount(retrievedAccounts[0]);

      loadEthBalance(web3, retrievedAccounts[0]);
      loadWeenusBalance(contract, retrievedAccounts[0]);
    }
  }, [loadEthBalance, loadWeenusBalance]);

  useEffect(() => { initiate(); }, [initiate]);

  const sendEth = useCallback(async ({to, amount}) => {
    if (w3) {
      try {
        setTransactionStatus(statusEnum.loading);
        const res = await w3.eth.sendTransaction({
          from: currentAccount,
          to,
          // value: '1200000000000000000'
          value: amount
        }).on('transactionHash', function(hash: any){
          setTransactionHash(hash);
        });
        loadEthBalance(w3, currentAccount);
        setTransactionStatus(statusEnum.success);
        console.log({ res })
      } catch (e) {
        setTransactionStatus(statusEnum.failed);
        console.log({ e, from: currentAccount,
          to,
          // value: '1200000000000000000'
          value: amount });
      }
    }
  }, [w3, currentAccount, loadEthBalance]);

  const sendWeenus = useCallback(async ({to, amount}) => {
    if (currentContract) {
      try {
        setTransactionStatus(statusEnum.loading);
        const res = await currentContract.methods
            .transfer(to, amount)
            .send({ from: currentAccount })
            .on('transactionHash', function(hash: any) {
              setTransactionHash(hash);
            });
        console.log({ res });
        loadWeenusBalance(currentContract, currentAccount);
        setTransactionStatus(statusEnum.success);
      } catch (e) {
        setTransactionStatus(statusEnum.failed);
        console.log({ e });
      }
    }
  }, [currentContract, currentAccount, loadWeenusBalance]);

  return (
    <div>
      {status === statusEnum.failed && 'Failed to connect'}
      {status === statusEnum.loading && 'connect to metamask...'}
      {w3 && (
          <>
            <div>ETH balance: {ethBalance && w3.utils.fromWei(ethBalance)}</div>
            <div>WEENUS balance: {weenusBalance}</div>
            <hr/>
            <br/>
            <div>
              {transactionStatus === statusEnum.loading && `Your transaction is pending.`}
              {transactionStatus !== statusEnum.none && transactionStatus !== statusEnum.loading && `Your transaction is ${transactionStatus}.`}
              {transactionHash && <span>
                {' '}Here's your transaction hash: {' '}
                <a href={`https://ropsten.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noreferrer">
                {transactionHash}
              </a>
              </span>}
            </div>
            <div>
              Send ETH (in wei):
              <SendForm onSubmit={sendEth} />
            </div>
            <br/>
            <div>
              Send Weenus:
              <SendForm onSubmit={sendWeenus} />
            </div>
          </>
      )}
    </div>
  );
}

export default App;
