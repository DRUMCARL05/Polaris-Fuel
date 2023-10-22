import Image from "next/image";
import React from "react";

type Props = {
    formatNumber: any;
    userPolarisExpSupplyAmount:any
};
const AppFooter = ({ formatNumber,userPolarisExpSupplyAmount }: Props) => {
  return (
    <footer className='border-t border-gray-100/60 px-4 lg:px-10 py-5'>
    <div className='max-w-screen-2xl mx-auto flex items-center justify-between text-sm'>
      <div className='flex items-center space-x-2'>
        <p className='text-white font-medium'>Membership Level: </p>
        <div className='w-4 h-4 shrink-0 border-4 border-brand-primary rounded-full'></div>
        <p className='text-brand-primary'>Bronze</p>
      </div>

      <div className='flex items-center space-x-2'>
        <p className='text-white font-medium'>Current PXP: </p>
        <p className='text-brand-primary'>
          {formatNumber(userPolarisExpSupplyAmount)}
        </p>
      </div>
    </div>
  </footer>
  );
};

export default AppFooter;
