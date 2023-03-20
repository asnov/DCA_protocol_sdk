import { ChainId, TimeString, TokenAddress } from '@types';
import { ITokenSource, KeyOfToken, MergeTokensFromSources } from '@services/tokens/types';
import { timeoutPromise } from '@shared/timeouts';
import { combineTokenProperties } from './utils';

// This fallback source will use different sources and combine the results of each of them
export class FallbackTokenSource<Sources extends ITokenSource<any>[] | []> implements ITokenSource<MergeTokensFromSources<Sources>> {
  constructor(private readonly sources: Sources) {
    if (sources.length === 0) throw new Error('Need at least one source to setup a fallback token source');
  }

  getTokens({
    addresses,
    config,
  }: {
    addresses: Record<ChainId, TokenAddress[]>;
    config?: { timeout?: TimeString };
  }): Promise<Record<ChainId, Record<TokenAddress, MergeTokensFromSources<Sources>>>> {
    return new Promise<Record<ChainId, Record<TokenAddress, MergeTokensFromSources<Sources>>>>((resolve, reject) => {
      const result: Record<ChainId, Record<TokenAddress, MergeTokensFromSources<Sources>>> = {};
      const propertiesCounter = this.buildPropertiesCounter(addresses);

      let sourcesLeftToFulfil = this.sources.length;
      let successfulRequests = 0;

      const handleFulfil = (source: ITokenSource<object>) => {
        this.updatePropertiesCounterWhenSourceFulfilled(propertiesCounter, source, addresses);

        if (--sourcesLeftToFulfil === 0 || Object.keys(propertiesCounter).length === 0) {
          if (successfulRequests > 0) {
            resolve(result);
          } else {
            reject(new Error('Could not find tokens for the given addresses'));
          }
        }
      };

      this.sources.forEach(async (source) => {
        const addressesForSource = getAddressesForSource(source, addresses);
        if (Object.keys(addressesForSource).length === 0) {
          // If there is nothing to query for this source, exit
          handleFulfil(source);
          return;
        }

        timeoutPromise(source.getTokens({ addresses: addressesForSource }), config?.timeout, { reduceBy: '100' })
          .then((sourceResult) => {
            successfulRequests++;
            for (const [chainIdString, tokenRecord] of Object.entries(sourceResult)) {
              const chainId = parseInt(chainIdString);
              const tokens = Object.entries(tokenRecord);
              if (!(chainId in result) && tokens.length > 0) result[chainId] = {};

              for (const [address, tokenData] of tokens) {
                // Add to result
                result[chainId][address] = { ...result[chainId][address], ...tokenData };

                // Remove from counter
                for (const tokenProperty in tokenData) {
                  const property = tokenProperty as keyof MergeTokensFromSources<Sources>;
                  delete propertiesCounter?.[chainId]?.[address]?.[property];
                }
              }
            }
          })
          .catch(() => {}) // Handle, but do nothing
          .finally(() => handleFulfil(source));
      });
    });
  }

  tokenProperties(): Record<ChainId, KeyOfToken<MergeTokensFromSources<Sources>>[]> {
    return combineTokenProperties(this.sources);
  }

  private buildPropertiesCounter(addresses: Record<ChainId, TokenAddress[]>) {
    const propertiesCounter: Record<ChainId, Record<TokenAddress, Record<keyof MergeTokensFromSources<Sources>, number>>> = {};
    for (const chainId in addresses) {
      const counter: Record<keyof MergeTokensFromSources<Sources>, number> = {} as any;
      for (const source of this.sources) {
        const tokenProperties = source.tokenProperties();
        if (chainId in tokenProperties) {
          for (const tokenProperty of tokenProperties[chainId]) {
            const property = tokenProperty as keyof MergeTokensFromSources<Sources>;
            counter[property] = (counter[property] ?? 0) + 1;
          }
        }
      }
      propertiesCounter[chainId] = {};
      for (const tokenAddress of addresses[chainId]) {
        propertiesCounter[chainId][tokenAddress] = { ...counter };
      }
    }
    return propertiesCounter;
  }

  private updatePropertiesCounterWhenSourceFulfilled(
    propertiesCounter: Record<ChainId, Record<TokenAddress, Record<keyof MergeTokensFromSources<Sources>, number>>>,
    source: ITokenSource<object>,
    addresses: Record<ChainId, TokenAddress[]>
  ) {
    const tokenProperties = source.tokenProperties();
    const addressesForSource = getAddressesForSource(source, addresses);
    for (const [chainIdString, addresses] of Object.entries(addressesForSource)) {
      const chainId = parseInt(chainIdString);
      for (const address of addresses) {
        for (const tokenProperty of tokenProperties[chainId]) {
          const property = tokenProperty as keyof MergeTokensFromSources<Sources>;
          const counter = propertiesCounter[chainId]?.[address]?.[property];
          if (counter !== undefined) {
            if (counter === 1) {
              delete propertiesCounter[chainId][address][property];
            } else {
              propertiesCounter[chainId][address][property] = counter - 1;
            }
          }
        }
        if (
          chainId in propertiesCounter &&
          address in propertiesCounter[chainId] &&
          Object.keys(propertiesCounter[chainId][address]).length === 0
        ) {
          delete propertiesCounter[chainId][address];
        }
      }
      if (chainId in propertiesCounter && Object.keys(propertiesCounter[chainId]).length === 0) {
        delete propertiesCounter[chainId];
      }
    }
  }
}

function getAddressesForSource<TokenData extends object>(
  source: ITokenSource<TokenData>,
  addresses: Record<ChainId, TokenAddress[]>
): Record<ChainId, TokenAddress[]> {
  const chainsForSource = new Set(Object.keys(source.tokenProperties()));
  const filteredEntries = Object.entries(addresses)
    .filter(([chainId]) => chainsForSource.has(chainId))
    .map<[ChainId, TokenAddress[]]>(([chainId, addresses]) => [parseInt(chainId), addresses]);
  return Object.fromEntries(filteredEntries);
}
