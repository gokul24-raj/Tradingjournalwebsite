import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Dashboard } from "./components/Dashboard";
import { AddTrade } from "./components/AddTrade";
import { TradeHistory } from "./components/TradeHistory";
import { Analytics } from "./components/Analytics";
import { TradeDetails } from "./components/TradeDetails";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "add-trade", Component: AddTrade },
      { path: "history", Component: TradeHistory },
      { path: "analytics", Component: Analytics },
      { path: "trade/:id", Component: TradeDetails },
      { path: "*", Component: NotFound },
    ],
  },
]);
