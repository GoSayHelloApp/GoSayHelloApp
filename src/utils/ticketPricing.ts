/**
 * Processing fee (matches backend compute_fee_cents + iOS Constant.processingFee):
 *   (subtotal × 5%) + $2.50 flat + (subtotal × 2.9% + $0.30).
 * Free tickets (subtotal <= 0) incur no fee. Total = unit price × quantity (dollars).
 */
export function processingFeeUsd(subtotalUsd: number): number {
  if (!subtotalUsd || subtotalUsd <= 0) return 0;
  const platform = subtotalUsd * 0.05;
  const processing = subtotalUsd * 0.029 + 0.3;
  return platform + 2.5 + processing;
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
