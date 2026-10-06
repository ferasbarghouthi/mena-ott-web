// Phase gates from PRD v1.1 §5.2. Flip to true when the phase ships.
export const FEATURES = {
  coupons: false, // Phase 2: coupon field at checkout
  upgrade: false, // Phase 2: upgrade / downgrade
  autoRenew: false, // Phase 2: auto-renew toggle
  ticketTracking: false, // Phase 2: list of my support tickets
} as const;
