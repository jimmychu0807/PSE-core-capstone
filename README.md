<h1 align="center">
    PSE Core Capstone Project: Number Guessing Game
</h1>

<p align="center">
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
</p>

| The repository is divided into three components: [web](./apps/web), [contracts](./apps/contracts), and [circuits](./apps/circuits).<br/>The contracts have been deployed on Optimism Sepolia. |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

This repo is modified from [Semaphore Boilerplate](https://github.com/semaphore-protocol/boilerplate)

- 🎮 Project Website: **https://guessing.jimmychu0807.hk**
- 📝 [Project Write Up](https://jimmychu0807.hk/pse-core-capstone-project)
- 🧑🏻‍🏫 [Project Presentation](https://docs.google.com/presentation/d/1SE4omIJJaYBLAXkV0Ew6o47RLgoQ8pTcIkkv1tFMbik/edit?usp=sharing)
- 📽️ Project Explanation Video

  [![Project Explanation Video](http://img.youtube.com/vi/MrhGMfzsAX0/0.jpg)](https://youtu.be/MrhGMfzsAX0 "Project Explanation Video")

## 📜 Usage

Copy the `.env.example` file as `.env`:

```bash
cp .env.example .env
```

and add your environment variables or run the app in a local network.

### Local server

You can start your app locally with:

```bash
yarn dev
```

### Contract Deployment

[Deployed contracts addresses](./docs/deployed-addresses.md)

### Key Components

Key components for writing circuits

- [circom](https://docs.circom.io/)
- [circomkit](https://github.com/erhant/circomkit/tree/main)
- [snarkjs](https://github.com/iden3/snarkjs)
