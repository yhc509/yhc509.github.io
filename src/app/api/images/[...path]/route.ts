import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mime from "mime";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await params;

    // Construct the full path to the requested file
    // The pathSegments array comes from [...path] in the URL
    // e.g. /api/images/aws/img/cloud.png -> ['aws', 'img', 'cloud.png']
    const relativePath = pathSegments.join("/");
    const postsDirectory = path.join(process.cwd(), "content/posts");
    const filePath = path.join(postsDirectory, relativePath);

    // Security check: Ensure the file is within the posts directory
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(postsDirectory)) {
        return new NextResponse("Access Denied", { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
        return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const contentType = mime.getType(filePath) || "application/octet-stream";

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
