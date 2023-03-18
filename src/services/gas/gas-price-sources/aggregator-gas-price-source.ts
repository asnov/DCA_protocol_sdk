import {
  calculateFieldRequirements,
  couldSupportMeetRequirements,
  combineSourcesSupport,
  doesResponseMeetRequirements,
} from '@shared/requirements-and-support';
import { timeoutPromise } from '@shared/timeouts';
import { filterRejectedResults } from '@shared/utils';
import { AmountOfToken, ChainId, FieldsRequirements, TimeString } from '@types';
import { BigNumber, constants } from 'ethers';
import { EIP1159GasPrice, GasPrice, GasPriceResult, IGasPriceSource, LegacyGasPrice, MergeGasValues } from '../types';
import { isEIP1159Compatible } from '../utils';

export type GasPriceAggregationMethod = 'mean' | 'min' | 'max';
export class AggregatorGasPriceSource<Sources extends IGasPriceSource<object>[] | []> implements IGasPriceSource<MergeGasValues<Sources>> {
  constructor(private readonly sources: Sources, private readonly method: GasPriceAggregationMethod) {
    if (sources.length === 0) throw new Error('No sources were specified');
  }

  supportedSpeeds() {
    return combineSourcesSupport<IGasPriceSource<object>, MergeGasValues<Sources>>(this.sources, (source) => source.supportedSpeeds());
  }

  async getGasPrice<Requirements extends FieldsRequirements<MergeGasValues<Sources>>>({
    chainId,
    config,
    context,
  }: {
    chainId: ChainId;
    config?: { fields?: Requirements };
    context?: { timeout?: TimeString };
  }) {
    const sourcesInChain = this.sources.filter(
      (source) => chainId in source.supportedSpeeds() && couldSupportMeetRequirements(source.supportedSpeeds()[chainId], config?.fields)
    );
    if (sourcesInChain.length === 0) throw new Error(`Chain with id ${chainId} cannot support the given requirements`);
    const promises = sourcesInChain.map((source) =>
      timeoutPromise(source.getGasPrice({ chainId, config, context }), context?.timeout, { reduceBy: '100' })
    );
    const results = await filterRejectedResults(promises);
    if (results.length === 0) throw new Error('Failed to calculate gas on all sources');
    const validResults = results.filter((response) => doesResponseMeetRequirements(response, config?.fields));
    if (validResults.length === 0) throw new Error('Could not fetch gas prices that met the given requirements');
    const resultsToAggregate = resultsWithMaxSpeed(validResults);
    const result = this.aggregate(resultsToAggregate);
    return result as GasPriceResult<MergeGasValues<Sources>, Requirements>;
  }

  private aggregate(results: GasPriceResult<object>[]): GasPriceResult<object> {
    const is1559 = results.some(isEIP1159Compatible);
    if (is1559) {
      const collected = collectBySpeed<EIP1159GasPrice>(results.filter(isEIP1159Compatible));
      return aggregate(true, collected, this.method);
    } else {
      const collected = collectBySpeed<LegacyGasPrice>(results.filter((result) => !isEIP1159Compatible(result)));
      return aggregate(false, collected, this.method);
    }
  }
}

function resultsWithMaxSpeed(results: GasPriceResult<object>[]): GasPriceResult<object>[] {
  const maxSpeeds = results.reduce((accum, curr) => (Object.keys(accum).length >= Object.keys(curr).length ? accum : curr));
  const speedsId = (result: Record<string, any>) => Object.keys(result).join('-');
  const maxSpeedsId = speedsId(maxSpeeds);
  return results.filter((result) => maxSpeedsId === speedsId(result));
}

function collectBySpeed<GasPriceVersion extends GasPrice>(array: GasPriceResult<object>[]) {
  const collected: Record<string, GasPriceVersion[]> = {};
  for (const gasPrice of array) {
    for (const speed in gasPrice) {
      if (!(speed in collected)) collected[speed] = [];
      collected[speed].push((gasPrice as any)[speed]);
    }
  }
  return collected;
}

type CalculateVersion<Is1559 extends boolean> = Is1559 extends true ? EIP1159GasPrice : LegacyGasPrice;
function aggregate<Is1559 extends boolean>(
  is1559: Is1559,
  bySpeed: Record<string, CalculateVersion<Is1559>[]>,
  method: GasPriceAggregationMethod
) {
  const result: Record<any, CalculateVersion<Is1559>> = {};
  for (const speed in bySpeed) {
    result[speed] = aggregateBySpeed<Is1559>(is1559, bySpeed[speed], method) as CalculateVersion<Is1559>;
  }
  return result;
}

function aggregateBySpeed<Is1559 extends boolean>(is1559: Is1559, toAggregate: CalculateVersion<Is1559>[], method: GasPriceAggregationMethod) {
  return is1559 ? aggregate1559(toAggregate as EIP1159GasPrice[], method) : aggregateLegacy(toAggregate as LegacyGasPrice[], method);
}

function aggregate1559(toAggregate: EIP1159GasPrice[], method: GasPriceAggregationMethod) {
  switch (method) {
    case 'mean':
      return meanByProperty(toAggregate, 'maxFeePerGas');
    case 'max':
      return maxByProperty(toAggregate, 'maxFeePerGas');
    case 'min':
      return minByProperty(toAggregate, 'maxFeePerGas');
  }
}

function aggregateLegacy(toAggregate: LegacyGasPrice[], method: GasPriceAggregationMethod) {
  switch (method) {
    case 'mean':
      return meanByProperty(toAggregate, 'gasPrice');
    case 'max':
      return maxByProperty(toAggregate, 'gasPrice');
    case 'min':
      return minByProperty(toAggregate, 'gasPrice');
  }
}

function meanByProperty<GasPriceVersion extends GasPrice>(array: GasPriceVersion[], property: keyof GasPriceVersion): GasPriceVersion {
  const sorted = array.sort((a, b) => (BigNumber.from(a[property]).lte(b[property] as AmountOfToken) ? -1 : 1));
  return sorted[Math.floor(sorted.length / 2)];
}

function maxByProperty<GasPriceVersion extends GasPrice>(array: GasPriceVersion[], property: keyof GasPriceVersion): GasPriceVersion {
  return array.reduce((accum, curr) => (BigNumber.from(accum[property]).gte(curr[property] as AmountOfToken) ? accum : curr));
}

function minByProperty<GasPriceVersion extends GasPrice>(array: GasPriceVersion[], property: keyof GasPriceVersion): GasPriceVersion {
  return array.reduce((accum, curr) => (BigNumber.from(accum[property]).lte(curr[property] as AmountOfToken) ? accum : curr));
}
