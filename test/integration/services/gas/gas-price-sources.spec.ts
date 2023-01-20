import ms from 'ms';
import { expect } from 'chai';
import crossFetch from 'cross-fetch';
import { BigNumber } from 'ethers';
import { Chains } from '@chains';
import { FetchService } from '@services/fetch/fetch-service';
import { PublicProvidersSource } from '@services/providers/provider-sources/public-providers';
import { AVAILABLE_GAS_SPEEDS, IGasPriceSource, GasSpeedSupportRecord, GasSpeedPriceResult } from '@services/gas/types';
import { isEIP1159Compatible } from '@services/gas/utils';
import { OpenOceanGasPriceSource } from '@services/gas/gas-price-sources/open-ocean';
import { ProviderGasPriceSource } from '@services/gas/gas-price-sources/provider';
import { PrioritizedGasPriceSourceCombinator } from '@services/gas/gas-price-sources/prioritized-gas-price-source-combinator';
import { FastestGasPriceSourceCombinator } from '@services/gas/gas-price-sources/fastest-gas-price-source-combinator';

const OPEN_OCEAN_SOURCE = new OpenOceanGasPriceSource(new FetchService(crossFetch));
const PROVIDER_SOURCE = new ProviderGasPriceSource(new PublicProvidersSource());
const PRIORITIZED_GAS_SOURCE = new PrioritizedGasPriceSourceCombinator([OPEN_OCEAN_SOURCE, PROVIDER_SOURCE]);
const FASTEST_GAS_SOURCE = new FastestGasPriceSourceCombinator([OPEN_OCEAN_SOURCE, PROVIDER_SOURCE]);

jest.retryTimes(2);
jest.setTimeout(ms('30s'));

describe('Gas Price Sources', () => {
  gasPriceSourceTest({ title: 'Provider Source', source: PROVIDER_SOURCE });
  gasPriceSourceTest({ title: 'Open Ocean Source', source: OPEN_OCEAN_SOURCE });
  gasPriceSourceTest({ title: 'Prioritized Gas Source', source: PRIORITIZED_GAS_SOURCE });
  gasPriceSourceTest({ title: 'Fastest Gas Source', source: FASTEST_GAS_SOURCE });

  function gasPriceSourceTest<SupportRecord extends GasSpeedSupportRecord>({
    title,
    source,
  }: {
    title: string;
    source: IGasPriceSource<SupportRecord>;
  }) {
    describe(title, () => {
      for (const chainId of source.supportedChains()) {
        const chain = Chains.byKey(chainId);
        describe(chain?.name ?? `Chain with id ${chainId}`, () => {
          test.concurrent(`Gas prices are valid values`, async () => {
            const gasPrice = await source.getGasPrice(chainId);
            for (const speed in source.supportedSpeeds()) {
              const support = source.supportedSpeeds()[speed];
              if (support === 'present') {
                expect(isGasPriceIsSetForSpeed(gasPrice, speed)).to.be.true;
              } else {
                expect(!(speed in gasPrice) || isGasPriceIsSetForSpeed(gasPrice, speed)).to.be.true;
              }
            }
            const unsupportedGasSpeeds = AVAILABLE_GAS_SPEEDS.filter((speed) => !(speed in source.supportedSpeeds()));
            for (const speed of unsupportedGasSpeeds) {
              expect(gasPrice).to.not.have.property(speed);
            }
          });
        });
        const isGasPriceIsSetForSpeed = (gasPrice: GasSpeedPriceResult<SupportRecord>, speed: keyof SupportRecord) => {
          if (isEIP1159Compatible(gasPrice)) {
            return (
              BigNumber.isBigNumber((gasPrice as any)[speed].maxFeePerGas) ||
              BigNumber.isBigNumber((gasPrice as any)[speed].maxPriorityFeePerGas)
            );
          } else {
            return BigNumber.isBigNumber((gasPrice as any)[speed].gasPrice);
          }
        };
      }
    });
  }
});