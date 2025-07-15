"use client";

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState, SerializedEditorState, LexicalEditor } from "lexical";
import { useEffect } from "react";

import { editorTheme } from "../../editor/themes/editor-theme";
import { TooltipProvider } from "../../ui/tooltip";

import { nodes } from "./nodes";
import { Plugins } from "./plugins";
import { FloatingLinkContext } from "../../editor/context/floating-link-context";

export const initialValue = {
  root: {
    children: [
      {
        children: [],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState;

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

function EditorRefPlugin({ editorRef }: { editorRef: React.MutableRefObject<LexicalEditor | null> }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    editorRef.current = editor;
  }, [editor, editorRef]);
  
  return null;
}


export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  editorRef,
}: {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
  editorRef?: React.MutableRefObject<LexicalEditor | null>;
}) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow min-h-[300px]">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
        }}
      >
        <TooltipProvider>
          <FloatingLinkContext>
            <Plugins />
            {editorRef && <EditorRefPlugin editorRef={editorRef} />}
          </FloatingLinkContext>
          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState);
              onSerializedChange?.(editorState.toJSON());
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
