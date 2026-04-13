import { getSwaggerSpec } from "@/src/lib/swaggerConfig";
import { NextResponse } from "next/server";

/**
 * GET /api/docs
 * Returns the full OpenAPI 3.0 JSON spec.
 * Consumed by the Swagger UI page at /docs.
 */
export async function GET() {
  const spec = getSwaggerSpec();

  return NextResponse.json(spec, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // No-cache so spec updates are always fresh in development
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
