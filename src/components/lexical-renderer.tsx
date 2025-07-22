import React from "react";

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  direction?: string;
  indent?: number;
  version?: number;
  textFormat?: number;
  textStyle?: string;
  mode?: string;
  style?: string;
  detail?: number;
  tag?: string;
  listType?: string;
  language?: string;
  url?: string;
  target?: string;
  rel?: string;
}

interface LexicalRendererProps {
  content?: string | LexicalNode;
}

export const LexicalRenderer: React.FC<LexicalRendererProps> = ({
  content,
}) => {
  const renderNode = (node: LexicalNode): React.ReactNode => {
    switch (node.type) {
      case "root":
        return node.children?.map((child, index) => (
          <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
        ));

      case "paragraph":
        return (
          <p className={`${getTextAlignment(node.format)} ${""} mb-2`}>
            {node.children?.map((child, index) => (
              <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
            ))}
          </p>
        );

      case "heading":
        const Tag = node.tag as keyof React.JSX.IntrinsicElements;
        return (
          <Tag className={`${getTextAlignment(node.format)} ${""}`}>
            {node.children?.map((child, index) => (
              <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
            ))}
          </Tag>
        );

      case "text":
        let textElement: React.ReactNode = node.text;

        // Apply formatting
        if (node.format && node.format & 1)
          textElement = <strong>{textElement}</strong>;
        if (node.format && node.format & 2)
          textElement = <em>{textElement}</em>;
        if (node.format && node.format & 8) textElement = <u>{textElement}</u>;
        if (node.format && node.format & 4) textElement = <s>{textElement}</s>;
        if (node.format && node.format & 16)
          textElement = <code>{textElement}</code>;
        if (node.format && node.format & 32)
          textElement = <sub>{textElement}</sub>;
        if (node.format && node.format & 64)
          textElement = <sup>{textElement}</sup>;

        return textElement;

      case "list":
        const ListTag = node.listType === "number" ? "ol" : "ul";
        return (
          <ListTag>
            {node.children?.map((child, index) => (
              <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
            ))}
          </ListTag>
        );

      case "listitem":
        return (
          <li>
            {node.children?.map((child, index) => (
              <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
            ))}
          </li>
        );

      case "quote":
        return (
          <blockquote>
            {node.children?.map((child, index) => (
              <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
            ))}
          </blockquote>
        );

      case "code":
        return (
          <pre>
            <code className={node.language ? `language-${node.language}` : ""}>
              {node.children?.map((child, index) => (
                <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
              ))}
            </code>
          </pre>
        );

      case "link":
        return (
          <a href={node.url} target={node.target} rel={node.rel}>
            {node.children?.map((child, index) => (
              <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
            ))}
          </a>
        );

      case "linebreak":
        return <br />;

      default:
        console.warn(`Unknown node type: ${node.type}`);
        return null;
    }
  };

  const getTextAlignment = (format: string | number | undefined): string => {
    if (format === "left") return "text-left";
    if (format === "center") return "text-center";
    if (format === "right") return "text-right";
    if (format === "justify") return "text-justify";
    return "";
  };

  try {
    const parsedContent: { root: LexicalNode } =
      typeof content === "string" ? JSON.parse(content) : content;
    return (
      <div className={`lexical-content ${""}`}>
        {renderNode(parsedContent.root)}
      </div>
    );
  } catch (error) {
    console.error("Error parsing Lexical content:", error);
    return <div>Error rendering content</div>;
  }
};
