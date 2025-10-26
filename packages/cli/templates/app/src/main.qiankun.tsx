import './public-path.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { renderWithQiankun, qiankunWindow, type QiankunProps } from 'vite-plugin-qiankun/dist/helper';
import App from './App';
import './index.css';

// 保存主应用传递的全局状态管理对象
let globalStateActions: { onGlobalStateChange: any; setGlobalState: any } | null = null;

function render(props: QiankunProps) {
  const { container } = props;
  const rootElement = container ? container.querySelector('#root') : document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  const useStrictMode = process.env.NODE_ENV === 'development';

  if (useStrictMode) {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } else {
    root.render(<App />);
  }

  return root;
}

let root: ReturnType<typeof createRoot> | null = null;

renderWithQiankun({
  mount(props) {
    const { onGlobalStateChange, setGlobalState } = props;
    globalStateActions = { onGlobalStateChange, setGlobalState };
    root = render(props);
  },
  bootstrap() {
    // bootstrap 生命周期
  },
  unmount() {
    if (root) {
      root.unmount();
      root = null;
    }
  },
  update(props) {
    root = render(props);
  },
});

// 子应用可以通过调用该函数更新全局状态
export function updateGlobalState(newState: Record<string, any>) {
  if (globalStateActions) {
    globalStateActions.setGlobalState(newState);
  }
}

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
