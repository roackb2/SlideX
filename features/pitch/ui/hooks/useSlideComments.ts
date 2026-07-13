"use client";

import { useCallback, useEffect, useState } from "react";
import {
  appendSlideComment,
  localSlideCommentAuthor,
  resolveSlideComment,
  type SlideComments
} from "@/features/pitch/application/slideComments";
import {
  readSlideComments,
  writeSlideComments
} from "@/features/pitch/infrastructure/slideComments";

export function useSlideComments(deckId: string) {
  const [comments, setComments] = useState<SlideComments>({});

  useEffect(() => {
    setComments(readSlideComments(deckId));
  }, [deckId]);

  const addComment = useCallback((slideIndex: number, body: string) => {
    if (!body.trim()) return;

    setComments((current) => {
      const next = appendSlideComment(current, slideIndex, body, localSlideCommentAuthor);
      writeSlideComments(deckId, next);
      return next;
    });
  }, [deckId]);

  const passComment = useCallback((slideIndex: number, commentId: string) => {
    setComments((current) => {
      const next = resolveSlideComment(current, slideIndex, commentId);
      writeSlideComments(deckId, next);
      return next;
    });
  }, [deckId]);

  return { addComment, comments, passComment };
}
