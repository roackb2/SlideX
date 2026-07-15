"use client";

import { useCallback, useEffect, useState } from "react";
import {
  appendSlideComment,
  localSlideCommentAuthor,
  removeSlideComment,
  resolveSlideComment,
  type SlideComments
} from "@/features/pitch/application/slideComments";
import {
  readSlideComments,
  writeSlideComments
} from "@/features/pitch/infrastructure/slideComments";
import { createSupabaseBrowserClient } from "@/common/lib/supabase/browserClient";
import {
  createSupabaseSlideComment,
  listSupabaseSlideComments,
  parseSupabaseSlideCommentResolution,
  resolveSupabaseSlideComment
} from "@/features/pitch/infrastructure/supabaseSlideComments";

type SlideCommentsPersistence = {
  localDeckId: string;
  presentationId?: string;
};

export function useSlideComments({ localDeckId, presentationId }: SlideCommentsPersistence) {
  const [comments, setComments] = useState<SlideComments>({});
  const [error, setError] = useState<string>();

  useEffect(() => {
    let isCancelled = false;
    setError(undefined);

    if (!presentationId) {
      setComments(readSlideComments(localDeckId));
      return;
    }

    const client = createSupabaseBrowserClient();
    void listSupabaseSlideComments(client, presentationId)
      .then((nextComments) => {
        if (!isCancelled) setComments(nextComments);
      })
      .catch(() => {
        if (!isCancelled) setError("Comments could not be loaded from Supabase.");
      });

    let channel: ReturnType<typeof client.channel> | null = null;
    void client.realtime.setAuth().then(() => {
      if (isCancelled) return;
      channel = client
        .channel(`slide-comments:${presentationId}`, {
          config: { private: true }
        })
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            filter: `presentation_id=eq.${presentationId}`,
            schema: "public",
            table: "slide_comments"
          },
          (payload) => {
            const resolution = parseSupabaseSlideCommentResolution(payload.new);
            if (isCancelled || !resolution?.isResolved) return;
            setComments((current) => removeSlideComment(
              current,
              resolution.slideIndex,
              resolution.commentId
            ));
          }
        )
        .subscribe((status) => {
          if (!isCancelled && (status === "CHANNEL_ERROR" || status === "TIMED_OUT")) {
            setError("Comments could not connect to Supabase Realtime.");
          }
        });
    }).catch(() => {
      if (!isCancelled) setError("Comments could not connect to Supabase Realtime.");
    });

    return () => {
      isCancelled = true;
      if (channel) void client.removeChannel(channel);
    };
  }, [localDeckId, presentationId]);

  const addComment = useCallback(async (slideIndex: number, body: string) => {
    if (!body.trim()) return;

    if (presentationId) {
      try {
        const comment = await createSupabaseSlideComment(
          createSupabaseBrowserClient(),
          presentationId,
          slideIndex,
          body
        );
        setComments((current) => ({
          ...current,
          [slideIndex]: [...(current[slideIndex] ?? []), comment]
        }));
        setError(undefined);
      } catch {
        setError("The comment could not be saved to Supabase.");
      }
      return;
    }

    setComments((current) => {
      const next = appendSlideComment(current, slideIndex, body, localSlideCommentAuthor);
      writeSlideComments(localDeckId, next);
      return next;
    });
  }, [localDeckId, presentationId]);

  const passComment = useCallback(async (slideIndex: number, commentId: string) => {
    if (presentationId) {
      try {
        await resolveSupabaseSlideComment(
          createSupabaseBrowserClient(),
          presentationId,
          commentId
        );
        setComments((current) => removeSlideComment(current, slideIndex, commentId));
        setError(undefined);
      } catch {
        setError("The comment could not be resolved in Supabase.");
      }
      return;
    }

    setComments((current) => {
      const next = resolveSlideComment(current, slideIndex, commentId);
      writeSlideComments(localDeckId, next);
      return next;
    });
  }, [localDeckId, presentationId]);

  return { addComment, comments, error, passComment };
}
