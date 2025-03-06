/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type Params = {
  params: Promise<{
    sku: string | string[];
  }>;
};

const parseFormatString = (
  format: string | null,
  accept: string | null
): string | null => {
  if (format === null) {
    return null;
  }
  if (format === "accept") return accept;
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  if (format === "jpeg") return "image/jpeg";
  if (format === "avif") return "image/avif";
  if (format === "jpg") return "image/jpeg";
  return null;
};

const parseSize = (size: string | null): string => {
  if (size === "thumbnail") return "128";
  if (size === "xxsmall") return "256";
  if (size === "xsmall") return "384";
  if (size === "small") return "640";
  if (size === "large") return "3840";
  return "1200";
};

const parseQuality = (quality: string | null): string => {
  if (quality === "high") return "100";
  if (quality === "medium") return "90";
  if (quality === "low") return "75";
  if (quality === "xlow") return "25";
  return "75";
};

export async function GET(request: NextRequest) {
  const query = new URLSearchParams(new URL(request.url).searchParams);
  const headers = new Headers(request.headers);

  const imageUrl = query.get("url");
  const formatParam = query.get("format");
  const sizeParam = query.get("size");
  const qualityParam = query.get("q");
  const downloadParam = query.get("download");
  const bypassKeyQuery = query.get("x-vercel-protection-bypass");
  const bypassKeyHeader = headers.get("x-vercel-protection-bypass");
  const bypassKey = bypassKeyQuery || bypassKeyHeader;

  const download = downloadParam === "true";
  const [format, size, quality] = [
    parseFormatString(formatParam, headers.get("accept")) || "image/png",
    parseSize(sizeParam),
    parseQuality(qualityParam),
  ];
  if (format !== null) {
    headers.set("accept", format);
  }

  let url = `${request.nextUrl.origin}/_next/image?url=${imageUrl}&w=${size}&q=${quality}`;
  if (bypassKey) {
    url = `${url}&x-vercel-protection-bypass=${bypassKey}`;
  }
  const image = await fetch(url, {
    headers,
  });
  const responseHeaders = new Headers(image.headers);
  responseHeaders.set("cache-control", "public, max-age=86400");
  const contentType = responseHeaders.get("content-type");
  const fileExtension = contentType?.split("/")[1];
  responseHeaders.set(
    "content-disposition",
    `${download ? "attachment" : "inline"}; filename="hello.${fileExtension}"`
  );
  return new NextResponse(image.body, {
    headers: responseHeaders,
    status: image.status,
  });
}
