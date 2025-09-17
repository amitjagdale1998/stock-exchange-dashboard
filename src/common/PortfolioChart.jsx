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
  TimeScale,
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
} from "antd";
import dayjs from "dayjs"; // Add dayjs for proper date handling
import ExCel from "../common/ExCel";

// Register Chart.js components with TimeScale
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const { Option } = Select;

// Date utility functions
const parseDate = (dateStr) => {
  // Handle different date formats
  if (typeof dateStr === "string") {
    // Try DD-MM-YYYY format first
    if (dateStr.includes("-")) {
      const [day, month, year] = dateStr.split("-");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Try other formats if needed
    return new Date(dateStr);
  }
  return dateStr;
};

const formatDate = (date, format = "MMM DD, YYYY") => {
  const d = new Date(date);
  if (format === "MMM DD, YYYY") {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } else if (format === "MMM YY") {
    return d.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
    });
  }
  return d.toLocaleDateString();
};

// Data sampling utilities
const dataSamplingStrategies = {
  uniform: (data, maxPoints) => {
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  },

  recent: (data, maxPoints) => {
    if (data.length <= maxPoints) return data;
    return data.slice(-maxPoints);
  },

  smart: (data, maxPoints) => {
    if (data.length <= maxPoints) return data;

    const sampled = [data[0]];
    const step = Math.floor(data.length / (maxPoints - 2));

    for (let i = step; i < data.length - step; i += step) {
      const window = data.slice(i - step, i + step);
      const values = window.map((d) => parseFloat(d["NAV (Rs)"]) || 0);
      const maxIdx = values.indexOf(Math.max(...values));
      const minIdx = values.indexOf(Math.min(...values));

      if (maxIdx !== minIdx) {
        sampled.push(window[maxIdx], window[minIdx]);
      } else {
        sampled.push(window[Math.floor(window.length / 2)]);
      }
    }

    sampled.push(data[data.length - 1]);
    return sampled.sort(
      (a, b) => parseDate(a["NAV Date"]) - parseDate(b["NAV Date"])
    );
  },
};

