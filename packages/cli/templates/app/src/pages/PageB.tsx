import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const PageB: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToA = () => {
    navigate('/a');
  };

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Page B</h1>
      <Button onClick={handleGoToA}>Go to Page A</Button>
    </div>
  );
};

export default PageB;
