// ─────────────────────────────────────────────────────────────────────────────
// Session — Device Profile
// Infere o spending profile pelo User-Agent do browser
// ─────────────────────────────────────────────────────────────────────────────

export type SpendingProfile = 'premium' | 'mid' | 'budget';

export function detectSpendingProfile(userAgent: string = navigator.userAgent): SpendingProfile {
  const ua = userAgent.toLowerCase();

  // iPhone recente: iOS 17+ = iPhone 15 Pro / 16 = alto poder de compra
  if (/iphone/.test(ua)) {
    const match = ua.match(/cpu iphone os (\d+)_/);
    const ios   = match ? parseInt(match[1]) : 0;
    if (ios >= 17) return 'premium';
    if (ios >= 15) return 'mid';
    return 'budget';
  }

  // iPad recente
  if (/ipad/.test(ua)) {
    return 'mid';
  }

  // Android: versão mais recente → mid, antiga → budget
  if (/android/.test(ua)) {
    const match   = ua.match(/android (\d+)/);
    const version = match ? parseInt(match[1]) : 0;
    if (version >= 13) return 'mid';
    return 'budget';
  }

  // macOS → geralmente premium (Mac = poder de compra)
  if (/macintosh|mac os x/.test(ua) && !/iphone|ipad/.test(ua)) {
    return 'premium';
  }

  // Windows
  if (/windows/.test(ua)) {
    return 'mid';
  }

  return 'mid';
}

// Deteta o tipo de device para contexto adicional
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function detectDeviceType(userAgent: string = navigator.userAgent): DeviceType {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) return 'mobile';
  return 'desktop';
}
