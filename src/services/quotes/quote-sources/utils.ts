import { calculatePercentage } from '@shared/utils';
import { Chain, TokenAddress } from '@types';
import { ITriggerablePromise } from '../source-lists/types';
import { SourceQuoteResponse } from './base';

export function failed(chain: Chain, sellToken: TokenAddress, buyToken: TokenAddress, error?: any): never {
  const context = error ? ` with error ${JSON.stringify(error)}` : '';
  throw new Error(`Failed to calculate quote between ${sellToken} and ${buyToken} on ${chain.name}${context}`);
}

type SlippagelessQuote = Omit<SourceQuoteResponse, 'minBuyAmount' | 'maxSellAmount' | 'type'>;
export function addQuoteSlippage(quote: SlippagelessQuote, type: 'sell' | 'buy', slippagePercentage: number): SourceQuoteResponse {
  return type === 'sell'
    ? {
        ...quote,
        type,
        minBuyAmount: quote.buyAmount.sub(calculatePercentage(quote.buyAmount, slippagePercentage)),
        maxSellAmount: quote.sellAmount,
      }
    : {
        ...quote,
        type,
        maxSellAmount: quote.sellAmount.add(calculatePercentage(quote.sellAmount, slippagePercentage)),
        minBuyAmount: quote.buyAmount,
      };
}

export class TriggerablePromise<T> implements ITriggerablePromise<T> {
  private promise: Promise<T> | undefined;

  constructor(private readonly trigger: () => Promise<T>) {}

  request(): Promise<T> {
    if (!this.promise) {
      this.promise = this.trigger();
    }
    return this.promise;
  }
}
