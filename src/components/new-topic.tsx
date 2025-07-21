"use client";
import { PlusIcon } from "lucide-react";
import { SerializedEditorState } from "lexical";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Editor, initialValue } from "./blocks/editor-00/editor";
import { editorRef } from "~/utils";

import categories from "~/mocks/categories.json";
import { useCallback, useState } from "react";
import { Input } from "./ui/input";
import { useMe } from "~/Contexts/meContext";

type Category = (typeof categories)[0];

type SubmitData = {
  title: string;
  categoryId?: string;
  content: SerializedEditorState;
  authorId?: string;
};

interface NewTopicProps {
  showCategorySelect?: boolean;
  onSubmit?: (data: SubmitData) => void;
  currentCategoryId?: string;
}

export const NewTopic = ({
  showCategorySelect = false,
  onSubmit,
  currentCategoryId,
}: NewTopicProps) => {
  const [serializedState, setSerializedState] =
    useState<SerializedEditorState>(initialValue);
  const { me } = useMe();;

  const [categoryId, setCategoryId] = useState<string | undefined>(currentCategoryId);
  const [title, setTitle] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = useCallback(() => {
    onSubmit?.({
      title,
      categoryId,
      content: serializedState,
      authorId: me?.id,
    });

    setTimeout(() => {
      setSerializedState(initialValue);
      setTitle("");
      setCategoryId(undefined);
      setIsOpen(false);
    }, 500);
  }, [title, categoryId, serializedState, onSubmit, me]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogTrigger asChild className="w-full">
          <Button variant="outline">
            <PlusIcon />
            <span>Start new topic</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] md:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Start a new topic</DialogTitle>
            <DialogDescription>
              Add a title and description to your topic and contribute to our
              community.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {showCategorySelect && (
              <div className="grid gap-3">
                <Label>Category</Label>
                <Select
                  defaultValue={
                    categories.find((cat) => cat.id === categoryId)?.name
                  }
                  onValueChange={(value) => {
                    const category = categories.find(
                      (cat: Category) => cat.name.toLowerCase() === value
                    );
                    if (category) {
                      setCategoryId(category.id.toString());
                    } else {
                      setCategoryId(undefined);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((category: Category) => (
                        <SelectItem
                          key={category.id}
                          value={category.name.toLowerCase()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-3">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Insert title here..."
              />
            </div>
            <div className="grid gap-3">
              <Label>Description</Label>
              <Editor
                onSerializedChange={setSerializedState}
                editorSerializedState={serializedState}
                editorRef={editorRef}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmit}>
              Post Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};
