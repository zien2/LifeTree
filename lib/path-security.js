function matchesConfiguredPath(pathname, configuredPath) {
  if (configuredPath === '/') {
    return pathname === '/'
  }

  return pathname === configuredPath || pathname.startsWith(`${configuredPath}/`)
}

module.exports = {
  matchesConfiguredPath,
}
