import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import * as hl from "@nktkas/hyperliquid";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

type Candle = {
  t: number;   // timestamp
  o: number;   // open
  h: number;   // high
  l: number;   // low
  c: number;   // close
  v: number;   // volume
};

interface PriceChartProps {
  pair: string;
}

const chartConfig = {
  price: {
    label: "Price",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function PriceChart({ pair }: PriceChartProps) {
  const [data, setData] = useState<{ time: string; price: number }[]>([]);

  useEffect(() => {
    const fetchCandles = async () => {
      const infoClient = new hl.InfoClient({ transport: new hl.HttpTransport() });

      // candleSnapshot needs coin + interval
      const rawCandles = await infoClient.candleSnapshot({
          coin: pair.replace("-PERP", ""), // API expects "HYPE", "BTC", "SOL"
          interval: "1h",
          startTime: 0
      });

      // Convert string properties to numbers to match local Candle type
      const candles: Candle[] = rawCandles.map((c) => ({
        t: Number(c.t),
        o: Number(c.o),
        h: Number(c.h),
        l: Number(c.l),
        c: Number(c.c),
        v: Number(c.v),
      }));

      const formatted = candles.map((c) => ({
        time: new Date(c.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        price: c.c,
      }));

      setData(formatted.slice(-50)); // last 50 candles
    };

    fetchCandles();
  }, [pair]);

  return (
    <Card className="mt-6 mb-4 border border-teal-500 rounded">
      <CardHeader>
        <CardTitle className="flex items-center">
          {pair}
        </CardTitle>
        <CardDescription>Market trend</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
            />
            <YAxis
                dataKey="price"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={20}
                domain={['auto', 'auto']}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Line
                dataKey="price"
                type="monotone"
                stroke="var(--color-price)"
                dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
