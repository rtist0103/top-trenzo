"use server";

import cloudinary from "@/lib/cloudinary/cloudinary";

export async function uploadImage(
  formData: FormData,
) {
  const file =
    formData.get(
      "file",
    ) as File;

  if (!file) {
    throw new Error(
      "No file uploaded",
    );
  }

  const bytes =
    await file.arrayBuffer();

  const buffer =
    Buffer.from(bytes);

  const base64 =
    `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result =
      await cloudinary.uploader.upload(
        base64,
        {
          folder:
            "byte-news/featured-images",

          resource_type:
            "image",
        },
      );

    return {
      success: true,
      url: result.secure_url,
    };
  } catch (
    error
  ) {
    console.error(
      error,
    );

    throw new Error(
      "Image upload failed",
    );
  }
}