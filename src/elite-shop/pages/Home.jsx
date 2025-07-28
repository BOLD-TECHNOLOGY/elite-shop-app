import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import NavigationLayout from "../pages/layout/NavigationLayout.jsx";
import EliteShopHero from "../../Components/pages/EliteShopHero.jsx";

const { Content } = Layout;

export default function Home() {
  return (
    <NavigationLayout pageTitle="Home">
      {/* Hero Section */}
      <div style={{ width: '100%', marginBottom: 24 }}>
        <EliteShopHero />
      </div>
      
      {/* Main Content */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <Outlet />
      </div>
    </NavigationLayout>
  );
}