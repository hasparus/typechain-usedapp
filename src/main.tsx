import { ChainId, Config as UseDAppConfig, DAppProvider } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";

import * as lowRuntime from "./calls-as-dict";
import * as zeroRuntime from "./zero-runtime";

function App() {
  const daiBalanceAndDecimals = zeroRuntime.useDaiBalanceAndDecimals();
  const daiAllowance = lowRuntime.useDaiAllowance();

  const data = {
    daiBalanceAndDecimals,
    daiAllowance,
  };

  console.log(data);

  const isLoading = daiBalanceAndDecimals.decimals === undefined;

  return (
    <div>
      <div>{isLoading && "Loading..."}</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export const useDAppConfig: UseDAppConfig = {
  readOnlyChainId: ChainId.Localhost,
  readOnlyUrls: {
    [ChainId.Localhost]: "http://localhost:8545",
  },
};

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={useDAppConfig}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
