# Possible stronger typing for Ethereum React Hooks.

- [Possible stronger typing for Ethereum React Hooks.](#possible-stronger-typing-for-ethereum-react-hooks)
  - [Problem](#problem)
    - [`useContractCalls` examples](#usecontractcalls-examples)
      - [**reading token allowance**](#reading-token-allowance)
      - [**reading Uniswap pool immutables**](#reading-uniswap-pool-immutables)
  - [Nonsolutions](#nonsolutions)
  - [Possible Solutions](#possible-solutions)
    - [1. _Zero Runtime_: Stronger types for existing useDApp hooks](#1-zero-runtime-stronger-types-for-existing-usedapp-hooks)
    - [2. _Low Runtime_: Calls as dictionary](#2-low-runtime-calls-as-dictionary)
  - [How to run this project?](#how-to-run-this-project)

## Problem

`useDapp` is written in TypeScript, but it doesn't have any information about
types of your contracts.

`useContractCalls`, useDApps basic function for reading on-chain state, has the
following signature.

```ts
interface ContractCall {
  abi: Interface;
  address: string;
  method: string;
  args: any[];
}

declare function useContractCalls(
  calls: Array<ContractCall | Falsy>
): Array<any[] | undefined>;
```

It is obviously _powerful_ and allows us to query multiple contracts with one
hook, batching our calls, but it is not very _convenient_.

<details>
<summary>Expand to see example usage of `useContractCalls`</summary>

### `useContractCalls` examples

#### **[reading token allowance](https://usedapp.readthedocs.io/en/latest/guide.html#custom-hooks)**

```ts
function useTokenAllowance(
  tokenAddress: string | Falsy,
  ownerAddress: string | Falsy,
  spenderAddress: string | Falsy
) {
  const [allowance] =
    useContractCall(
      ownerAddress &&
        spenderAddress &&
        tokenAddress && {
          abi: ERC20Interface,
          address: tokenAddress,
          method: "allowance",
          args: [ownerAddress, spenderAddress],
        }
    ) ?? [];

  return allowance;
}
```

#### **[reading Uniswap pool immutables](https://docs.uniswap.org/protocol/reference/core/interfaces/pool/IUniswapV3PoolImmutables)**

```ts
function usePoolImmutables(address: string) {
  const contract = { abi: new Interface(PoolABI), address };

  const [token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
    useContractCalls(
      ["token0", "token1", "fee", "tickSpacing", "maxLiquidityPerTick"].map(
        (method) => ({ ...contract, method, args: [] })
      )
    ) as any as
      | [[string], [string], [number], [number], BigNumberish]
      | undefined[];
}
```

</details>

---

## Nonsolutions

Alternatively to useDApp, we could typed ethers contracts generated by TypeChain
and eth-sdk with `react-query` or another library used for widely used for data
fetching.

```ts
import { getMainnetSdk } from "eth-sdk";
import { useQuery } from "react-query";

const { data, isLoading, error, status } = useQuery(
  "auction-calls",
  async () => {
    const auction = getMainnetSdk().auction;

    const [reward, token, latestBid] = await Promise.all([
      auction.reward(),
      auction.token(),
      auction.latestBid(),
    ]);

    return { reward, token, latestBid };
  }
);
```

**[See example on TypeScript Playground](https://www.typescriptlang.org/play?jsx=4&ts=4.5.0-beta#code/JYWwDg9gTgLgBAbzgVwM4FMCKz1QJ5wC+cAZlBCHAORToCGAxjALQCOO+VAsAFC8nIAdk2ARBcAKIAPOuAA26AOrAYACwBK9Jtlx4AFAEpEvAJAB6M3EXo4DCMjkATFBji1GLdrrgB3Farh0NWZURwBrOBgIOC98OAAjOQgGMIZVOmBxTLg6SLwwdFQ6EhsfOjxTCzgAFVUbMHJE9EpgVAAaOHsoWzo5OVRfMSp4eJt4uhg09EcAOkrLTQ84HTjIPoGxUmS0DtRonxtHIfh0gDcbKLg5Vph0cRJoBKSUlDBHCcK5nhM7QVR4JDvGB0DqtAAyEDojkyAHMOrhyFBdsCYGgiHAALwuLAcfQAIjoyBEYmYDF6-TxHToqDwwjghkxAD5jN8fmJ-jkiTBROIsTCggBBLk8wymUxsv7wADatDKUEcHSiYTuHTkH3+ACFgI4ALqYnJlFRwAAK5BArXQM3Jeil4pMhOJghmsro8sMHTtDu5YhmSru7s9wp9atumu1otZOoMvHFtFRUHESBd8sVEGVglV6pgWuchFMhGjfG+ceQCbgQNyAH44AAeBroRkAKQAygB5AByM3+UFhwBI+grMxDhWz2o6ggccg6ACYDDWzPXmQAuOB4iFQ2EzLd43h5nhVZiHo-Hk+ns-nw8xnigSCwPIFFlwOBamHt5AgUZI3hPl9vj+4VpVDab9n2pdAAGExBgKAPGAngn0gwRoI8aoYL+DweTgp9W3OKAe0cQosLgcDyRwhFtUI3dSDNVcgjqKBUDxABuK8qgAcTuXAPmceICGqfIIPSTJeHQKRb3gAiGDVWhbDVVABiFR1AikW5BEcAYNTAxDkKYR9SCER1UBXBAQKfeJw1Mp8Em1AioBXbtYSIqy4FOXocBXX930-QCnKsiBcPwwpKxXMi8IogYADJEGoihgrgBzBBhOAAB8TTNC0awSmFmT3ZyDBXU0KAy7SYKYVC6HQx1GRYotnKkiAMD0Syn388iCNQOLQsCyLorIWL7Og2EUrSoqMEywbEpyyz8pG80xpKlC0KKKqassgjIFQFQ9FasL2riki+i68KZsKub0BrKVPP-KAdWqq9nOHMNHCa+DnM6ALwv20iPva6aCvSsbmrgKUso6K7PzB4BXy83A9SikzXre6zHFsgae0SmqkafVy5Hc58ob-T9Max7kQBHWQwA8gmYagYnnNyqy7tqqzk2enbuq+w6fsKE6AfOy7qeu27VsRyI039dnPpXA65CO9redG-msuFkDCBFsyLNF8yUdwNHHMsnG8fBgDUCAyzJb2kLuZ6pA+pAOKsuG06MqyqbXoVs6awWsqlowsQmZA+rGvN63OutuB4Zi+29cSp2+fG9HsqIECPeKqDSpgcrKu9QQA9e9aGq2i2gul762p5-7FZrY2oDzp9HtHZ6Q-LjrS65luU8rz3LJBia4Xx6HrshwfPzhvTnO11H4r7umrMN9AqZH3BZ6fUnyfARfCeXyyGbrtx0DlNnQ7b2XrdTsaa73v1BG24-iLL3aK9ml2+6ZvdeEk6SbF+Dl+RgRSc4rgZBiZkACeRMSAA)**

Built-in polling would satisfy the need for refreshing new data after block
changes, but we would lose request batching already implemented in useDApp.

## Possible Solutions

### 1. _Zero Runtime_: Stronger types for existing useDApp hooks

_See the code in [**./src/zero-runtime.ts**](./src/zero-runtime.ts) or on
**[TypeScript Playground](https://tsplay.dev/WK80Gw)**_

Wide types are definitely the biggest problem with `useContractCalls` for me, so
let's try writing new types for it, leveraging type info generated by TypeChain,
but without changing the runtime implementation.

```ts
import { useContractCalls } from "@usedapp/core";
import { UseContractCalls } from "./src/zero-runtime.ts";
import { Dai, Dai__factory } from "./src/typechain";

const useDaiCalls = useContractCalls as UseContractCalls<Dai>;

const daiInterface = Dai__factory.createInterface();
const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

export function useDaiBalance() {
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

  return (
    balance?.[0] &&
    decimals?.[0] &&
    ethers.utils.formatUnits(balance[0], decimals[0])
  );
}
```

I'll admit this isn't exactly _zero_-runtime, as we need the following assertion
to narrow `useContractCalls` type.

```ts
const useDaiCalls = useContractCalls as UseContractCalls<Dai>;
```

We could possibly write our typings just for `useContractCalls` and infer
contract method names and arguments from the `abi` property, but the types would
get pretty complex and I'm afraid of TypeScript lagging in IDEs.

### 2. _Low Runtime_: Calls as dictionary

Let's accept some assumption about common usage patterns and see if we can make
the hook API more concise.

**Assumptions:**

- We'd usually call one contract from one hook. We might call many contracts
  from a component, but the logic will be split in many hooks.
- We'd never call the same contract method twice in one `useContractCalls`
  invocation.

Under these assumptions, the API could look like this:

```ts
export function useDaiBalance() {
  const { balanceOf, decimals } = useDaiCalls({
    balanceOf: ["0x2e465ddca6d2c6c81ce6f260ab13148d43e93371"],
    decimals: [],
  });

  return (
    balanceOf?.[0] &&
    decimals?.[0] &&
    ethers.utils.formatUnits(balanceOf[0], decimals[0])
  );
}
```

_See the code in [**./src/low-runtime.ts**](./src/low-runtime.ts) or on
**[TypeScript Playground](TODO)**_

---

## How to run this project?

1. Install dependencies
   ```sh
   pnpm install
   ```
2. Start Hardhat Node
   ```
   pnpm hardhat:node
   ```