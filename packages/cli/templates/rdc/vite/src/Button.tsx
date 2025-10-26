// @ts-ignore
import React from 'react';
import { Space, Divider, Button } from 'antd';
import { Button as MTDButton } from '@ss/mtd-react';
import '@ss/mtd-react/lib/style/index.css';

const App = () => {
  // 处理编辑按钮点击事件
  const handleEditClick = () => {
    // 使用 VSCode 的 URL 协议打开文件
    // vscode://file/{full path to file}
    const relativePath = 'rdc/test/src/Button.tsx';
    const vsCodeUrl = `vscode://file/${relativePath}`;

    // 也可以尝试 Cursor 的 URL 协议
    const cursorUrl = `cursor://open?file=${encodeURIComponent(relativePath)}`;

    // 打开编辑器
    try {
      window.open(cursorUrl, '_blank');
      console.log('尝试使用 Cursor 打开文件:', relativePath);
    } catch (error) {
      console.error('打开 Cursor 失败，尝试使用 VSCode:', error);
      window.open(vsCodeUrl, '_blank');
    }
  };

  // 将所有内容移到函数组件内部
  return (
    <>
      <h2 className='font-bold text-2xl text-[#333]'>RDC Component</h2>
      <Divider />
      <Space>
        <div>
          <Button>AntdButton</Button>
          <MTDButton className='ml-10' type='primary'>
            MTDButton
          </MTDButton>
        </div>
      </Space>
      <Divider />
      <div>项目采用Vite + React + TailwindCSS + TypeScript技术栈</div>
      <div>
        组件来自<span className='bg-[#a8a8a8] text-[#fff]'> rdc/test/src/App.tsx </span>中的代码
        <Button type='link' className='pl-1' onClick={handleEditClick}>
          去编辑此文件&nbsp;&gt;&gt;
        </Button>
      </div>
    </>
  );
};

export default App;
