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
} from "antd";
import dayjs from "dayjs";

// Date utility functions
const formatDate = (date, format = "DD-MM-YYYY") => {
  if (format === "DD-MM-YYYY") {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  return date.toLocaleDateString();
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const { Option } = Select;
const { Title: AntTitle } = Typography;

const Portfolios = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => dayjs().subtract(1, "year"));
  const [endDate, setEndDate] = useState(() => dayjs());
  const [samplingStrategy, setSamplingStrategy] = useState("uniform");
  const [maxDataPoints, setMaxDataPoints] = useState(1000);
  const [showDataPoints, setShowDataPoints] = useState(false);
  const [enableVirtualization, setEnableVirtualization] = useState(true);

  // Sample data sampling strategies
  const dataSamplingStrategies = {
    uniform: (data, maxPoints) => {
      if (data.length <= maxPoints) return data;
      const step = Math.floor(data.length / maxPoints);
      return data.filter((_, index) => index % step === 0);
    },
    recent: (data, maxPoints) => {
      return data.slice(-maxPoints);
    },
    smart: (data, maxPoints) => {
      if (data.length <= maxPoints) return data;
      const step = Math.floor(data.length / maxPoints);
      return data.filter((_, index) => index % step === 0);
    },
  };

  // Generate mock data for demonstration
  const generateMockData = () => {
    const data = [];
    const startValue = 100;
    let currentValue = startValue;

    const startDateTime = startDate.toDate();
    const endDateTime = endDate.toDate();
    const daysDiff = diffInDays(endDateTime, startDateTime);

    for (let i = 0; i <= daysDiff; i += 7) {
      // Weekly data points
      const date = addDays(startDateTime, i);

      // Random walk with slight upward trend
      const change = (Math.random() - 0.48) * 5; // Slight positive bias
      currentValue += change;
      currentValue = Math.max(currentValue, 50); // Minimum value

      data.push({
        "NAV Date": formatDate(date),
        "NAV (Rs)": parseFloat(currentValue.toFixed(4)),
        dateObject: date,
      });
    }

    return data;
  };

  // Mock Excel data loader - replace with your actual implementation
  const ExCel = async () => {
    // Using mock data - replace with your actual Excel loading logic
    return generateMockData();
  };

  // Load and process Excel data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const jsonData = await ExCel();

        // Sort data by date and validate
        const processedData = jsonData
          .filter((row) => row["NAV Date"] && row["NAV (Rs)"])
          .map((row) => ({
            ...row,
            "NAV (Rs)": parseFloat(row["NAV (Rs)"]) || 0,
          }))
          .sort((a, b) => new Date(a.dateObject) - new Date(b.dateObject));

        setRawData(processedData);
      } catch (error) {
        console.error("Error loading Excel data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [startDate, endDate]);

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (rawData.length === 0) return [];

    return rawData.filter((row) => {
      if (!row.dateObject || !(row.dateObject instanceof Date)) {
        return false;
      }
      // Convert dayjs objects to native Date objects for comparison
      const startDateNative = startDate.toDate();
      const endDateNative = endDate.toDate();
      return (
        isSameOrAfter(row.dateObject, startDateNative) &&
        isSameOrBefore(row.dateObject, endDateNative)
      );
    });
  }, [rawData, startDate, endDate]);

  // Memoized sampled data
  const sampledData = useMemo(() => {
    if (filteredData.length === 0) return [];

    const strategy = dataSamplingStrategies[samplingStrategy];
    return strategy(filteredData, maxDataPoints);
  }, [filteredData, samplingStrategy, maxDataPoints]);

  // Memoized chart data - FIXED THIS PART
  const chartData = useMemo(() => {
    if (sampledData.length === 0) return null;

    // Correct data structure for Chart.js
    const dataPoints = sampledData.map((row) => ({
      x: row["NAV Date"], // Use as label on x-axis
      y: row["NAV (Rs)"], // Value on y-axis
    }));

    return {
      datasets: [
        {
          label: "NAV (Rs)",
          data: dataPoints, // Use the array of {x, y} objects
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.1)",
          fill: true,
          tension: 0.1,
          pointRadius: showDataPoints ? 2 : 0,
          pointHoverRadius: 4,
          borderWidth: 2,
        },
      ],
    };
  }, [sampledData, showDataPoints]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (filteredData.length === 0) return null;

    const values = filteredData.map((row) => row["NAV (Rs)"]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = values[values.length - 1];
    const first = values[0];
    const change = latest - first;
    const changePercent = ((change / first) * 100).toFixed(2);

    return {
      min,
      max,
      latest,
      first,
      change,
      changePercent,
      totalPoints: filteredData.length,
    };
  }, [filteredData]);

  // Quick date range functions
  const setQuickRange = useCallback((days) => {
    const end = dayjs();
    const start = dayjs().subtract(days, "day");
    setEndDate(end);
    setStartDate(start);
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

  const options = useMemo(
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
          text: `Historical Mutual Fund NAV (${sampledData.length} of ${filteredData.length} points)`,
        },
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            title: (context) => {
              return `Date: ${context[0].raw.x}`;
            },
            label: (context) => {
              return `NAV: ₹${context.parsed.y.toFixed(4)}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "category", // Explicitly set to category scale
          display: true,
          title: {
            display: true,
            text: "Date",
          },
          ticks: {
            maxTicksLimit: 10,
            callback: function (value, index, values) {
              // Show only every nth label for better readability
              return index % Math.ceil(values.length / 10) === 0 ? value : "";
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "NAV (₹)",
          },
          ticks: {
            callback: (value) => `₹${value.toFixed(2)}`,
          },
        },
      },
      elements: {
        line: {
          tension: 0.1,
        },
      },
    }),
    [sampledData.length, filteredData.length, showDataPoints]
  );

  // Show loading spinner
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Show message if no data is available
  if (!rawData || rawData.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <p>Data is not available.</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", margin: "auto", padding: "20px" }}>
      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="Latest NAV"
                value={statistics.latest}
                precision={4}
                prefix="₹"
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Change"
                value={Math.abs(statistics.change)}
                precision={4}
                prefix={statistics.change >= 0 ? "+₹" : "-₹"}
                valueStyle={{
                  color: statistics.change >= 0 ? "#3f8600" : "#cf1322",
                }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Change %"
                value={Math.abs(statistics.changePercent)}
                precision={2}
                suffix="%"
                prefix={statistics.changePercent >= 0 ? "+" : "-"}
                valueStyle={{
                  color: statistics.changePercent >= 0 ? "#3f8600" : "#cf1322",
                }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Min NAV"
                value={statistics.min}
                precision={4}
                prefix="₹"
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Max NAV"
                value={statistics.max}
                precision={4}
                prefix="₹"
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Data Points"
                value={`${sampledData.length}/${statistics.totalPoints}`}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Always Visible Date Picker */}
      <Card style={{ marginBottom: 20 }}>
        <AntTitle level={4} style={{ margin: "0 0 16px 0" }}>
          Date Range Selection
        </AntTitle>

        {/* Quick Date Range Buttons */}
        <Space style={{ marginBottom: 16 }}>
          <Button size="small" onClick={() => setQuickRange(30)}>
            30 Days
          </Button>
          <Button size="small" onClick={() => setQuickRange(90)}>
            3 Months
          </Button>
          <Button size="small" onClick={() => setQuickRange(180)}>
            6 Months
          </Button>
          <Button size="small" onClick={() => setQuickRange(365)}>
            1 Year
          </Button>
          <Button size="small" onClick={() => setQuickRange(730)}>
            2 Years
          </Button>
        </Space>

        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 8 }}>
              <strong>Start Date:</strong>
            </div>
            <DatePicker
              format="DD-MM-YYYY"
              value={startDate ? startDate : null}
              onChange={handleStartDateChange}
              style={{ width: "100%" }}
              placeholder="Select start date"
              allowClear={false}
            />
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 8 }}>
              <strong>End Date:</strong>
            </div>
            <DatePicker
              format="DD-MM-YYYY"
              value={endDate ? endDate : null}
              onChange={handleEndDateChange}
              style={{ width: "100%" }}
              placeholder="Select end date"
              allowClear={false}
            />
          </Col>
        </Row>

        <Divider />

        <div
          style={{
            backgroundColor: "#f0f9ff",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #bae6fd",
          }}
        >
          <strong>Selected Range:</strong> {startDate.format("DD-MM-YYYY")} to{" "}
          {endDate.format("DD-MM-YYYY")}
          <br />
          <strong>Duration:</strong> {endDate.diff(startDate, "day")} days
          {statistics && (
            <>
              <br />
              <strong>Data Points in Range:</strong> {filteredData.length}
            </>
          )}
        </div>
      </Card>

      {/* Other Controls */}
      <Card style={{ marginBottom: 20 }}>
        <AntTitle level={4} style={{ margin: "0 0 16px 0" }}>
          Chart Settings
        </AntTitle>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>
              <strong>Sampling Strategy:</strong>
            </div>
            <Select
              value={samplingStrategy}
              onChange={setSamplingStrategy}
              style={{ width: "100%" }}
            >
              <Option value="uniform">Uniform Sampling</Option>
              <Option value="recent">Recent Data Priority</Option>
              <Option value="smart">Smart (Peaks/Valleys)</Option>
            </Select>
          </Col>

          <Col span={8}>
            <div style={{ marginBottom: 8 }}>
              <strong>Max Data Points: {maxDataPoints}</strong>
            </div>
            <Slider
              min={100}
              max={5000}
              step={100}
              value={maxDataPoints}
              onChange={setMaxDataPoints}
              tooltip={{ formatter: (value) => `${value} points` }}
            />
          </Col>

          <Col span={5}>
            <div style={{ marginBottom: 8 }}>
              <strong>Show Data Points:</strong>
            </div>
            <Switch
              checked={showDataPoints}
              onChange={setShowDataPoints}
              checkedChildren="ON"
              unCheckedChildren="OFF"
            />
          </Col>

          <Col span={5}>
            <div style={{ marginBottom: 8 }}>
              <strong>Enable Virtualization:</strong>
            </div>
            <Switch
              checked={enableVirtualization}
              onChange={setEnableVirtualization}
              checkedChildren="ON"
              unCheckedChildren="OFF"
            />
          </Col>
        </Row>
      </Card>

      {/* Chart */}
      <Card>
        <AntTitle level={4} style={{ margin: "0 0 16px 0" }}>
          Historical Mutual Fund NAV Chart
        </AntTitle>
        <div style={{ height: "500px" }}>
          {chartData ? (
            <Line data={chartData} options={options} />
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <p>No data available for the selected date range</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Portfolios;
