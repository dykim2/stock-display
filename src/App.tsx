import { useEffect, useState } from 'react'
import './App.css'
import Chart from "react-apexcharts";

function App() {
  const key = "d2jot5pr01qj8a5kgi00d2jot5pr01qj8a5kgi0g";
  // save to local data and display from there
  const [stockNames, setStockNames] = useState<string[]>(["AAL", "AAPL", "AMD", "AMZN", "C", "CSCO", "GOOG", "IBM", "NVDA", "TSLA"]);
  // add multiple stock names?
  const [stockData, setStockData] = useState<number[]>([]);
  const [changeData, setChangeData] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      let newStockData: number[] = [];
      let newChangeData: number[] = [];
      for (const stock of stockNames) {
        const res = await getQuote(stock);
        if (res) {
          newStockData.push(res[0]);
          newChangeData.push(res[1]);
        }
      }
      setStockData(newStockData);
      setChangeData(newChangeData);
      setLoading(false);
    };
    fetchData();
  }, []);
  async function getQuote(symbol: string): Promise<[number, number] | null> {
    try {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`, {
        method: "GET",
      });
      if (res.status !== 200) {
        alert("An error occurred when fetching stock price data");
        return null;
      }
      const data = await res.json();
      // console.log(data);
      if (data.d == null) {
        alert(
          "the requested stock company either does not exist or has not traded recently!"
        );
        return null;
      }
      return [data.c, data.dp];
    } catch (error) {
      alert("An error occurred when fetching stock price data");
      return null;
    }
  }
  async function addStock() {
    setLoading(true);
    // make a simple text field: add a stock: [field] [button]
    let res: string | null = prompt("what stock would you like to look up?");
    if(res == null || res == ""){
      return;
    }
    res = res.toUpperCase();
    let stockInd: number = stockNames.indexOf(res);
    if(stockInd != -1){
      // dont find a duplicate stock!
      alert("this stock is already in the graph!");
      return;
    }
    // to place the stock correctly alphabetically, must find alphabetical location
    // also no hard limit
    
    let quote = await getQuote(res);
    if(quote == null){
      return;
    }
    let newStockData: number[] = [...stockData];
    let newChangeData: number[] = [...changeData];
    let newStockNames: string[] = [...stockNames];
    stockInd = 0;
    for(stockInd; stockInd < stockNames.length; stockInd++){
      if(stockNames[stockInd] > res){
        // insert at the first one for alphabetical
        // say we have EA, after CSCO
        // b > a and so on
        break;
      }
    }
    newStockData.splice(stockInd, 0, quote[0]);
    newChangeData.splice(stockInd, 0, quote[1]);
    newStockNames.splice(stockInd, 0, res);
    setStockData(newStockData);
    setChangeData(newChangeData);
    setStockNames(newStockNames);
    setLoading(false);
  }
  // remove stock too
  function removeStock() {
    let res: string | null = prompt("what stock would you like to remove from the graph?");
    if(res == null || res == ""){
      return;
    }
    res = res.toUpperCase();
    let stockInd: number = stockNames.indexOf(res);
    if(stockInd != -1){
      let newStockData: number[] = [...stockData];
      let newChangeData: number[] = [...changeData];
      let newStockNames: string[] = [...stockNames];
      newStockData.splice(stockInd, 1);
      newChangeData.splice(stockInd, 1);
      newStockNames.splice(stockInd, 1);
      setStockData(newStockData);
      setChangeData(newChangeData);
      setStockNames(newStockNames);
    }
  }
  // feature list
  /*
    - axes of information 
    - search between 15 types of stocks? highlight
    - sort? they are auto sorted
    - loading 
    - notable statistics
    - request feature, request a stock and it will be shown
  */
  let chartOptions = {
    options: {
      chart: {
        id: "prices",
      },
      xaxis: {
        categories: stockNames,
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
        title: {
          text: "Stock Name",
          style: {
            color: "#FFFFFF",
          },
        },
      },
      yaxis: {
        labels: {
          formatter: function (value: number) {
            return "$" + value;
          },
          style: {
            colors: "#FFFFFF",
          },
        },
        title: {
          text: "Stock Price",
          style: {
            color: "#FFFFFF",
          },
        },
      },
      dataLabels: {
        enabled: true,
        style: { colors: ["#ffffff"], offsetX: 30 },
        formatter: function (value: number) {
          return "$" + value;
        },
      },
      title: {
        text: "Stock Prices ($)",
        align: "center" as "center",
        style: {
          fontSize: "18",
          color: "white",
        },
      },
      tooltip: {
        theme: "dark",
      },
    },
    series: [
      {
        name: "prices",
        data: stockData && stockData.length > 0 ? stockData : [0], // [0] for no data default
      },
    ],
  };
  let changesOptions = {
    ...chartOptions,
    options: {
      ...chartOptions.options,
      dataLabels: {
        enabled: true,
        style: { colors: ["#ffffff"], offsetX: 30 },
        formatter: function (value: number) {
          return value + "%";
        },
      },
      title: {
        text: "Stock Price Change from Yesterday (%)",
        align: "center" as "center",
        style: {
          fontSize: "18",
          color: "white",
        },
      },
      yaxis: {
        labels: {
          formatter: function (value: number) {
            return value + "%";
          },
          style: {
            colors: "#FFFFFF",
          },
        },
        title: {
          text: "Stock Price",
          style: {
            color: "#FFFFFF",
          },
        },
      },
    },
    series: [
      {
        name: "changes",
        data: changeData && changeData.length > 0 ? changeData : [0],
      },
    ],
  };
  // use tailwind css to make these change
  // make it responsive
  return (
    <>
      <div className="w-9/10 md:w-19/20 lg:w-full">
        {loading ? <h1>Data loading!</h1> : <h1>Stock Price Data ($)</h1>}
        <Chart
          options={chartOptions.options}
          series={chartOptions.series}
          type="bar"
          width="100%"
          height={400}
        />
      </div>
      <br />
      <div className="w-9/10 md:w-19/20 lg:w-full">
        {loading ? (
          <h1>Data loading!</h1>
        ) : (
          <h1>Stock Price Change Data (%)</h1>
        )}
        <Chart
          options={changesOptions.options}
          series={changesOptions.series}
          type="bar"
          width="100%"
          height={400}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          style={{ marginLeft: 50 }}
          disabled={loading}
          onClick={addStock}
        >
          add stock
        </button>
        <button
          style={{ marginLeft: 50 }}
          disabled={loading}
          onClick={removeStock}
        >
          remove stock
        </button>
      </div>
    </>
  );
}
export default App
