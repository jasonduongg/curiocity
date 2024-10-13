"use client";

import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill, { DeltaStatic } from "quill";
import "quill/dist/quill.snow.css";

interface EditorProps {
  readOnly?: boolean;
  defaultValue?: DeltaStatic | string;
  onTextChange?: (
    delta: DeltaStatic,
    oldDelta: DeltaStatic,
    source: string,
  ) => void;
  onSelectionChange?: (
    range: Quill.RangeStatic | null,
    oldRange: Quill.RangeStatic | null,
    source: string,
  ) => void;
}

const Editor = forwardRef<Quill | null, EditorProps>(
  (
    { readOnly = false, defaultValue = "", onTextChange, onSelectionChange },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const defaultValueRef = useRef<DeltaStatic | string | undefined>(
      defaultValue,
    );
    const onTextChangeRef = useRef<
      | ((delta: DeltaStatic, oldDelta: DeltaStatic, source: string) => void)
      | undefined
    >(onTextChange);
    const onSelectionChangeRef = useRef<
      | ((
          range: Quill.RangeStatic | null,
          oldRange: Quill.RangeStatic | null,
          source: string,
        ) => void)
      | undefined
    >(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    }, [onTextChange, onSelectionChange]);

    useEffect(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const editorContainer = container.ownerDocument.createElement("div");
      container.appendChild(editorContainer);

      const quill = new Quill(editorContainer, {
        theme: "snow",
        readOnly: readOnly,
      });

      if (ref) {
        if (typeof ref === "function") {
          ref(quill);
        } else {
          (ref as React.MutableRefObject<Quill | null>).current = quill;
        }
      }

      if (defaultValueRef.current) {
        if (typeof defaultValueRef.current === "string") {
          quill.setText(defaultValueRef.current);
        } else {
          quill.setContents(defaultValueRef.current);
        }
      }

      quill.on("text-change", (delta, oldDelta, source) => {
        onTextChangeRef.current?.(delta, oldDelta, source);
      });

      quill.on("selection-change", (range, oldRange, source) => {
        onSelectionChangeRef.current?.(range, oldRange, source);
      });

      return () => {
        if (ref) {
          if (typeof ref === "function") {
            ref(null);
          } else {
            (ref as React.MutableRefObject<Quill | null>).current = null;
          }
        }
        container.innerHTML = "";
      };
    }, [ref, readOnly]);

    return (
      <div ref={containerRef} style={{ width: "50%", height: "100%" }}></div>
    );
  },
);

Editor.displayName = "Editor";

export default Editor;
