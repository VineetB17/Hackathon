// App.js

import React, { useState } from 'react';
import './App.css';
import AccountCreation from './components/AccountCreation';
import AccountImport from './components/AccountImport';
import TransactionHistory from './components/TransactionHistory';
import { createAccount, importAccount, sendTransaction } from './utils/web3';

function App() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const handleAccountCreated = async () => {
    const newAccount = await createAccount();
    setAccount(newAccount);
  };

  const handleAccountImported = (privateKey) => {
    const importedAccount = importAccount(privateKey);
    setAccount(importedAccount);
  };

  const handleSendTransaction = async (to, amount) => {
    const receipt = await sendTransaction(account.address, to, amount, account.privateKey);
    setTransactions([...transactions, { from: account.address, to, amount }]);
  };

  return (
    <div className="App">
      <h1>Web3 Account Abstraction Demo</h1>
      {!account ? (
        <>
          <AccountCreation onAccountCreated={handleAccountCreated} />
          <AccountImport onAccountImported={handleAccountImported} />
        </>
      ) : (
        <>
          <h2>Account Address: {account.address}</h2>
          <button onClick={() => setAccount(null)}>Log Out</button>
          <TransactionHistory transactions={transactions} />
          <button onClick={() => handleSendTransaction('RECEIVER_ADDRESS', '0.1')}>Send Transaction</button>
        </>
      )}
    </div>
  );
}

export default App;

// AccountCreation.js

import React from 'react';
import { createAccount } from '../utils/web3';

function AccountCreation({ onAccountCreated }) {
  const handleCreateAccount = async () => {
    const account = await createAccount();
    onAccountCreated(account);
  };

  return (
    <div>
      <h2>Create New Account</h2>
      <button onClick={handleCreateAccount}>Create Account</button>
    </div>
  );
}

export default AccountCreation;

// AccountImport.js

import React, { useState } from 'react';

function AccountImport({ onAccountImported }) {
  const [privateKey, setPrivateKey] = useState('');

  const handleImportAccount = () => {
    // Validate private key
    if (!privateKey) return;
    onAccountImported(privateKey);
  };

  return (
    <div>
      <h2>Import Existing Account</h2>
      <input
        type="text"
        placeholder="Enter Private Key"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
      />
      <button onClick={handleImportAccount}>Import Account</button>
    </div>
  );
}

export default AccountImport;

// TransactionHistory.js

import React from 'react';

function TransactionHistory({ transactions }) {
  return (
    <div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map((tx, index) => (
          <li key={index}>
            <strong>From:</strong> {tx.from} <strong>To:</strong> {tx.to} <strong>Amount:</strong> {tx.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionHistory;

// web3.js

import Web3 from 'web3';

const INFURA_PROJECT_ID = 'YOUR_INFURA_PROJECT_ID';
const web3 = new Web3(`https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`);

export const createAccount = async () => {
  const account = await web3.eth.accounts.create();
  return account;
};

export const importAccount = (privateKey) => {
  return web3.eth.accounts.privateKeyToAccount(privateKey);
};

export const sendTransaction = async (from, to, amount, privateKey) => {
  const senderAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
  const gasPrice = await web3.eth.getGasPrice();
  const gas = await web3.eth.estimateGas({
    to,
    data: '0x',
  });
  const transaction = {
    from: senderAccount.address,
    to,
    value: amount,
    gas,
    gasPrice,
  };
  const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
  const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
  return receipt;
};
