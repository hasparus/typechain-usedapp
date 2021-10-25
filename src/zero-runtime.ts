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

  export type ContractCall<TContract extends ContractFunctionsContainer> =
    Values<{
      [P in keyof TContract["functions"] as OnlyCallKeys<TContract, P>]: {
        abi: ethers.utils.Interface;
        address: string;
        method: P;
        // useDApp doesn't use Ethers factory, just the interface, so there's no "overrides"
        // param, but we can't easily read the type of params from `encodeFunctionData` bcs of overloads
        args: WithoutLast<Parameters<TContract["functions"][P]>>;
      };
    }>;

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
  <TCalls extends UseContractCalls.ContractCall<TContract>[]>(
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

// @test strictly typed contract call must be assignable to base contract call
const __test1: UseDAppContractCall = {} as UseContractCalls.ContractCall<Dai>;

const useDaiCalls = useContractCalls as UseContractCalls<Dai>;

const daiInterface = Dai__factory.createInterface();
const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

export function useDaiBalanceAndDecimals() {
  // const results: [[BigNumber] | undefined, [number] | undefined];
  const [balance, decimals] = useDaiCalls([
    {
      abi: daiInterface,
      address: daiAddress,
      method: "balanceOf",
      args: ["0x2e465ddca6d2c6c81ce6f260ab13148d43e93371"],
    },
    {
      abi: daiInterface,
      address: daiAddress,
      method: "decimals",
      args: [],
    },
  ]);

  return {
    balance:
      balance?.[0] &&
      decimals?.[0] &&
      ethers.utils.formatUnits(balance[0], decimals[0]),
    decimals: decimals?.[0],
  };
}
