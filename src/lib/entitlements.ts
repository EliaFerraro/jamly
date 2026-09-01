/**
 * Feature entitlements.
 *
 * Phase 1 is completely free with no limits (ADR-0005). This abstraction exists
 * anyway, and every access check in the app goes through it, so that turning on
 * an individual Pro tier later is a change HERE and nowhere else.
 *
 * The rule that must survive into Phase 2: shared band functionality is never
 * gated. If one member pays and another doesn't, the band works identically for
 * both — otherwise we reintroduce the adoption problem the product exists to
 * solve (docs/business/05-business-model.md).
 */

/** Features that may one day be Pro. Shared band features are absent by design. */
export type Feature =
  | 'practice.analytics'
  | 'practice.fullHistory'
  | 'storage.extended'
  | 'charts.advancedTools'
  | 'bands.unlimited'
  | 'gear.library'
  | 'export.pdf';

export type Plan = 'free_unlimited' | 'free' | 'pro';

/**
 * Phase 1: everything is available to everyone.
 *
 * Do NOT read a plan name anywhere else in the app. When Phase 2 arrives, this
 * function grows a real implementation and nothing above it changes.
 */
export function hasEntitlement(_feature: Feature, plan: Plan = 'free_unlimited'): boolean {
  if (plan === 'free_unlimited') return true; // grandfathered Phase 1 users, forever
  if (plan === 'pro') return true;
  return true; // Phase 1: no gating exists yet
}

/** Hook form, so screens never branch on a plan name. */
export function useEntitlement(feature: Feature): boolean {
  return hasEntitlement(feature);
}
