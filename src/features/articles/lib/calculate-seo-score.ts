type Input = {
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  featuredImage?: string;
  shortDescription?: string;
  wordCount?: number;
};

type SeoCheck = {
  label: string;
  passed: boolean;
};

export function calculateSeoScore({
  title,
  seoTitle,
  seoDescription,
  slug,
  featuredImage,
  shortDescription,
  wordCount = 0,
}: Input) {
  let score = 0;

  const checks: SeoCheck[] =
    [];

  const finalTitle =
    seoTitle ||
    title;

  // Title exists
  const hasTitle =
    !!finalTitle;

  checks.push({
    label:
      "SEO title exists",
    passed:
      hasTitle,
  });

  if (
    hasTitle
  ) {
    score += 15;
  }

  // Title length
  const titleGood =
    finalTitle.length >=
      50 &&
    finalTitle.length <=
      60;

  checks.push({
    label:
      "SEO title length (50–60 chars)",
    passed:
      titleGood,
  });

  if (
    titleGood
  ) {
    score += 15;
  }

  // Meta description exists
  const hasDescription =
    !!seoDescription;

  checks.push({
    label:
      "Meta description exists",
    passed:
      hasDescription,
  });

  if (
    hasDescription
  ) {
    score += 15;
  }

  // Meta description length
  const descriptionGood =
    (
      seoDescription?.length ??
      0
    ) >= 140 &&
    (
      seoDescription?.length ??
      0
    ) <= 160;

  checks.push({
    label:
      "Meta description length (140–160 chars)",
    passed:
      descriptionGood,
  });

  if (
    descriptionGood
  ) {
    score += 15;
  }

  // Slug
  const slugGood =
    slug.length >=
      3 &&
    !slug.includes(
      "--",
    );

  checks.push({
    label:
      "Slug optimized",
    passed:
      slugGood,
  });

  if (
    slugGood
  ) {
    score += 10;
  }

  // Featured image
  const hasImage =
    !!featuredImage;

  checks.push({
    label:
      "Featured image added",
    passed:
      hasImage,
  });

  if (
    hasImage
  ) {
    score += 10;
  }

  // Short description
  const hasSummary =
    !!shortDescription;

  checks.push({
    label:
      "Short description added",
    passed:
      hasSummary,
  });

  if (
    hasSummary
  ) {
    score += 10;
  }

  // Content length
  const contentGood =
    wordCount >=
    300;

  checks.push({
    label:
      "Content length (300+ words)",
    passed:
      contentGood,
  });

  if (
    contentGood
  ) {
    score += 10;
  }

  return {
    score,
    checks,
  };
}