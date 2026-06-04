import Image from "next/image";

type InlineContent = {
  type: "text" | "link";
  text?: string;
  href?: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
  };
  content?: InlineContent[];
};

type Block = {
  id: string;
  type: string;
  content?: InlineContent[];
  children?: Block[];
  props?: Record<string, unknown>;
};

type Props = {
  content: unknown;
};

export function ArticleContent({ content }: Props) {
  if (!Array.isArray(content) || content.length === 0) return null;

  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert">
      {(content as Block[]).map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="mb-4 leading-relaxed">
          <InlineRenderer content={block.content} />
        </p>
      );

    case "heading": {
      const level = (block.props?.level as number) ?? 2;
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
      const classes: Record<number, string> = {
        1: "mt-8 mb-4 text-3xl font-bold",
        2: "mt-8 mb-3 text-2xl font-bold",
        3: "mt-6 mb-2 text-xl font-semibold",
        4: "mt-4 mb-2 text-lg font-semibold",
      };
      return (
        <Tag className={classes[level] ?? classes[2]}>
          <InlineRenderer content={block.content} />
        </Tag>
      );
    }

    case "bulletListItem":
      return (
        <ul className="mb-4 list-disc pl-6">
          <li className="mb-1 leading-relaxed">
            <InlineRenderer content={block.content} />
            {block.children?.map((child) => (
              <BlockRenderer key={child.id} block={child} />
            ))}
          </li>
        </ul>
      );

    case "numberedListItem":
      return (
        <ol className="mb-4 list-decimal pl-6">
          <li className="mb-1 leading-relaxed">
            <InlineRenderer content={block.content} />
            {block.children?.map((child) => (
              <BlockRenderer key={child.id} block={child} />
            ))}
          </li>
        </ol>
      );

    case "quote":
      return (
        <blockquote className="mb-4 border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground">
          <InlineRenderer content={block.content} />
        </blockquote>
      );

    case "code":
      return (
        <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>
            <InlineRenderer content={block.content} />
          </code>
        </pre>
      );

    case "image": {
      const url = block.props?.url as string | undefined;
      const caption = block.props?.caption as string | undefined;
      if (!url) return null;
      return (
        <figure className="mb-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={url}
              alt={caption ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
            />
          </div>
          {caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    default:
      return null;
  }
}

function InlineRenderer({ content }: { content?: InlineContent[] }) {
  if (!content?.length) return null;

  return (
    <>
      {content.map((item, i) => {
        if (item.type === "link") {
          return (
            <a
              title="links"
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              <InlineRenderer content={item.content} />
            </a>
          );
        }

        const { bold, italic, underline, strike, code } = item.styles ?? {};
        let node: React.ReactNode = item.text ?? "";

        if (code)
          node = (
            <code className="rounded bg-muted px-1 py-0.5 text-sm font-mono">{node}</code>
          );
        if (bold) node = <strong className="font-semibold">{node}</strong>;
        if (italic) node = <em>{node}</em>;
        if (underline) node = <u>{node}</u>;
        if (strike) node = <s>{node}</s>;

        return <span key={i}>{node}</span>;
      })}
    </>
  );
}
