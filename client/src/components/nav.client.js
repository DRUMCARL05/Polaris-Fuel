"use client"

import React from 'react';
import '../styles/homepage.css';
import bg from '../../public/buttonBackground.png';
import { PiWalletLight } from "react-icons/pi";

export default function Nav({ activeLink, onLinkClick }) {

  function connectWallet() {
    alert("Connect Wallet");
  }

  return (
    <nav style={{ marginTop: -10, marginBottom: 0 }}>
      <img src="/polarisTextLogo.png" alt="polaris logo" className="logo" />
      <div className="middleLinks">
        <h2 className={activeLink === 'Buy' ? 'active' : ''} onClick={() => onLinkClick('Buy')}>
          <span>01</span>Buy
        </h2>
        <h2 className={activeLink === 'Sell' ? 'active' : ''} onClick={() => onLinkClick('Sell')}>
          <span>02</span>Sell
        </h2>
        <h2 className={activeLink === 'Earn' ? 'active' : ''} onClick={() => onLinkClick('Earn')}>
          <span>03</span>Earn
        </h2>
      </div>
      <button onClick={connectWallet} className="connectWallet" style={{
        backgroundImage: `url(${bg.src})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}>
        <PiWalletLight className='walletIcon' />
        Connect Wallet
      </button>
    </nav>
  );
}
