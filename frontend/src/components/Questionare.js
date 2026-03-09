// src/components/Dashboard.js
import React from 'react';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import { Link } from 'react-router-dom';

const Questionaire = () => {
  return (
    <>
      <Header />

      <div className='main-dashboard  main-dashboard-bg '>
        <div className='container'>
          <div className='main-dashboard-row'>
            <Sidebar />

            <div className=' main-banner questionare-btn rounded-lg pr-0 w-[100%] col-span-1 my-[30px] mx-0 lg:w-[75%] max-w-full md:w-[75%] max-w-full py-0'>
              <div className='das-boargd-questionare'>
                <h2 className='font-inter font-normal font-semibold text-[30px] leading-[36px] flex items-center mb-5'>
                  {' '}
                  Section I - Compliance with Duties of information{' '}
                </h2>
                <h3 className='font-inter italic font-normal text-[25px] leading-[30px] text-[#42BBFF] mb-10'>
                  {' '}
                  These fields are pre populated by DSF{' '}
                </h3>
              </div>

              <div className='box-wrapper'>
                <div className='mb-10'>
                  <label
                    className='block text-gray-700 font-semibold text-[16px] leading-[19px] text-[#000000] mb-[10px]'
                    htmlFor='token-name'
                  >
                    {' '}
                    I.02 Statement in accordance with Article 6(3) of Regulation
                    (EU) 2023/1114
                  </label>
                  <input
                    type='text'
                    className='peer bg-[rgba(99,93,255,0.05)] border border-[rgba(99,93,255,0.5)] p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full'
                    placeholder='This crypto-asset white paper has not been approved by any competent authority in any Member State of the European Union. The offeror of the crypto-asset is solely responsible for the content of this crypto-asset white paper.'
                  />
                </div>

                <div className='mb-10'>
                  <label
                    className='font-inter font-semibold text-[20px] leading-[24px] text-black mb-5'
                    htmlFor='token-name'
                  >
                    {' '}
                    I.03 Compliance statement in accordance with Article 6(6) of
                    Regulation (EU) 2023/1114{' '}
                  </label>
                  <input
                    type='text'
                    className='peer bg-[rgba(99,93,255,0.05)] border border-[rgba(99,93,255,0.5)] p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full'
                    placeholder='This crypto-asset white paper complies with Title II of Regulation (EU) 2023/1114 and, to the best of the knowledge of the management body, the information presented in the crypto-asset white paper is fair, clear and not misleading and the crypto-asset white paper makes no omission likely to affect its import.'
                  />
                </div>

                <div className='mb-10'>
                  <label
                    className='font-inter font-semibold text-[20px] leading-[24px] text-black mb-5'
                    htmlFor='token-name'
                  >
                    {' '}
                    I.04 Statement in accordance with Article 6(5), points (a),
                    (b), (c) of Regulation (EU) 2023/1114
                  </label>
                  <input
                    type='text'
                    className='peer bg-[rgba(99,93,255,0.05)] border border-[rgba(99,93,255,0.5)] p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full'
                    placeholder='The crypto-asset may lose its value in part or in full, may not always be transferable and may not be liquid.'
                  />
                </div>

                <div className='mb-10'>
                  <label
                    className='font-inter font-semibold text-[20px] leading-[24px] text-black mb-5'
                    htmlFor='token-name'
                  >
                    {' '}
                    I.05 Statement in accordance with Article 6(3) of Regulation
                    (EU) 2023/1114{' '}
                  </label>
                  <input
                    type='text'
                    className='peer bg-[rgba(99,93,255,0.05)] border border-[rgba(99,93,255,0.5)] p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full'
                    placeholder='This crypto-asset white paper has not been approved by any competent authority in any Member State of the European Union. The offeror of the crypto-asset is solely responsible for the content of this crypto-asset white paper.'
                  />
                </div>

                <div className='mb-10'>
                  <label
                    className='font-inter font-semibold text-[20px] leading-[24px] text-black mb-5'
                    htmlFor='token-name'
                  >
                    {' '}
                    I.06 Statement in accordance with Article 6(3) of Regulation
                    (EU) 2023/1114{' '}
                  </label>
                  <input
                    type='text'
                    className='peer bg-[rgba(99,93,255,0.05)] border border-[rgba(99,93,255,0.5)] p-[15px_25px] rounded-[7px] font-inter font-normal text-[16px] leading-[160%] text-black w-[100%] max-w-full'
                    placeholder=' This crypto-asset white paper has not been approved by any competent authority in any Member State of the European Union. The offeror of the crypto-asset is solely responsible for the content of this crypto-asset white paper.'
                  />
                </div>

                <Link
                  to='/section1'
                  className='bg-blue-500 text-white px-4 py-2 rounded-lg'
                >
                  Next
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Questionaire;
