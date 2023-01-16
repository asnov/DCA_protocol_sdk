import { ChainId, Chain } from '@types';

export class Chains {
  static readonly ETHEREUM = {
    chainId: 1,
    name: 'Ethereum',
    ids: ['ethereum', 'mainnet', 'homestead'],
    currencySymbol: 'ETH',
    wToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    publicRPCs: [
      'https://rpc.ankr.com/eth',
      'https://eth-mainnet.gateway.pokt.network/v1/5f3453978e354ab992c4da79',
      'https://cloudflare-eth.com/',
      'https://main-light.eth.linkpool.io/',
      'https://api.mycryptoapi.com/eth',
    ],
  } as const satisfies Chain;

  static readonly OPTIMISM = {
    chainId: 10,
    name: 'Optimism',
    ids: ['optimism'],
    currencySymbol: 'ETH',
    wToken: '0x4200000000000000000000000000000000000006',
    publicRPCs: ['https://mainnet.optimism.io/'],
  } as const satisfies Chain;

  static readonly ARBITRUM = {
    chainId: 42161,
    name: 'Arbitrum',
    ids: ['arbitrum'],
    currencySymbol: 'ETH',
    wToken: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    publicRPCs: ['https://arb1.arbitrum.io/rpc'],
  } as const satisfies Chain;

  static readonly POLYGON = {
    chainId: 137,
    name: 'Polygon',
    ids: ['polygon', 'matic'],
    currencySymbol: 'MATIC',
    wToken: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    publicRPCs: ['https://polygon-rpc.com/', 'https://rpc-mainnet.maticvigil.com/'],
  } as const satisfies Chain;

  static readonly BNB_CHAIN = {
    chainId: 56,
    name: 'BNB Chain',
    ids: ['bsc', 'bnb'],
    currencySymbol: 'BNB',
    wToken: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    publicRPCs: [
      'https://bsc-dataseed.binance.org/',
      'https://bsc-dataseed1.defibit.io/',
      'https://bsc-dataseed1.ninicoin.io/',
      'https://bsc-dataseed2.defibit.io/',
      'https://bsc-dataseed2.ninicoin.io/',
    ],
  } as const satisfies Chain;

  static readonly FANTOM = {
    chainId: 250,
    name: 'Fantom',
    ids: ['fantom'],
    currencySymbol: 'FTM',
    wToken: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    publicRPCs: ['https://rpc.ankr.com/fantom', 'https://rpc.ftm.tools/', 'https://rpcapi.fantom.network'],
  } as const satisfies Chain;
  static readonly CELO = {
    chainId: 42220,
    name: 'Celo',
    ids: ['celo'],
    currencySymbol: 'CELO',
    wToken: '0x3Ad443d769A07f287806874F8E5405cE3Ac902b9',
  } as const;

  static readonly AVALANCHE = {
    chainId: 43114,
    name: 'Avalance',
    ids: ['avalanche', 'avax'],
    currencySymbol: 'AVAX',
    wToken: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    publicRPCs: ['https://api.avax.network/ext/bc/C/rpc', 'https://rpc.ankr.com/avalanche'],
  } as const satisfies Chain;

  static readonly HECO = {
    chainId: 128,
    name: 'Heco',
    ids: ['heco'],
    currencySymbol: 'HT',
    wToken: '0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f',
    publicRPCs: ['https://pub001.hg.network/rpc', 'https://http-mainnet.hecochain.com'],
  } as const satisfies Chain;

  static readonly OKC = {
    chainId: 66,
    name: 'OKC',
    ids: ['okc', 'okexchain'],
    currencySymbol: 'OKT',
    wToken: '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15',
    publicRPCs: ['https://exchainrpc.okex.org'],
  } as const satisfies Chain;

  static readonly MOONRIVER = {
    chainId: 1285,
    name: 'Moonriver',
    ids: ['moonriver'],
    currencySymbol: 'MOVR',
    wToken: '0x98878b06940ae243284ca214f92bb71a2b032b8a',
    publicRPCs: ['https://rpc.api.moonriver.moonbeam.network/', 'https://moonriver.api.onfinality.io/public'],
  } as const satisfies Chain;

  static readonly GNOSIS = {
    chainId: 100,
    name: 'Gnosis Chain',
    ids: ['gnosis', 'xdai'],
    currencySymbol: 'xDAI',
    wToken: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
    publicRPCs: [
      'https://rpc.gnosischain.com/',
      'https://gnosischain-rpc.gateway.pokt.network',
      'https://rpc.ankr.com/gnosis',
      'https://xdai-archive.blockscout.com',
    ],
  } as const satisfies Chain;

  static readonly CRONOS = {
    chainId: 25,
    name: 'Cronos',
    ids: ['cronos'],
    currencySymbol: 'CRO',
    wToken: '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23',
    publicRPCs: ['https://cronosrpc-1.xstaking.sg', 'https://evm.cronos.org', 'https://rpc.vvs.finance', 'https://evm-cronos.crypto.org'],
  } as const satisfies Chain;

  static readonly BOBA = {
    chainId: 288,
    name: 'Boba Network',
    ids: ['boba'],
    currencySymbol: 'ETH',
    wToken: '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000',
    publicRPCs: ['https://mainnet.boba.network/'],
  } as const satisfies Chain;

  static readonly ONTOLOGY = {
    chainId: 58,
    name: 'Ontology',
    ids: ['ont', 'ontology'],
    currencySymbol: 'ONG',
    wToken: '0xd8bc24cfd45452ef2c8bc7618e32330b61f2691b',
  } as const satisfies Chain;

  static readonly KLAYTN = {
    chainId: 8217,
    name: 'Klaytn',
    ids: ['klaytn'],
    currencySymbol: 'KLAY',
    wToken: '0xe4f05a66ec68b54a58b17c22107b02e0232cc817',
    publicRPCs: ['https://public-node-api.klaytnapi.com/v1/cypress'],
  } as const satisfies Chain;

  static readonly AURORA = {
    chainId: 1313161554,
    name: 'Aurora',
    ids: ['aurora'],
    currencySymbol: 'ETH',
    wToken: '0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb',
    publicRPCs: ['https://mainnet.aurora.dev'],
  } as const satisfies Chain;

  static getAllChains(): Chain[] {
    return Object.values(Chains).filter((value): value is Chain => typeof value !== 'function');
  }

  static byKey(key: string | ChainId): Chain | undefined {
    const toLower = `${key}`.toLowerCase();
    return Chains.getAllChains().find(({ chainId, ids }) => `${chainId}` === toLower || ids.includes(toLower));
  }

  static byKeyOrFail(key: string | ChainId): Chain {
    const chain = this.byKey(key);
    if (!chain) throw new Error(`Failed to find a chain with key '${key}'`);
    return chain;
  }
}

export function chainsIntersection(chains1: ChainId[], ...otherChains: ChainId[][]): ChainId[] {
  const chainSet = new Set(chains1);
  for (const chainList of otherChains) {
    const toCompare = new Set(chainList);
    for (const chainId of chainSet) {
      if (!toCompare.has(chainId)) {
        chainSet.delete(chainId);
      }
    }
  }
  return [...chainSet];
}

export function chainsUnion(chains: ChainId[][]): ChainId[] {
  const chainSet: Set<ChainId> = new Set();
  for (const chainList of chains) {
    for (const chain of chainList) {
      chainSet.add(chain);
    }
  }
  return [...chainSet];
}