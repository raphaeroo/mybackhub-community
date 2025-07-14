"use client";

import { SerializedEditorState } from "lexical";
import { useState } from "react";
import { Editor } from "~/components/blocks/editor-00/editor";
import { editorRef } from "~/utils";

const initialValue = {
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

export default function EditorPage({}) {
  const [serializedState, setSerializedState] =
    useState<SerializedEditorState>(initialValue);

  return (
    <div className="w-[1500px] p-12 m-12">
      <Editor
        onSerializedChange={setSerializedState}
        editorSerializedState={serializedState}
        editorRef={editorRef}
      />
    </div>
  );
}
