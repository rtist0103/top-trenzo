"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { createTag } from "../actions/create-tag";
import type { Tag } from "../queries/get-tags";

type Props = {
  tags: Tag[];

  selectedTagIds: string[];

  onChange: (ids: string[]) => void;
};

export function TagsSelector({ tags, selectedTagIds, onChange }: Props) {
  const [search, setSearch] = useState("");

  // LOCAL TAG STATE
  const [localTags, setLocalTags] = useState(tags ?? []);

  const [isCreating, setIsCreating] = useState(false);

  const selectedTags = localTags.filter((tag) => selectedTagIds.includes(tag.id));

  const filteredTags = useMemo(() => {
    return localTags.filter((tag) => {
      const matches = tag.name.toLowerCase().includes(search.toLowerCase());

      const notSelected = !selectedTagIds.includes(tag.id);

      return matches && notSelected;
    });
  }, [localTags, search, selectedTagIds]);

  function addTag(tagId: string) {
    if (selectedTagIds.includes(tagId)) {
      return;
    }

    onChange([...selectedTagIds, tagId]);

    setSearch("");
  }

  function removeTag(tagId: string) {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  }

  async function handleCreateTag() {
    const name = search.trim();

    if (!name) return;

    try {
      setIsCreating(true);

      // prevent duplicates
      const existing = localTags.find(
        (tag) => tag.name.toLowerCase() === name.toLowerCase(),
      );

      if (existing) {
        addTag(existing.id);

        return;
      }

      const newTag = await createTag(name);

      // instantly searchable
      setLocalTags((prev) => [...prev, newTag]);

      // auto select
      onChange([...selectedTagIds, newTag.id]);

      setSearch("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Selected */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            className="cursor-pointer"
            onClick={() => removeTag(tag.id)}
          >
            {tag.name} ×
          </Badge>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder="Search or create tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Dropdown */}
      {search && (
        <div
          className="
            max-h-48
            overflow-auto
            rounded-md
            border
            bg-background
            shadow-md
          "
        >
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="
                    flex
                    w-full
                    items-center
                    px-3
                    py-2
                    text-left
                    hover:bg-accent
                  "
                onClick={() => addTag(tag.id)}
              >
                {tag.name}
              </button>
            ))
          ) : (
            <button
              type="button"
              disabled={isCreating}
              className="
                w-full
                px-3
                py-2
                text-left
                text-sm
                hover:bg-accent
              "
              onClick={handleCreateTag}
            >
              {isCreating ? "Creating..." : `+ Create "${search}"`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
