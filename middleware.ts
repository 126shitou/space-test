import { NextRequest, NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import { fallbackLng, languages, cookieName, headerName } from "./i18n/config";
import { customLog } from "./lib/utils/log";

acceptLanguage.languages(languages);

const protectedRoutes: string[] = ["/account"];

export const middleware = async (req: NextRequest) => {
  if (req.method !== "GET") return NextResponse.next();

  // ======================================= 首页重定向配置 =====================================================
  const pathname = req.nextUrl.pathname;

  // 将访问首页的请求重定向到 ai-image-generator
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/ai-image-generator", req.url));
  }

  // 将访问语言首页的请求重定向到对应语言的 ai-image-generator
  const lngHomePage = languages.find((lng) => pathname === `/${lng}`);
  if (lngHomePage) {
    return NextResponse.redirect(new URL(`/${lngHomePage}/ai-image-generator`, req.url));
  }

  // ======================================= 路由保护配置 =====================================================
  customLog("middleware > pathname", pathname);

  const isProtected = protectedRoutes.some((path) => pathname.includes(path));
  if (isProtected)
    return Response.redirect(new URL("/auth/signin", req.nextUrl.origin));

  // ======================================= 国际化配置 =====================================================

  // 跳过静态资源和图标
  if (
    req.nextUrl.pathname.indexOf("icon") > -1 ||
    req.nextUrl.pathname.indexOf("chrome") > -1
  )
    return NextResponse.next();
  // 跳过 Server Action 请求 (POST 方法通常是 Server Action)

  // 国际化逻辑
  let lng;
  // Try to get language from cookie
  if (req.cookies.has(cookieName))
    lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
  // If no cookie, check the Accept-Language header
  if (!lng) lng = acceptLanguage.get(req.headers.get("Accept-Language"));
  // Default to fallback language if still undefined
  if (!lng) lng = fallbackLng;

  // Check if the language is already in the path
  const lngInPath = languages.find((loc: string) =>
    req.nextUrl.pathname.startsWith(`/${loc}`)
  );

  const headers = new Headers(req.headers);
  headers.set(headerName, lngInPath || lng);

  // If the language is not in the path, redirect to include it
  if (!lngInPath && !req.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.redirect(
      new URL(`/${lng}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
    );
  }

  // If a referer exists, try to detect the language from there and set the cookie accordingly
  if (req.headers.has("referer")) {
    const refererUrl = new URL(req.headers.get("referer") || "");
    const lngInReferer = languages.find((l: string) =>
      refererUrl.pathname.startsWith(`/${l}`)
    );
    const response = NextResponse.next({ headers });
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
    return response;
  }

  return NextResponse.next({ headers });
};

export const config = {
  // 只匹配页面路由，排除 API 和静态资源
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
