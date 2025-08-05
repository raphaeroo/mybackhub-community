import { SmileIcon } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { $createTextNode, $getSelection, $isRangeSelection } from "lexical";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useCallback } from "react";
import { editorRef } from "~/utils";

export const EmojiPicker = () => {
  const onEmojiSelect = useCallback((emoji: { native?: string } | string) => {
    if (editorRef.current) {
      editorRef.current.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Handle both direct emoji object and search result format
          const emojiChar = typeof emoji === 'string' ? emoji : emoji.native || '';
          if (emojiChar) {
            selection.insertNodes([$createTextNode(emojiChar)]);
          }
        }
      });
      // Focus back to editor after emoji insertion
      editorRef.current.focus();
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="h-8 w-8">
          <SmileIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0 max-h-[350px] overflow-clip">
        <Picker 
          data={data} 
          onEmojiSelect={onEmojiSelect} 
          theme="light" 
          searchPosition="sticky"
          previewPosition="none"
          skinTonePosition="none"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
