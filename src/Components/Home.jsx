import React from "react";
import {
  Card,
  Avatar,
  Typography,
  Space,
  Divider,
  Tag,
  Progress,
  Statistic,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  StockOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const marketPosts = [
    {
      id: 1,
      title: "Tech Stocks Rally Amid AI Boom",
      excerpt:
        "Major technology companies see significant gains as artificial intelligence investments drive market optimism and investor confidence.",
      date: "Apr 18, 2024",
      author: "Michael Chen",
      readTime: "5 min read",
      likes: 24,
      views: 156,
      authorAvatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      category: "Market Analysis",
      tags: ["Tech Stocks", "AI", "NASDAQ"],
      relatedStocks: ["AAPL", "MSFT", "NVDA"],
    },
    {
      id: 2,
      title: "Federal Reserve Holds Rates Steady",
      excerpt:
        "The Federal Reserve maintains current interest rates, signaling confidence in economic stability while monitoring inflation trends.",
      date: "Apr 15, 2024",
      author: "Sarah Johnson",
      readTime: "8 min read",
      likes: 18,
      views: 89,
      authorAvatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      category: "Economic News",
      tags: ["Federal Reserve", "Interest Rates", "Economy"],
      relatedStocks: ["JPM", "BAC", "WFC"],
    },
    {
      id: 3,
      title: "Energy Sector Volatility Continues",
      excerpt:
        "Oil and gas stocks experience fluctuations as geopolitical tensions and supply concerns impact global energy markets.",
      date: "Apr 12, 2024",
      author: "Robert Williams",
      readTime: "12 min read",
      likes: 32,
      views: 201,
      authorAvatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      category: "Sector Analysis",
      tags: ["Energy", "Oil", "Commodities"],
      relatedStocks: ["XOM", "CVX", "COP"],
    },
    {
      id: 4,
      title: "Biotech Breakthroughs Drive Pharma Gains",
      excerpt:
        "Pharmaceutical companies surge following successful clinical trials and regulatory approvals for innovative treatments.",
      date: "Apr 10, 2024",
      author: "Dr. Emily Chen",
      readTime: "10 min read",
      likes: 41,
      views: 167,
      authorAvatar: "https://xsgames.co/randomusers/avatar.php?g=female",
      category: "Healthcare",
      tags: ["Biotech", "Pharma", "Healthcare"],
      relatedStocks: ["PFE", "MRK", "JNJ"],
    },
  ];

  const stockData = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 175.34,
      change: +2.45,
      changePercent: +1.42,
      volume: "45.2M",
      marketCap: "2.7T",
      sector: "Technology",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 415.86,
      change: +5.23,
      changePercent: +1.27,
      volume: "32.1M",
      marketCap: "3.1T",
      sector: "Technology",
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 885.21,
      change: +23.67,
      changePercent: +2.75,
      volume: "58.9M",
      marketCap: "2.2T",
      sector: "Semiconductors",
    },
    {
      symbol: "JPM",
      name: "JPMorgan Chase & Co.",
      price: 195.67,
      change: -1.23,
      changePercent: -0.62,
      volume: "15.8M",
      marketCap: "570B",
      sector: "Financial Services",
    },
    {
      symbol: "XOM",
      name: "Exxon Mobil Corporation",
      price: 118.45,
      change: +0.89,
      changePercent: +0.76,
      volume: "22.3M",
      marketCap: "475B",
      sector: "Energy",
    },
    {
      symbol: "PFE",
      name: "Pfizer Inc.",
      price: 27.89,
      change: +1.45,
      changePercent: +5.48,
      volume: "38.7M",
      marketCap: "157B",
      sector: "Pharmaceuticals",
    },
  ];

  const marketIndices = [
    {
      name: "S&P 500",
      value: 5224.81,
      change: +45.23,
      changePercent: +0.87,
      status: "up",
    },
    {
      name: "NASDAQ",
      value: 16385.47,
      change: +128.67,
      changePercent: +0.79,
      status: "up",
    },
    {
      name: "DOW JONES",
      value: 39432.91,
      change: -123.45,
      changePercent: -0.31,
      status: "down",
    },
    {
      name: "RUSSELL 2000",
      value: 2076.34,
      change: +12.89,
      changePercent: +0.62,
      status: "up",
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Market Indices Header */}
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={2}
          style={{
            textAlign: "center",
            marginBottom: "24px",
            color: "#1f2937",
          }}
        >
          <StockOutlined style={{ marginRight: "12px" }} />
          Market Overview
        </Title>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {marketIndices.map((index, idx) => (
            <Card key={idx} size="small" style={{ textAlign: "center" }}>
              <Statistic
                title={index.name}
                value={index.value}
                precision={2}
                valueStyle={{
                  color: index.status === "up" ? "#16a34a" : "#dc2626",
                  fontSize: "18px",
                }}
                suffix={
                  index.status === "up" ? (
                    <RiseOutlined style={{ color: "#16a34a" }} />
                  ) : (
                    <FallOutlined style={{ color: "#dc2626" }} />
                  )
                }
              />
              <Text
                style={{
                  color: index.status === "up" ? "#16a34a" : "#dc2626",
                  fontSize: "12px",
                }}
              >
                {index.change >= 0 ? "+" : ""}
                {index.change} ({index.changePercent}%)
              </Text>
            </Card>
          ))}
        </div>
      </div>

      {/* Stock Data Table */}
      <Card title="Today's Market Movers" style={{ marginBottom: "32px" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Symbol
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: "600",
                  }}
                >
                  Price
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: "600",
                  }}
                >
                  Change
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: "600",
                  }}
                >
                  Change %
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: "600",
                  }}
                >
                  Volume
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Sector
                </th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((stock, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px" }}>
                    <Tag color="blue" style={{ fontWeight: "bold" }}>
                      {stock.symbol}
                    </Tag>
                  </td>
                  <td style={{ padding: "12px", fontWeight: "500" }}>
                    {stock.name}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "600",
                    }}
                  >
                    {formatPrice(stock.price)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: stock.change >= 0 ? "#16a34a" : "#dc2626",
                      fontWeight: "500",
                    }}
                  >
                    {stock.change >= 0 ? "+" : ""}
                    {formatPrice(stock.change)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: stock.changePercent >= 0 ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {stock.changePercent >= 0 ? "+" : ""}
                    {stock.changePercent}%
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {stock.volume}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <Tag color="geekblue">{stock.sector}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Market Insights Articles */}
      <Title level={3} style={{ marginBottom: "24px", color: "#1f2937" }}>
        <DollarOutlined style={{ marginRight: "12px" }} />
        Market Insights & Analysis
      </Title>

      <div
        style={{
          display: "grid",
          gap: "24px",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        }}
      >
        {marketPosts.map((post) => (
          <Card
            key={post.id}
            hoverable
            style={{
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            {/* Category Badge */}
            <div style={{ marginBottom: "16px" }}>
              <Text
                style={{
                  backgroundColor: "#f0f5ff",
                  color: "#1890ff",
                  padding: "4px 12px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {post.category}
              </Text>
            </div>

            {/* Post Title */}
            <Title
              level={4}
              style={{ marginBottom: "12px", lineHeight: "1.4" }}
            >
              {post.title}
            </Title>

            {/* Post Excerpt */}
            <Paragraph
              style={{ color: "#666", lineHeight: "1.6", marginBottom: "20px" }}
            >
              {post.excerpt}
            </Paragraph>

            {/* Related Stocks */}
            <div style={{ marginBottom: "16px" }}>
              <Text
                strong
                style={{ fontSize: "12px", color: "#666", marginRight: "8px" }}
              >
                Related Stocks:
              </Text>
              <Space size={4}>
                {post.relatedStocks.map((stock, index) => (
                  <Tag key={index} color="blue" style={{ fontSize: "11px" }}>
                    {stock}
                  </Tag>
                ))}
              </Space>
            </div>

            <Divider style={{ margin: "16px 0" }} />

            {/* Author and Metadata */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space size="small">
                <Avatar
                  size="small"
                  src={post.authorAvatar}
                  icon={<UserOutlined />}
                />
                <Text style={{ fontSize: "12px", color: "#666" }}>
                  {post.author}
                </Text>
              </Space>

              <Space size="middle">
                <Space size="small">
                  <CalendarOutlined
                    style={{ fontSize: "12px", color: "#999" }}
                  />
                  <Text style={{ fontSize: "12px", color: "#666" }}>
                    {post.date}
                  </Text>
                </Space>

                <Space size="small">
                  <ClockCircleOutlined
                    style={{ fontSize: "12px", color: "#999" }}
                  />
                  <Text style={{ fontSize: "12px", color: "#666" }}>
                    {post.readTime}
                  </Text>
                </Space>
              </Space>
            </div>

            {/* Engagement Metrics */}
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Space size="small">
                <HeartOutlined style={{ fontSize: "12px", color: "#ff4d4f" }} />
                <Text style={{ fontSize: "12px", color: "#666" }}>
                  {formatNumber(post.likes)}
                </Text>
              </Space>

              <Space size="small">
                <EyeOutlined style={{ fontSize: "12px", color: "#999" }} />
                <Text style={{ fontSize: "12px", color: "#666" }}>
                  {formatNumber(post.views)} views
                </Text>
              </Space>
            </div>
          </Card>
        ))}
      </div>

      {/* Market Performance Summary */}
      <Card title="Market Performance Summary" style={{ marginTop: "32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          <div>
            <Text strong>Top Gainers</Text>
            {stockData
              .filter((s) => s.changePercent > 0)
              .slice(0, 3)
              .map((stock, idx) => (
                <div
                  key={idx}
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>{stock.symbol}</Text>
                  <Text style={{ color: "#16a34a" }}>
                    +{stock.changePercent}%
                  </Text>
                </div>
              ))}
          </div>

          <div>
            <Text strong>Top Losers</Text>
            {stockData
              .filter((s) => s.changePercent < 0)
              .slice(0, 3)
              .map((stock, idx) => (
                <div
                  key={idx}
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>{stock.symbol}</Text>
                  <Text style={{ color: "#dc2626" }}>
                    {stock.changePercent}%
                  </Text>
                </div>
              ))}
          </div>

          <div>
            <Text strong>Most Active</Text>
            {stockData
              .sort((a, b) => b.volume.localeCompare(a.volume))
              .slice(0, 3)
              .map((stock, idx) => (
                <div
                  key={idx}
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>{stock.symbol}</Text>
                  <Text>{stock.volume}</Text>
                </div>
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Home;
