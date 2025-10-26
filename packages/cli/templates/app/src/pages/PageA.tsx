import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const PageA: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToB = () => {
    navigate('/b');
  };

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Page A</h1>
      <Button onClick={handleGoToB}>Go to Page B</Button>
    </div>
  );
};

export default PageA;
