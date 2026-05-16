/** Processing fee: max(total × 15%, $2.50). Total = unit price × quantity (dollars). */
export function processingFeeUsd(subtotalUsd: number): number {
  const pct = subtotalUsd * 0.15;
  return Math.max(pct, 2.5);
}

/** HELLO value: tokens / 1000 dollars (uncapped). */
export function helloDiscountUsd(tokens: number): number {
  if (!tokens || tokens < 0) return 0;
  return tokens / 1000;
}

/**
 * HELLO tokens reduce the processing fee only, not ticket subtotal.
 * Dollar discount = min(tokens/1000, processingFeeUsd(subtotal)).
 */
export function feeHelloDiscountUsd(subtotalUsd: number, tokens: number): number {
  const fee = processingFeeUsd(subtotalUsd);
  return Math.min(helloDiscountUsd(tokens), fee);
}

export function payableUsd(subtotalUsd: number, tokens: number): number {
  const fee = processingFeeUsd(subtotalUsd);
  const offFee = feeHelloDiscountUsd(subtotalUsd, tokens);
  return subtotalUsd + (fee - offFee);
}

export function payableCents(subtotalUsd: number, tokens: number): number {
  return Math.round(payableUsd(subtotalUsd, tokens) * 100);
}

/** Max raw HELLO tokens redeemable on this order: min(wallet, fee_usd × 1000). */
export function maxTokensRedeemableAgainstFee(subtotalUsd: number, walletTokenBalance: number): number {
  const fee = processingFeeUsd(subtotalUsd);
  const cap = Math.round(fee * 1000);
  return Math.max(0, Math.min(walletTokenBalance, cap));
}
