import Image from "next/image";
import React from "react";

type Props = {
  connectWallet: any;
};
const AppNavbar = ({ connectWallet }: Props) => {
  return (
    <header className='max-w-screen-2xl w-full bg-[#000814] mx-auto fixed top-0 inset-x-0 px-4 md:px-8 py-3'>
      <nav className='flex items-center justify-between'>
        <div className='flex items-center'>
          <span className='relative w-14 h-14 lg:w-20 lg:h-20 shrink-0'>
            <Image src='/logo.png' alt='Polaris Logo' fill />
          </span>
          <h2 className='md:text-lg xl:text-2xl font-semibold text-white'>
            Polaris Fuel
          </h2>
        </div>
        <button
          className='relative bg-brand-primary text-white text-sm xl:text-lg rounded-lg xl:rounded-2xl px-4 py-2 lg:px-8 lg:py-3'
          onClick={connectWallet}>
          Connect Wallet
        </button>
      </nav>
    </header>
  );
};

export default AppNavbar;
