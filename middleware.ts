import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware a todas as rotas excepto:
     * - _next/static (ficheiros estáticos)
     * - _next/image (optimização de imagens)
     * - favicon.ico
     * - ficheiros com extensão (svg, png, jpg, …)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
