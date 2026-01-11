import { auth } from "./auth";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

    if (!isLoggedIn && !isAuthPage) {
        const url = new URL("/auth/signin", req.nextUrl.origin);
        return Response.redirect(url);
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
