import { useEffect, useState } from "react";
import "./App.css";
import StockChart from "./components/stockChart";
import { StockData } from "./types/StockData";

function App() {
  const [data, setData] = useState<Array<StockData>>([]);

  useEffect(() => {
    const data = generateData();

    setData(data);
  }, []);

  const generateData = (): StockData[] => {
    const data: StockData[] = [];
    let currentPrice = 150;
    const startDate = new Date("2022-02-15");
    const volatility = 0.02; // 2% daily volatility

    for (let i = 0; i < 520; i++) {
      // ~520 trading days in 2 years
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Random walk with mean reversion
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      currentPrice = currentPrice + change;

      // Ensure price stays positive and add some trends
      currentPrice = Math.max(currentPrice, 50);
      // Add some general upward trend
      currentPrice *= 1 + 0.0001;

      data.push({
        date: date.toISOString().split("T")[0],
        price: currentPrice,
      });
    }
    return data;
  };

  return (
    <>
      <StockChart data={data} />
    </>
  );
}

export default App;
