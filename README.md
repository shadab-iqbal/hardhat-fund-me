# Hardhat Fundme

This is a projet based on Hardhat. You can fund a contract or withdraw money from it. This project has been tested both locally and on goerli testnet. You can clone the projet and deploy or test it by yourself and can also interact with the contract by tweaking the goerli rpc url and private key parameter in the hardhat.config.js file.

## Installation

```
yarn
```

## Compile

```
yarn hardhat compile
```

## Deploy locally

```
yarn hardhat deploy
```

## Testing locally

```
yarn hardhat test
```

## Deploy on testnet

You have to first setup your goerli rpc url and private key in the .env file

```
yarn hardhat deploy --network goerli
```

## Staging-test on testnets

```
yarn hardhat test --network goerli
```

## Fund the contract

```
yarn fund
```

## Withdraw from the contract

```
yarn withdraw
```
