import { $isListNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list"
import { $isHeadingNode } from "@lexical/rich-text"
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils"
import { $isRangeSelection, $isRootOrShadowRoot, BaseSelection, $getSelection, $createParagraphNode } from "lexical"
import { $setBlocksType } from "@lexical/selection"

import { useToolbarContext } from "../../../editor/context/toolbar-context"
import { useUpdateToolbarHandler } from "../../../editor/editor-hooks/use-update-toolbar"
import { blockTypeToBlockName } from "../../../editor/plugins/toolbar/block-format/block-format-data"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
} from "../../../ui/select"

export function BlockFormatDropDown({
  children,
}: {
  children: React.ReactNode
}) {
  const { activeEditor, blockType, setBlockType } = useToolbarContext()

  function $updateToolbar(selection: BaseSelection) {
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent()
              return parent !== null && $isRootOrShadowRoot(parent)
            })

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow()
      }

      const elementKey = element.getKey()
      const elementDOM = activeEditor.getElementByKey(elementKey)

      if (elementDOM !== null) {
        // setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          )
          const type = parentList
            ? parentList.getListType()
            : element.getListType()
          setBlockType(type)
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType()
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName)
          }
        }
      }
    }
  }

  useUpdateToolbarHandler($updateToolbar)

  const formatParagraph = () => {
    activeEditor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }

  const handleFormatChange = (value: string) => {
    setBlockType(value as keyof typeof blockTypeToBlockName)
    
    // Apply the actual format change
    if (value === "paragraph") {
      formatParagraph()
    } else if (value === "bullet") {
      if (blockType !== "bullet") {
        activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
      } else {
        formatParagraph()
      }
    } else if (value === "number") {
      if (blockType !== "number") {
        activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      } else {
        formatParagraph()
      }
    }
  }

  return (
    <Select
      value={blockType}
      onValueChange={handleFormatChange}
    >
      <SelectTrigger className="!h-8 w-min gap-1">
        {blockTypeToBlockName[blockType].icon}
        <span>{blockTypeToBlockName[blockType].label}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>{children}</SelectGroup>
      </SelectContent>
    </Select>
  )
}
