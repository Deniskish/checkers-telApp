import React from 'react';
import Board from './Board';
import './styles.css';
import { useTonConnectUI, TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

const tg = window.Telegram?.WebApp;
  tg?.ready();
  tg?.expand();
function App() {
  const [tonConnectUI] = useTonConnectUI();
  const userWallet = useTonAddress(); // адрес кошелька
  const isConnected = !!userWallet;   // true, если подключён

  const handlePay = async () => {
    await tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [{
        address: 'UQDzsM9IxhkMvLCXf-kf8HP53hVINPdsbKttmh-MhDEbUdA_',
        amount: '100000000',
        comment: 'checkers:match1'
      }]
    });
  };

  return (
    <div className="app">
      <h1>Шашки</h1>
      <div className="wallet-button-wrapper">
        <TonConnectButton />
      </div>

      {isConnected && (
        <>
          <p>Ваш TON-адрес: {userWallet}</p>
          <button onClick={handlePay}>Оплатить 0.1 TON</button>
        </>
      )}

      {!isConnected && (
        <p>Подключите кошелёк для продолжения</p>
      )}

      <Board />
    </div>
  );
}

export default App;
