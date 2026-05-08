export { auth as proxy } from "@/auth";

export const config = {
  // Protect /admin routes and checkout/success pages
  matcher: ["/admin/:path*", "/checkout/:path*"],
};
