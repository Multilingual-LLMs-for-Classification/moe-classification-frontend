import { Outlet } from 'react-router-dom';
import { ConfigProvider } from '../context/ConfigContext';

export default function ConfigLayout() {
  return (
    <ConfigProvider>
      <Outlet />
    </ConfigProvider>
  );
}
