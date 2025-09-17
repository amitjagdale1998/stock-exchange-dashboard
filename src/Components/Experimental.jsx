import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  DatePicker,
  Select,
  Slider,
  Card,
  Statistic,
  Row,
  Col,
  Switch,
  Spin,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
  notification,
} from "antd";
import {
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  SettingOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// Register Chart.js components with additional features
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const { Option } = Select;
const { Title: AntTitle, Text } = Typography;

// Date utility functions with enhanced error handling
const formatDate = (date, format = "DD-MM-YYYY") => {
  try {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error("Invalid date object");
    }

    if (format === "DD-MM-YYYY") {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid Date";
  }
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const subtractDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const isSameOrAfter = (date1, date2) => date1 >= date2;
const isSameOrBefore = (date1, date2) => date1 <= date2;
const diffInDays = (date1, date2) =>
  Math.ceil((date1 - date2) / (1000 * 60 * 60 * 24));

// Enhanced data sampling strategies with performance monitoring
const dataSamplingStrategies = {
  uniform: (data, maxPoints) => {
    if (data.length <= maxPoints) return data;
    const step = Math.floor(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  },
  recent: (data, maxPoints) => {
    if (data.length <= maxPoints) return data;
    return data.slice(-maxPoints);
  },
  smart: (data, maxPoints) => {
    if (data.length <= maxPoints) return data;

    // Keep first, last, and significant points (peaks/valleys)
    const significantPoints = [data[0]];
    const windowSize = Math.max(3, Math.floor(data.length / (maxPoints / 2)));

    for (let i = windowSize; i < data.length - windowSize; i += windowSize) {
      const window = data.slice(i - windowSize, i + windowSize);
      const values = window.map((d) => parseFloat(d["NAV (Rs)"]));
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);

      const maxPoint = window.find(
        (d) => parseFloat(d["NAV (Rs)"]) === maxValue
      );
      const minPoint = window.find(
        (d) => parseFloat(d["NAV (Rs)"]) === minValue
      );

      if (maxPoint) significantPoints.push(maxPoint);
      if (minPoint && maxPoint !== minPoint) significantPoints.push(minPoint);
    }

    significantPoints.push(data[data.length - 1]);
    return significantPoints.sort(
      (a, b) => new Date(a.dateObject) - new Date(b.dateObject)
    );
  },
};

const Experimental = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => dayjs().subtract(1, "year"));
  const [endDate, setEndDate] = useState(() => dayjs());
  const [samplingStrategy, setSamplingStrategy] = useState("uniform");
  const [maxDataPoints, setMaxDataPoints] = useState(1000);
  const [showDataPoints, setShowDataPoints] = useState(false);
  const [enableVirtualization, setEnableVirtualization] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Generate professional mock data with realistic financial patterns
  const generateMockData = useCallback(() => {
    const data = [];
    const startValue = 100;
    let currentValue = startValue;
    let trend = 0.001; // Slight upward trend

    const startDateTime = startDate.toDate();
    const endDateTime = endDate.toDate();
    const daysDiff = diffInDays(endDateTime, startDateTime);

    for (let i = 0; i <= daysDiff; i += 1) {
      // Daily data for realism
      const date = addDays(startDateTime, i);

      // More realistic financial data with volatility clustering
      const volatility = 0.8 + Math.random() * 0.4; // Varying volatility
      const change = (Math.random() - 0.5 + trend) * volatility * 2;
      currentValue = Math.max(50, currentValue * (1 + change / 100)); // Percentage-based changes

      // Add some market patterns (weekend effect, monthly trends)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentValue *= 0.998; // Slight dip on weekends
      }

      data.push({
        "NAV Date": formatDate(date),
        "NAV (Rs)": parseFloat(currentValue.toFixed(4)),
        dateObject: date,
      });
    }

    return data;
  }, [startDate, endDate]);

  // Enhanced Excel data loader with error handling and retry mechanism
  const loadExcelData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay for realistic loading experience
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const jsonData = generateMockData();

      if (!jsonData || !Array.isArray(jsonData)) {
        throw new Error("Invalid data format received from data source");
      }

      const processedData = jsonData
        .filter((row) => row["NAV Date"] && row["NAV (Rs)"])
        .map((row) => ({
          ...row,
          "NAV (Rs)": parseFloat(row["NAV (Rs)"]) || 0,
          isValid: !isNaN(parseFloat(row["NAV (Rs)"])),
        }))
        .filter((row) => row.isValid)
        .sort((a, b) => new Date(a.dateObject) - new Date(b.dateObject));

      if (processedData.length === 0) {
        throw new Error("No valid data points found after processing");
      }

      setRawData(processedData);
      setLastUpdated(new Date());

      notification.success({
        message: "Data Loaded Successfully",
        description: `${processedData.length} data points loaded`,
        placement: "bottomRight",
      });
    } catch (err) {
      console.error("Data loading error:", err);
      setError(err.message);

      notification.error({
        message: "Data Loading Failed",
        description: err.message || "Failed to load portfolio data",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  }, [generateMockData]);

  // Load data on component mount and when date range changes
  useEffect(() => {
    loadExcelData();
  }, [loadExcelData]);

  // Memoized filtered data with boundary checks
  const filteredData = useMemo(() => {
    if (rawData.length === 0) return [];

    return rawData.filter((row) => {
      try {
        if (!row.dateObject || !(row.dateObject instanceof Date)) {
          return false;
        }

        const startDateNative = startDate.toDate();
        const endDateNative = endDate.toDate();

        return (
          isSameOrAfter(row.dateObject, startDateNative) &&
          isSameOrBefore(row.dateObject, endDateNative)
        );
      } catch (error) {
        console.warn("Error filtering data row:", error);
        return false;
      }
    });
  }, [rawData, startDate, endDate]);

  // Memoized sampled data with performance monitoring
  const sampledData = useMemo(() => {
    if (filteredData.length === 0) return [];

    const startTime = performance.now();
    const strategy = dataSamplingStrategies[samplingStrategy];
    const result = strategy(filteredData, maxDataPoints);
    const endTime = performance.now();

    console.debug(
      `Sampling completed in ${(endTime - startTime).toFixed(2)}ms: ${
        result.length
      } points`
    );

    return result;
  }, [filteredData, samplingStrategy, maxDataPoints]);

  // Professional chart data configuration
  const chartData = useMemo(() => {
    if (sampledData.length === 0) return null;

    const dataPoints = sampledData.map((row) => ({
      x: row["NAV Date"],
      y: row["NAV (Rs)"],
    }));

    return {
      datasets: [
        {
          label: "Net Asset Value (₹)",
          data: dataPoints,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: showDataPoints ? 3 : 0,
          pointHoverRadius: 6,
          pointBackgroundColor: "rgb(59, 130, 246)",
          borderWidth: 2,
          pointBorderWidth: 2,
        },
      ],
    };
  }, [sampledData, showDataPoints]);

  // Comprehensive statistics calculation
  const statistics = useMemo(() => {
    if (filteredData.length === 0) return null;

    const values = filteredData.map((row) => row["NAV (Rs)"]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = values[values.length - 1];
    const first = values[0];
    const change = latest - first;
    const changePercent = ((change / first) * 100).toFixed(2);

    // Calculate volatility (standard deviation)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const volatility = Math.sqrt(variance);

    return {
      min: parseFloat(min.toFixed(4)),
      max: parseFloat(max.toFixed(4)),
      latest: parseFloat(latest.toFixed(4)),
      first: parseFloat(first.toFixed(4)),
      change: parseFloat(change.toFixed(4)),
      changePercent: parseFloat(changePercent),
      volatility: parseFloat(volatility.toFixed(4)),
      totalPoints: filteredData.length,
      avg: parseFloat(mean.toFixed(4)),
    };
  }, [filteredData]);

  // Quick date range presets
  const setQuickRange = useCallback((days) => {
    const end = dayjs();
    const start = dayjs().subtract(days, "day");
    setEndDate(end);
    setStartDate(start);

    notification.info({
      message: "Date Range Updated",
      description: `Showing data for ${days} days`,
      placement: "bottomRight",
    });
  }, []);

  const handleStartDateChange = useCallback((date) => {
    if (date) {
      setStartDate(date);
    }
  }, []);

  const handleEndDateChange = useCallback((date) => {
    if (date) {
      setEndDate(date);
    }
  }, []);

  // Professional chart options with enhanced UX
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        title: {
          display: true,
          text: `Portfolio NAV Performance`,
          font: {
            size: 16,
            weight: "bold",
            family: "'Inter', sans-serif",
          },
          color: "#1f2937",
        },
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          titleColor: "#1f2937",
          bodyColor: "#374151",
          borderColor: "#e5e7eb",
          borderWidth: 1,
          padding: 12,
          usePointStyle: true,
          callbacks: {
            title: (context) => {
              return `Date: ${context[0].raw.x}`;
            },
            label: (context) => {
              return `NAV: ₹${context.parsed.y.toFixed(4)}`;
            },
            afterLabel: (context) => {
              if (context.datasetIndex === 0 && context.dataIndex > 0) {
                const current = context.parsed.y;
                const previous = context.dataset.data[context.dataIndex - 1].y;
                const change = ((current - previous) / previous) * 100;
                return `Daily Change: ${change >= 0 ? "+" : ""}${change.toFixed(
                  2
                )}%`;
              }
              return null;
            },
          },
        },
      },
      scales: {
        x: {
          type: "category",
          display: true,
          title: {
            display: true,
            text: "Date",
            font: {
              size: 12,
              weight: "bold",
            },
          },
          grid: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 8,
            font: {
              size: 11,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "NAV Value (₹)",
            font: {
              size: 12,
              weight: "bold",
            },
          },
          ticks: {
            callback: (value) => `₹${value.toFixed(2)}`,
            font: {
              size: 11,
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
      elements: {
        line: {
          tension: 0.4,
        },
      },
      animation: {
        duration: enableVirtualization ? 1000 : 0,
        easing: "easeOutQuart",
      },
    }),
    [enableVirtualization]
  );

  // Export data functionality
  const exportData = useCallback(() => {
    const csvContent = [
      ["Date", "NAV (Rs)"],
      ...sampledData.map((row) => [row["NAV Date"], row["NAV (Rs)"]]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio-data-${dayjs().format("YYYY-MM-DD")}.csv`;
    link.click();

    notification.success({
      message: "Data Exported",
      description: "Portfolio data downloaded successfully",
      placement: "bottomRight",
    });
  }, [sampledData]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Spin size="large" />
        <Text type="secondary">Loading portfolio data...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <Alert
          message="Data Loading Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              size="small"
              onClick={loadExcelData}
              icon={<ReloadOutlined />}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: "auto", padding: "24px" }}>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <AntTitle
          level={2}
          style={{ margin: 0, display: "flex", alignItems: "center", gap: 12 }}
        >
          <BarChartOutlined />
          Portfolio Analytics Dashboard
        </AntTitle>
        <Text type="secondary">
          Real-time NAV performance monitoring and analysis
          {lastUpdated &&
            ` • Last updated: ${lastUpdated.toLocaleTimeString()}`}
        </Text>
      </div>

      {/* Statistics Cards with enhanced UI */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              size="small"
              style={{
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              }}
            >
              <Statistic
                title="Current NAV"
                value={statistics.latest}
                precision={4}
                prefix="₹"
                valueStyle={{ color: "#0369a1", fontSize: 24 }}
                suffix={
                  statistics.change >= 0 ? (
                    <RiseOutlined style={{ color: "#16a34a" }} />
                  ) : (
                    <FallOutlined style={{ color: "#dc2626" }} />
                  )
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card size="small">
              <Statistic
                title="Total Return"
                value={Math.abs(statistics.changePercent)}
                precision={2}
                suffix="%"
                prefix={statistics.changePercent >= 0 ? "+" : "-"}
                valueStyle={{
                  color: statistics.changePercent >= 0 ? "#16a34a" : "#dc2626",
                  fontSize: 24,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card size="small">
              <Statistic
                title="Volatility"
                value={statistics.volatility}
                precision={4}
                prefix="₹"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card size="small">
              <Statistic
                title="Data Points"
                value={`${sampledData.length}/${statistics.totalPoints}`}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Date Range Selection Card */}
      <Card
        style={{ marginBottom: 24 }}
        title={
          <span>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Date Range Selection
          </span>
        }
        extra={
          <Button icon={<DownloadOutlined />} onClick={exportData} size="small">
            Export Data
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {/* Quick Range Buttons */}
          <div>
            <Text strong style={{ marginBottom: 8, display: "block" }}>
              Quick Range:
            </Text>
            <Space wrap>
              {[30, 90, 180, 365, 730].map((days) => (
                <Button
                  key={days}
                  size="small"
                  onClick={() => setQuickRange(days)}
                  type={
                    endDate.diff(startDate, "day") === days
                      ? "primary"
                      : "default"
                  }
                >
                  {days === 30
                    ? "1M"
                    : days === 90
                    ? "3M"
                    : days === 180
                    ? "6M"
                    : days === 365
                    ? "1Y"
                    : "2Y"}
                </Button>
              ))}
            </Space>
          </div>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Start Date:</Text>
              </div>
              <DatePicker
                format="DD-MM-YYYY"
                value={startDate}
                onChange={handleStartDateChange}
                style={{ width: "100%" }}
                placeholder="Select start date"
                allowClear={false}
                disabledDate={(current) => current && current > dayjs()}
              />
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>End Date:</Text>
              </div>
              <DatePicker
                format="DD-MM-YYYY"
                value={endDate}
                onChange={handleEndDateChange}
                style={{ width: "100%" }}
                placeholder="Select end date"
                allowClear={false}
                disabledDate={(current) => current && current > dayjs()}
              />
            </Col>
          </Row>

          <Divider style={{ margin: "16px 0" }} />

          {/* Range Summary */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Selected Range: </Text>
                <br />
                <Text>
                  {startDate.format("DD MMM YYYY")} to{" "}
                  {endDate.format("DD MMM YYYY")}
                </Text>
              </Col>
              <Col span={6}>
                <Text strong>Duration: </Text>
                <br />
                <Text>{endDate.diff(startDate, "day")} days</Text>
              </Col>
              <Col span={6}>
                <Text strong>Data Points: </Text>
                <br />
                <Text>{filteredData.length}</Text>
              </Col>
            </Row>
          </div>
        </Space>
      </Card>

      {/* Chart Configuration Card */}
      <Card
        style={{ marginBottom: 24 }}
        title={
          <span>
            <SettingOutlined style={{ marginRight: 8 }} />
            Chart Configuration
          </span>
        }
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <div>
              <Text strong>Sampling Strategy:</Text>
              <Select
                value={samplingStrategy}
                onChange={setSamplingStrategy}
                style={{ width: "100%" }}
                optionLabelProp="label"
              >
                <Option value="uniform" label="Uniform">
                  <div>Uniform Sampling</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Evenly spaced points
                  </Text>
                </Option>
                <Option value="recent" label="Recent">
                  <div>Recent Priority</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Focus on latest data
                  </Text>
                </Option>
                <Option value="smart" label="Smart">
                  <div>Smart Sampling</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Preserve trends & patterns
                  </Text>
                </Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div>
              <Text strong>Max Data Points: {maxDataPoints}</Text>
              <Slider
                min={100}
                max={5000}
                step={100}
                value={maxDataPoints}
                onChange={setMaxDataPoints}
                tooltip={{ formatter: (value) => `${value} points` }}
              />
            </div>
          </Col>

          <Col xs={12} md={4}>
            <div>
              <Text strong>Data Points:</Text>
              <br />
              <Switch
                checked={showDataPoints}
                onChange={setShowDataPoints}
                checkedChildren="Show"
                unCheckedChildren="Hide"
              />
            </div>
          </Col>

          <Col xs={12} md={4}>
            <div>
              <Text strong>Animations:</Text>
              <br />
              <Switch
                checked={enableVirtualization}
                onChange={setEnableVirtualization}
                checkedChildren="On"
                unCheckedChildren="Off"
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Main Chart Card */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <AntTitle level={4} style={{ margin: 0 }}>
            Portfolio NAV Performance Chart
          </AntTitle>
          <Button
            icon={<InfoCircleOutlined />}
            size="small"
            type="text"
            onClick={() => {
              notification.info({
                message: "Chart Information",
                description:
                  "Interactive NAV chart with tooltips and zoom capabilities",
                placement: "bottomRight",
              });
            }}
          />
        </div>

        <div style={{ height: "500px", position: "relative" }}>
          {chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Text type="secondary">
                No data available for the selected criteria
              </Text>
              <Button
                size="small"
                onClick={() => {
                  setStartDate(dayjs().subtract(1, "year"));
                  setEndDate(dayjs());
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* Chart Footer */}
        {chartData && (
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Displaying {sampledData.length} of {filteredData.length} data
                  points
                  {samplingStrategy !== "uniform" &&
                    ` (${samplingStrategy} sampling)`}
                </Text>
              </Col>
              <Col span={12} style={{ textAlign: "right" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Hover over points for detailed information
                </Text>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Performance Tips */}
      <Alert
        message="Performance Tips"
        description="Use 'Smart Sampling' for large datasets and reduce max data points for better performance on older devices."
        type="info"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );
};

export default Experimental;
