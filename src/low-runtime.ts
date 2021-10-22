import {
  ContractCall as UseDAppContractCall,
  useContractCalls,
} from "@usedapp/core";
import type { ContractTransaction } from "ethers";
import { ethers } from "ethers";

import type { Dai } from "./typechain";
import { Dai__factory } from "./typechain";

type Values<T extends object> = T[keyof T];
type WithoutLast<T extends any[]> = T extends [...infer A, unknown?] ? A : T;

declare namespace UseContractCalls {
  type ContractFunctionsContainer = {
    functions: Record<string, (...args: any[]) => any>;
  };

  type OnlyCallKeys<
    TContract extends ContractFunctionsContainer,
    P extends keyof TContract["functions"]
  > = ReturnType<TContract["functions"][P]> extends Promise<ContractTransaction>
    ? never
    : P;

  export type ContractCallsKeys<TContract extends ContractFunctionsContainer> =
    Values<{
      [P in keyof TContract["functions"] as OnlyCallKeys<TContract, P>]: P;
    }>;

  export type ContractCalls<TContract extends ContractFunctionsContainer> = {
    [P in keyof TContract["functions"] as OnlyCallKeys<
      TContract,
      P
    >]: WithoutLast<Parameters<TContract["functions"][P]>>;
  };

  export type ContractCallResults<
    TContract extends ContractFunctionsContainer,
    TCalls extends ContractCall<TContract>[]
  > = {
    [I in keyof TCalls]:
      | Awaited<
          ReturnType<
            TContract["functions"][(TCalls[I] & {
              method: string;
            })["method"]]
          >
        >
      | undefined;
  };
}

interface UseContractCalls<
  TContract extends UseContractCalls.ContractFunctionsContainer
> {
  <TKeys extends UseContractCalls.ContractCallsKeys<TContract>>(
    calls: [...TCalls]
  ): UseContractCalls.ContractCallResults<TContract, TCalls>;
}

type _DaiContractCallKeys = UseContractCalls.ContractCallsKeys<Dai>;
type _DaiContractCall = UseContractCalls.ContractCall<Dai>;
type _DaiContractResultsBalanceDecimals = UseContractCalls.ContractCallResults<
  Dai,
  [
    {
      method: "balanceOf";
      args: [string];
      abi: Dai["interface"];
      address: string;
    },
    { method: "decimals"; args: []; abi: Dai["interface"]; address: string }
  ]
>;

const daiInterface = Dai__factory.createInterface();
const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