const PortfolioChart = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSchemes, setSelectedSchemes] = useState([]);
  const [samplingStrategy, setSamplingStrategy] = useState("uniform");
  const [maxDataPoints, setMaxDataPoints] = useState(100);
  const [showAnimations, setShowAnimations] = useState(true);

  // Load data from Excel
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const excelData = await ExCel();
        console.log("Excel data loaded:", excelData);

        if (excelData && Array.isArray(excelData) && excelData.length > 0) {
          setData(excelData);
          // Initialize with all unique schemes
          const schemes = [
            ...new Set(excelData.map((item) => item["Scheme Name"])),
          ];
          setSelectedSchemes(schemes.slice(0, 3));
        } else {
          console.warn("No data received from Excel");
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter data based on date range and selected schemes
  useEffect(() => {
    if (!data.length) {
      setFilteredData([]);
      return;
    }

    let filtered = data.filter((item) => {
      // Filter by selected schemes
      if (
        selectedSchemes.length > 0 &&
        !selectedSchemes.includes(item["Scheme Name"])
      ) {
        return false;
      }

      // Filter by date range if specified
      const itemDate = parseDate(item["NAV Date"]);

      if (startDate && endDate) {
        const start = dayjs(startDate).toDate();
        const end = dayjs(endDate).toDate();
        return itemDate >= start && itemDate <= end;
      } else if (startDate) {
        const start = dayjs(startDate).toDate();
        return itemDate >= start;
      } else if (endDate) {
        const end = dayjs(endDate).toDate();
        return itemDate <= end;
      }

      return true;
    });

    // Apply data sampling strategy
    if (filtered.length > maxDataPoints) {
      filtered = dataSamplingStrategies[samplingStrategy](
        filtered,
        maxDataPoints
      );
    }

    setFilteredData(filtered);
  }, [
    data,
    startDate,
    endDate,
    selectedSchemes,
    samplingStrategy,
    maxDataPoints,
  ]);

  // Generate chart data
  const chartData = useMemo(() => {
    if (!filteredData.length) return null;

    const schemes = [
      ...new Set(filteredData.map((item) => item["Scheme Name"])),
    ];
    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#FF6384",
      "#C9CBCF",
    ];

    const datasets = schemes.map((scheme, index) => {
      const schemeData = filteredData
        .filter((item) => item["Scheme Name"] === scheme)
        .sort((a, b) => parseDate(a["NAV Date"]) - parseDate(b["NAV Date"]))
        .map((item) => ({
          x: parseDate(item["NAV Date"]), // Use Date object instead of string
          y: parseFloat(item["NAV (Rs)"]) || 0,
        }));

      return {
        label: scheme,
        data: schemeData,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + "20",
        tension: 0.1,
        fill: false,
        pointRadius: schemeData.length > 50 ? 0 : 3,
        pointHoverRadius: 5,
      };
    });

    return { datasets };
  }, [filteredData]);

  // Chart options
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: showAnimations ? 750 : 0,
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
          },
        },
        title: {
          display: true,
          text: "Portfolio NAV Performance",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            title: (context) => {
              return formatDate(context[0].raw.x, "MMM DD, YYYY");
            },
            label: (context) => {
              return `${context.dataset.label}: ₹${context.parsed.y.toFixed(
                2
              )}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "month",
            tooltipFormat: "MMM DD, YYYY",
            displayFormats: {
              month: "MMM YY",
            },
          },
          title: {
            display: true,
            text: "Date",
          },
          ticks: {
            maxTicksLimit: 10,
          },
        },
        y: {
          title: {
            display: true,
            text: "NAV (₹)",
          },
          beginAtZero: false,
          ticks: {
            callback: function (value) {
              return "₹" + value.toFixed(2);
            },
          },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    }),
    [showAnimations]
  );

  // Get available schemes for selection
  const availableSchemes = useMemo(() => {
    return [...new Set(data.map((item) => item["Scheme Name"]))];
  }, [data]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!filteredData.length) return {};

    const stats = {};
    selectedSchemes.forEach((scheme) => {
      const schemeData = filteredData.filter(
        (item) => item["Scheme Name"] === scheme
      );
      if (schemeData.length > 0) {
        const values = schemeData.map(
          (item) => parseFloat(item["NAV (Rs)"]) || 0
        );
        const latest = values[values.length - 1];
        const earliest = values[0];
        const returns = latest - earliest;
        const returnsPercent = ((returns / earliest) * 100).toFixed(2);

        stats[scheme] = {
          latest: latest.toFixed(2),
          returns: returns.toFixed(2),
          returnsPercent,
          dataPoints: schemeData.length,
        };
      }
    });

    return stats;
  }, [filteredData, selectedSchemes]);

  // Handle date changes
  const handleStartDateChange = (date) => {
    setStartDate(date ? dayjs(date) : null);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date ? dayjs(date) : null);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <Card
          title="Debug Info"
          style={{ marginBottom: "20px", backgroundColor: "#fff3cd" }}
        >
          <div>Total data: {data.length} records</div>
          <div>Filtered data: {filteredData.length} records</div>
          <div>Selected schemes: {selectedSchemes.join(", ")}</div>
          <div>
            Chart data: {chartData ? chartData.datasets.length : 0} datasets
          </div>
        </Card>
      )}

      {/* Date Filter Section */}
      <Card title="Date Filter" style={{ marginBottom: "20px" }}>
        <Row gutter={[24, 16]} justify="center" align="middle">
          <Col xs={24} sm={12} md={8}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Start Date:
              </label>
              <DatePicker
                style={{ width: "100%" }}
                value={startDate}
                onChange={handleStartDateChange}
                format="DD-MM-YYYY"
                placeholder="Select start date"
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                End Date:
              </label>
              <DatePicker
                style={{ width: "100%" }}
                value={endDate}
                onChange={handleEndDateChange}
                format="DD-MM-YYYY"
                placeholder="Select end date"
              />
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Quick Actions:
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ff4d4f",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Clear Dates
                </button>
                <button
                  onClick={() => {
                    const today = dayjs();
                    const lastMonth = today.subtract(1, "month");
                    setStartDate(lastMonth);
                    setEndDate(today);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#1890ff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Last Month
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Additional controls */}
      {!loading && data.length > 0 && (
        <Card title="Chart Controls" style={{ marginBottom: "20px" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <label>Select Schemes:</label>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Select schemes to display"
                value={selectedSchemes}
                onChange={setSelectedSchemes}
                maxTagCount={1}
              >
                {availableSchemes.map((scheme) => (
                  <Option key={scheme} value={scheme}>
                    {scheme}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <label>Sampling Strategy:</label>
              <Select
                style={{ width: "100%" }}
                value={samplingStrategy}
                onChange={setSamplingStrategy}
              >
                <Option value="uniform">Uniform</Option>
                <Option value="recent">Recent</Option>
                <Option value="smart">Smart</Option>
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <label>Max Data Points: {maxDataPoints}</label>
              <Slider
                min={50}
                max={500}
                value={maxDataPoints}
                onChange={setMaxDataPoints}
                marks={{
                  50: "50",
                  100: "100",
                  250: "250",
                  500: "500",
                }}
              />
            </Col>

            <Col xs={24} sm={12} md={6}>
              <label>Animations:</label>
              <br />
              <Switch
                checked={showAnimations}
                onChange={setShowAnimations}
                checkedChildren="On"
                unCheckedChildren="Off"
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Statistics Cards */}
      {!loading && Object.keys(statistics).length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
          {Object.entries(statistics).map(([scheme, stats]) => (
            <Col xs={24} sm={12} lg={8} key={scheme}>
              <Card
                size="small"
                title={
                  scheme.length > 30 ? scheme.substring(0, 30) + "..." : scheme
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Latest NAV"
                      value={stats.latest}
                      prefix="₹"
                      precision={2}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Returns"
                      value={stats.returnsPercent}
                      suffix="%"
                      valueStyle={{
                        color:
                          parseFloat(stats.returnsPercent) >= 0
                            ? "#3f8600"
                            : "#cf1322",
                      }}
                      precision={2}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Chart Section */}
      <Card title="Portfolio Performance Chart">
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <p>Loading chart data...</p>
          </div>
        ) : chartData && chartData.datasets.length > 0 ? (
          <div style={{ height: "500px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div
              style={{ marginBottom: "20px", fontSize: "18px", color: "#666" }}
            >
              📊 No data available for the selected criteria
            </div>
            <div style={{ fontSize: "14px", color: "#999" }}>
              {data.length === 0 ? (
                <p>No portfolio data found. Please check your data source.</p>
              ) : (
                <p>
                  Try adjusting your filters or selecting different schemes.
                  <br />
                  Available data: {data.length} records, Schemes:{" "}
                  {availableSchemes.length}
                </p>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PortfolioChart;
