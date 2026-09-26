/**
 * Whop integration boundary.
 *
 * Keep provider-specific logic here so the product can evolve without
 * spreading financial infrastructure details throughout the UI.
 *
 * Live endpoints/SDK calls will be wired after platform credentials are added.
 */

export type ConnectedAccountStatus = "unverified" | "pending" | "verified";

export type WhopAccount = {
  id: string;
  status: ConnectedAccountStatus;
  balanceCents: number;
};

export type VirtualCard = {
  id: string;
  last4: string;
  status: "active" | "frozen" | "closed";
};

export async function createConnectedAccount(): Promise<WhopAccount> {
  throw new Error("Whop credentials not configured");
}

export async function createCheckoutForEvent(_input: {
  eventId: string;
  amountCents: number;
  successUrl: string;
}): Promise<{ checkoutUrl: string }> {
  throw new Error("Whop credentials not configured");
}

export async function issueVirtualCard(_accountId: string): Promise<VirtualCard> {
  throw new Error("Whop credentials not configured");
}

export async function requestWithdrawal(_input: {
  accountId: string;
  amountCents: number;
}): Promise<{ id: string; status: string }> {
  throw new Error("Whop credentials not configured");
}
