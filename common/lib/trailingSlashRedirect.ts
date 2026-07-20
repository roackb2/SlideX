const mcpTransportPaths = new Set(["/mcp", "/mcp/"]);

export function isMcpTransportPath(pathname: string) {
  return mcpTransportPaths.has(pathname);
}

/**
 * Reproduce Next's trailingSlash redirects while leaving the Remote MCP
 * transport available at both its canonical and legacy resource paths.
 */
export function trailingSlashRedirectPath(
  pathname: string,
  hasNextDataHeader = false
) {
  if (
    pathname === "/" ||
    isMcpTransportPath(pathname) ||
    pathname === "/.well-known" ||
    pathname.startsWith("/.well-known/")
  ) {
    return undefined;
  }

  if (pathname.endsWith("/")) {
    if (hasNextDataHeader) return undefined;
    const withoutTrailingSlash = pathname.slice(0, -1);
    const lastSegment = withoutTrailingSlash.slice(
      withoutTrailingSlash.lastIndexOf("/") + 1
    );
    return /\.\w+$/.test(lastSegment) ? withoutTrailingSlash : undefined;
  }

  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
  return lastSegment.includes(".") ? undefined : `${pathname}/`;
}
