"use server";

import cloudinary from "@/lib/cloudinary/cloudinary";

export async function deleteImage(
  imageUrl: string,
): Promise<{
  success: boolean;
}> {
  try {
    if (!imageUrl) {
      return {
        success: false,
      };
    }

    const splitUrl =
      imageUrl.split(
        "/upload/",
      );

    const parts =
      splitUrl[1];

    if (!parts) {
      return {
        success: false,
      };
    }

    const filePath =
      parts.split(".")[0];

    if (!filePath) {
      return {
        success: false,
      };
    }

    const publicId =
      filePath
        .split("/")
        .slice(1)
        .join("/");

    if (!publicId) {
      return {
        success: false,
      };
    }

    await cloudinary.uploader.destroy(
      publicId,
    );

    return {
      success: true,
    };
  } catch (
    error
  ) {
    console.error(
      "Cloudinary delete failed:",
      error,
    );

    return {
      success: false,
    };
  }
}