import React from 'react';
import MyForm from './Funtional/Forms/MyForm';
import ProfileFiles from './ProfileFiles';

const ContactAndFiles = () => {
  return (
    <div className='flex flex-col md:flex-row gap-2 w-full min-h-screen p-0 bg-white justify-center items-start'>
      <div className='w-1/2 flex items-start justify-end'>
        <div className='w-11/12 bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.2)] rounded-[8px] p-[29px] mt-[10px] mb-[10px]'>
          <MyForm />
        </div>
      </div>

      <div className='w-1/2 flex items-start justify-start'>
        <div className='w-11/12 bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.2)] rounded-[8px] p-[29px] mt-[10px] mb-[10px]'>
          <ProfileFiles />
        </div>
      </div>
    </div>
  );
};

export default ContactAndFiles;
