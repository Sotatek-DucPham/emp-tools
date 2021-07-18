import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers, BigNumber, utils, BigNumberish } from "ethers";
import { weth } from "@studydefi/money-legos/erc20";

import Connection from "./Connection";

function useContract() {
  const {
    signer,
    address,
    block$,
    provider,
    network,
  } = Connection.useContainer();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [ethBalance, setEthBalance] = useState<BigNumberish | null>(null);
  const [wethBalance, setWethBalance] = useState<BigNumberish | null>(null);

  const getTokenInfo = async () => {
    if (contract && address) {
      const wethBalanceRaw: BigNumber = await contract.balanceOf(address);
      const wethBalance = utils.formatEther(wethBalanceRaw);
      setWethBalance(wethBalance);
    }

    if (provider && address) {
      const ethBalanceRaw: BigNumber = await provider.getBalance(address);
      const ethBalance = utils.formatEther(ethBalanceRaw);
      setEthBalance(ethBalance);
    }
  };

  // get token info when contract changes or when address is reset
  useEffect(() => {
    setWethBalance(null);
    setEthBalance(null);
    getTokenInfo();
  }, [contract, address, provider]);

  // get token info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getTokenInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, contract, address, provider]);

  useEffect(() => {
    if (signer && network) {
      let wethInUse = weth.address;
      if (network.chainId === 42) {
        wethInUse = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";
      } else if (network.chainId === 4) {
        wethInUse = "0xc778417e063141139fce010982780140aa0cd5ab";
      } else if (network.chainId === 11) {
        wethInUse = "0xf3cF78F09Ef1dF5Ea87BA39d6513AB4242C37E4f";
      }

      const instance = new ethers.Contract(
        wethInUse, // Uses Kovan WETH contract if on Kovan, otherwise Mainnet WETH contract
        weth.abi,
        signer
      );
      setContract(instance);
    }
  }, [signer, network]);

  return { contract, ethBalance, wethBalance };
}

const Contract = createContainer(useContract);

export default Contract;
