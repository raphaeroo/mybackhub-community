/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";

import { ContentEditable } from "../../editor/editor-ui/content-editable";
import { ToolbarPlugin } from "../../editor/plugins/toolbar/toolbar-plugin";

import { BlockFormatDropDown } from "../../editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatParagraph } from "../../editor/plugins/toolbar/block-format/format-paragraph";
import { FormatNumberedList } from "../../editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatBulletedList } from "../../editor/plugins/toolbar/block-format/format-bulleted-list";
import { ElementFormatToolbarPlugin } from "../../editor/plugins/toolbar/element-format-toolbar-plugin";
import { FontColorToolbarPlugin } from "../../editor/plugins/toolbar/font-color-toolbar-plugin";
import { FontFormatToolbarPlugin } from "../../editor/plugins/toolbar/font-format-toolbar-plugin";
import { EmojisPlugin } from "../../editor/plugins/emojis-plugin";
import { EmojiPickerPlugin } from "../../editor/plugins/emoji-picker-plugin";
import { FloatingTextFormatToolbarPlugin } from "../../editor/plugins/floating-text-format-plugin";
import { LinkToolbarPlugin } from "../../editor/plugins/toolbar/link-toolbar-plugin";
import { LinkPlugin } from "../../editor/plugins/link-plugin";
import { ClickableLinkPlugin } from "../../editor/plugins/clickable-link-plugin";
import { AutoLinkPlugin } from "../../editor/plugins/autolink-plugin";
import { FloatingLinkEditorPlugin } from "../../editor/plugins/floating-link-editor-plugin";
import { EmojiPicker } from "../../emojj-selector";

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
          <div className="vertical-align-middle sticky top-0 z-10 flex gap-2 overflow-auto border-b p-1 items-center">
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
            <EmojiPicker />
          </div>
        )}
      </ToolbarPlugin>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable
                  placeholder={"Start typing ..."}
                  className="ContentEditable__root relative block h-72 min-h-72 min-h-full overflow-auto px-8 py-4 focus:outline-none"
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />

        <EmojisPlugin />
        <EmojiPickerPlugin />

        <ListPlugin />
        <CheckListPlugin />

        <ClickableLinkPlugin newTab />
        <AutoLinkPlugin />
        <LinkPlugin />

        <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />

        {/* editor plugins */}
      </div>
      {/* actions plugins */}
    </div>
  );
}
