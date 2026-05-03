export function getLogoUrl(name, domain) {
  const effectiveDomain = domain || `${name.toLowerCase().replace(/\s+/g, '')}.com`
  return `https://logo.clearbit.com/${effectiveDomain}`
}
