import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import PageA from './pages/PageA';
import PageB from './pages/PageB';
import { useEffect } from 'react';

const Navigation = () => {
  const location = useLocation();

  const items = [
    {
      key: '/template/a',
      label: <Link to='/template/a'>页面 A</Link>,
    },
    {
      key: '/template/b',
      label: <Link to='/template/b'>页面 B</Link>,
    },
  ];

  useEffect(() => {
    if (location.pathname === '/') {
      window.location.href = '/template';
    }
  }, [location.pathname]);

  return (
    <Menu
      mode='horizontal'
      selectedKeys={[location.pathname === '/template' ? '/template/a' : location.pathname]}
      className='mb-4'
      items={items}
    />
  );
};

function App() {
  return (
    <Router basename='/'>
      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto px-4 py-8'>
          <h1 className='text-3xl font-bold text-center mb-8'>Template App</h1>
          <Navigation />
          <div className='bg-white rounded-lg shadow p-6'>
            <Routes>
              <Route path='/template/a' element={<PageA />} />
              <Route path='/template/b' element={<PageB />} />
              <Route path='/template' element={<PageA />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
