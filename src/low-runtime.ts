import { Interface } from "@ethersproject/abi";
import { formatUnits } from "@ethersproject/units";
import { useContractCalls } from "@usedapp/core";
import type { ContractTransaction } from "ethers";

import type { Dai } from "./typechain";
import { Dai__factory } from "./typechain";

type Values<T extends object> = T[keyof T];
type WithoutLast<T extends any[]> = T extends [...infer A, unknown?] ? A : T;

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

type ContractCalls<
  TContract extends { functions: Record<string, (...args: any[]) => any> }
> = {
  [P in keyof TContract["functions"] as ReturnType<
    TContract["functions"][P]
  > extends Promise<ContractTransaction>
    ? never
    : P]: WithoutLast<Parameters<TContract["functions"][P]>>;
};

export type ContractCallResults<
  TContract extends ContractFunctionsContainer,
  TKeys
> = {
  [K in keyof TContract["functions"] as K extends TKeys ? K : never]:
    | Awaited<
        ReturnType<TContract["functions"][K & keyof TContract["functions"]]>
      >
    | undefined;
};

interface UseContractCalls<TContract extends ContractFunctionsContainer> {
  <
    K extends keyof ContractCalls<TContract>,
    TCalls extends ContractCalls<TContract>
  >(
    // HACK: Partial<TCalls> is needed here to suggest property names
    calls: Pick<TCalls, K> & Partial<TCalls>
  ): ContractCallResults<TContract, K>;
}

type _DaiContractCallKeys = ContractCallsKeys<Dai>;
type _DaiContractCall = ContractCalls<Dai>;
type _DaiContractResultsBalanceDecimals = ContractCallResults<
  Dai,
  "balanceOf" | "decimals"
>;

function makeContractCallsHook<TContract extends ContractFunctionsContainer>(
  abiOrFactory:
    | Interface
    | { createInterface(): Interface; connect(...args: any[]): TContract },
  address: string
): UseContractCalls<TContract> {
  const abi =
    "createInterface" in abiOrFactory
      ? abiOrFactory.createInterface()
      : abiOrFactory;

  return function useTypedCalls<
    K extends keyof ContractCalls<TContract>,
    TCalls extends ContractCalls<TContract>
  >(
    // HACK: Notice there is no `Pick<TCalls, K>` here
    calls: Partial<TCalls>
  ): ContractCallResults<TContract, K> {
    const methods = Object.keys(calls);

    const results = useContractCalls(
      methods.map((method) => ({
        abi,
        address,
        method,
        args: calls[method as K]!,
      }))
    );

    return Object.fromEntries(
      results.map((result, i) => [methods[i], result])
    ) as ContractCallResults<TContract, K>;
  };
}

const useDaiCalls = makeContractCallsHook(
  Dai__factory,
  "0x6B175474E89094C44Da98b954EedeAC495271d0F"
);

// Alternatively, a more verbose version without need for TypeChain's factory.
//
//   const useDaiCalls = makeContractCallsHook<Dai>(
//     Dai__factory.createInterface(),
//     "0x6B175474E89094C44Da98b954EedeAC495271d0F"
//   );
//

export function useDaiAllowance() {
  const { allowance } = useDaiCalls({
    allowance: [
      "0x2e465ddca6d2c6c81ce6f260ab13148d43e93371",
      "0xa2569370a9d4841c9a62fc51269110f2eb7e0171",
    ],
  });

  return {
    // todo: this `?.[0]` is a bit annoying, does ethers handle this?
    allowance: allowance?.[0] && formatUnits(allowance[0], 18),
  };
}
