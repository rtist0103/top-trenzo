"use client";

import { useRef, useState, useTransition } from "react";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { deleteImage } from "@/features/upload/actions/delete-image";
import { uploadImage } from "@/features/upload/actions/upload-image";

type Props = {
  value?: string;
  onChange: (url: string) => void;
};

export function ImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState(value ?? "");

  const [isPending, startTransition] = useTransition();

  async function handleUpload(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    startTransition(async () => {
      try {
        const result = await uploadImage(formData);

        if (result?.url) {
          setPreview(result.url);

          if (value) {
            await deleteImage(value);
          }

          onChange(result.url);
        }
      } catch (error) {
        console.error(error);

        alert("Upload failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      {preview && (
        <div
          className="
            relative
            aspect-video
            overflow-hidden
            rounded-lg
            border
            h-48
          "
        >
          <Image src={preview} alt="Preview" fill loading="eager" className="object-cover" />
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            handleUpload(file);
          }
        }}
      />

      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? "Uploading..." : preview ? "Replace Image" : "Upload Image"}
      </Button>
    </div>
  );
}
