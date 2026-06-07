export function getLogoUrl(name, domain) {
  const effectiveDomain = domain || `${name.toLowerCase().replace(/\s+/g, '')}.com`
  return `https://www.google.com/s2/favicons?domain=${effectiveDomain}&sz=64`
}
