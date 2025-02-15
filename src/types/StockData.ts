// Types
export interface StockData {
  date: string;
  price: number;
}
export interface HoveredPoint {
  point: StockData;
  x: number;
  y: number;
}
