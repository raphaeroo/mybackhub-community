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
  const onEmojiSelect = useCallback((emoji: { native: string }) => {
    if (editorRef.current) {
      editorRef.current.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes([$createTextNode(emoji.native)]);
        }
      });
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="h-8 w-8">
          <SmileIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0">
        <Picker data={data} onEmojiSelect={onEmojiSelect} theme="light"  />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
