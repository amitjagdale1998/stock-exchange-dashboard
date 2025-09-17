import React, { useState, useEffect } from "react";
import ExCel from "./ExCel";
import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";

const { Header, Content, Footer, Sider } = Layout;

const siderStyle = {
  overflow: "auto",
  height: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
  backgroundColor: "#fff",
};

const Sidebar = ({ children, onMenuSelect }) => {
  const [selectedKey, setSelectedKey] = useState("1");

  // Define menu items with proper routes
  const items = [
    {
      key: "1",
      icon: React.createElement(HomeOutlined),
      label: "Home",
      path: "/home",
    },
    {
      key: "2",
      icon: React.createElement(UserOutlined),
      label: "Portfolios",
      path: "/portfolios",
    },
    {
      key: "3",
      icon: React.createElement(VideoCameraOutlined),
      label: "Experimentals",
      path: "/experimentals",
    },
    {
      key: "4",
      icon: React.createElement(UploadOutlined),
      label: "Stack Archives",
      path: "/stack",
    },
    {
      key: "5",
      icon: React.createElement(BarChartOutlined),
      label: "Refer a Friend",
      path: "/refer",
    },
    {
      key: "6",
      icon: React.createElement(CloudOutlined),
      label: "Gift Subscription",
      path: "/gift",
    },
    {
      key: "7",
      icon: React.createElement(AppstoreOutlined),
      label: "Account",
      path: "/account",
    },
    {
      key: "8",
      icon: React.createElement(TeamOutlined),
      label: "Community",
      path: "/community",
    },
  ];

  // Handle menu item click
  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    const selectedItem = items.find((item) => item.key === key);
    if (selectedItem && onMenuSelect) {
      onMenuSelect(selectedItem.path, selectedItem.label);
    }
  };

  // Move ExCel call to useEffect to prevent blocking the render
  useEffect(() => {
    const loadExcelData = async () => {
      try {
        const data = await ExCel();
        console.log("Excel data loaded:", data);
      } catch (error) {
        console.error("Error loading Excel data:", error);
      }
    };

    loadExcelData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <Layout hasSider>
      <Sider style={siderStyle}>
        <div
          className="demo-logo-vertical"
          style={{
            height: "64px",
            margin: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#1890ff",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          CapitalMind
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{
            borderRight: 0,
            backgroundColor: "#fff",
          }}
          items={items.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <h2 style={{ margin: 0, color: "#262626" }}>
            {items.find((item) => item.key === selectedKey)?.label ||
              "Dashboard"}
          </h2>
        </Header>
        <Content
          style={{
            margin: "24px 16px 0",
            overflow: "initial",
            backgroundColor: "#f5f5f5",
            minHeight: "calc(100vh - 112px)",
          }}
        >
          <div
            style={{
              padding: 24,
              backgroundColor: "#fff",
              borderRadius: "8px",
              minHeight: "calc(100vh - 160px)",
            }}
          >
            {children || (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <h3>
                  Welcome to{" "}
                  {items.find((item) => item.key === selectedKey)?.label}
                </h3>
                <p>Select a menu item to navigate to different sections.</p>
              </div>
            )}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
            backgroundColor: "#fff",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          CapitalMind ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Sidebar;
