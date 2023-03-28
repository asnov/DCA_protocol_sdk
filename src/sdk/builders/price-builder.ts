import { IFetchService } from '@services/fetch';
import { ExpirationConfigOptions } from '@shared/generic-cache';
import { IPriceService, IPriceSource } from '@services/prices';
import { DefiLlamaPriceSource } from '@services/prices/price-sources/defi-llama-price-source';
import { PriceService } from '@services/prices/price-service';
import { CachedPriceSource } from '@services/prices/price-sources/cached-price-source';
import { OdosPriceSource } from '@services/prices/price-sources/odos-price-source';
import { CoingeckoPriceSource } from '@services/prices/price-sources/coingecko-price-source';
import { PortalsFiPriceSource } from '@services/prices/price-sources/portals-fi-price-source';
import { MoralisPriceSource } from '@services/prices/price-sources/moralis-price-source';
import { PrioritizedPriceSource } from '@services/prices/price-sources/prioritized-price-source';
import { FastestPriceSource } from '@services/prices/price-sources/fastest-price-source';
import { AggregatorPriceSource, PriceAggregationMethod } from '@services/prices/price-sources/aggregator-price-source';

export type PriceSourceInput =
  | { type: 'defi-llama' }
  | { type: 'odos' }
  | { type: 'coingecko' }
  | { type: 'portals-fi' }
  | { type: 'moralis'; key: string }
  | { type: 'prioritized'; sources: PriceSourceInput[] }
  | { type: 'fastest'; sources: PriceSourceInput[] }
  | { type: 'aggregate'; sources: PriceSourceInput[]; by: PriceAggregationMethod }
  | { type: 'cached'; underlyingSource: PriceSourceInput; expiration: ExpirationConfigOptions }
  | { type: 'custom'; instance: IPriceSource };
export type BuildPriceParams = { source: PriceSourceInput };

export function buildPriceService(params: BuildPriceParams | undefined, fetchService: IFetchService): IPriceService {
  const source = buildSource(params?.source, { fetchService });
  return new PriceService(source);
}

function buildSource(source: PriceSourceInput | undefined, { fetchService }: { fetchService: IFetchService }): IPriceSource {
  const coingecko = new CoingeckoPriceSource(fetchService);
  const defiLlama = new DefiLlamaPriceSource(fetchService);
  const portalsFi = new PortalsFiPriceSource(fetchService);
  const odos = new OdosPriceSource(fetchService);
  switch (source?.type) {
    case undefined:
      // Defi Llama and Portals.Fi are basically Coingecko with some token mappings. Defi Llama has a 5 min cache, and Portals.Fi has a
      // 1 min cache, so the priority will be Coingecko => PortalsFi => DefiLlama
      const prioritized = new PrioritizedPriceSource([coingecko, portalsFi, defiLlama]);
      return new AggregatorPriceSource([prioritized, odos], 'median');
    case 'defi-llama':
      return defiLlama;
    case 'odos':
      return odos;
    case 'portals-fi':
      return portalsFi;
    case 'moralis':
      return new MoralisPriceSource(fetchService, source.key);
    case 'coingecko':
      return coingecko;
    case 'cached':
      const underlying = buildSource(source.underlyingSource, { fetchService });
      return new CachedPriceSource(underlying, source.expiration);
    case 'prioritized':
      return new PrioritizedPriceSource(source.sources.map((source) => buildSource(source, { fetchService })));
    case 'fastest':
      return new FastestPriceSource(source.sources.map((source) => buildSource(source, { fetchService })));
    case 'aggregate':
      return new AggregatorPriceSource(
        source.sources.map((source) => buildSource(source, { fetchService })),
        source.by
      );
    case 'custom':
      return source.instance;
  }
}