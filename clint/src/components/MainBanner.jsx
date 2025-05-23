import React from 'react'
import { assets } from "../assets/assets";
import { Link } from 'react-router-dom';

const MainBanner = () => {
  return (
    <div className="relative">
      <img src={assets.main_banner_bg} alt="Main Banner" className="w-full hidden md:block"/>
      <img src={assets.main_banner_bg_sm} alt="Main Banner Mobile" className="w-full md:hidden"/>
      <div className='absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-24 md:pb-0 px-4 md:pl-18 lg:p1-24'>
      <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left max-w-[18rem] md:max-w-[28rem] lg:max-w-[40rem] leading-tight lg:leading-[3.5rem] tracking-tight antialiased'>
          Freshness You Can Trust, Savings You will Love!
      </h1>     
      <div className='flex items-center mt-6 font-medium'>
            <Link to={"/products"} className="bg-[#43b38c] hover:bg-[#3ca57f] text-white font-semibold text-lg px-8 py-3 rounded-md transition duration-200 shadow-sm">Shop now
            <img className='md:hidden transition group-focus:translate-x-1' src={assets.white_arrow_icon} alt="arrow" />
            </Link>
            <Link to={"/products"} className='group hidden md:flex items-center gap-2 px-9 py-3 cursor-pointer text-base md:text-lg'>
             Explore deals
            <img className='transition group-hover:translate-x-1' src={assets.black_arrow_icon} alt="arrow" />
            </Link>
      </div>
      </div>
     </div>
  );
};

export default MainBanner;
