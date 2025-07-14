import { AutoLinkNode } from "@lexical/link"
import { ListItemNode, ListNode } from "@lexical/list"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import {
  Klass,
  LexicalNode,
  LexicalNodeReplacement,
  ParagraphNode,
  TextNode,
} from "lexical"
import { EmojiNode } from "../../editor/nodes/emoji-node"

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =
  [HeadingNode, ParagraphNode, TextNode, QuoteNode, ListNode, ListItemNode, AutoLinkNode, EmojiNode]
