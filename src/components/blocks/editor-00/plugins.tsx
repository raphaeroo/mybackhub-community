/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { ContentEditable } from "../../editor/editor-ui/content-editable";
import { ToolbarPlugin } from "../../editor/plugins/toolbar/toolbar-plugin";

import { BlockFormatDropDown } from "../../editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatParagraph } from "../../editor/plugins/toolbar/block-format/format-paragraph";
import { FormatNumberedList } from "../../editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatBulletedList } from "../../editor/plugins/toolbar/block-format/format-bulleted-list";
import { ElementFormatToolbarPlugin } from "../../editor/plugins/toolbar/element-format-toolbar-plugin";
import { FontColorToolbarPlugin } from "../../editor/plugins/toolbar/font-color-toolbar-plugin";
import { FontFormatToolbarPlugin } from "../../editor/plugins/toolbar/font-format-toolbar-plugin";
import { LinkToolbarPlugin } from "../../editor/plugins/toolbar/link-toolbar-plugin";
import { EmojisPlugin } from "../../editor/plugins/emojis-plugin";
import { EmojiPickerPlugin } from "../../editor/plugins/emoji-picker-plugin";

export function Plugins() {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      {/* toolbar plugins */}
      <ToolbarPlugin>
        {({ blockType }) => (
          <div className="vertical-align-middle sticky top-0 z-10 flex gap-2 overflow-auto border-b p-1">
            <FontFormatToolbarPlugin format="bold" />
            <FontFormatToolbarPlugin format="italic" />
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatBulletedList />
              <FormatNumberedList />
            </BlockFormatDropDown>
            <FontColorToolbarPlugin />
            <ElementFormatToolbarPlugin />
            <LinkToolbarPlugin />
          </div>
        )}
      </ToolbarPlugin>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable placeholder={"Start typing ..."} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <EmojisPlugin />
        <EmojiPickerPlugin />

        {/* editor plugins */}
      </div>
      {/* actions plugins */}
    </div>
  );
}
