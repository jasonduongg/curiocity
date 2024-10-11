// "use client";

// import React, {
//   forwardRef,
//   useEffect,
//   useLayoutEffect,
//   useRef,
// } from 'react';
// import Quill, { DeltaStatic } from 'quill';
// import 'quill/dist/quill.snow.css'; // Import Quill's Snow theme CSS

// // Define the props interface
// interface EditorProps {
//   readOnly?: boolean;
//   defaultValue?: DeltaStatic | string;
//   onTextChange?: (delta: DeltaStatic, oldDelta: DeltaStatic, source: string) => void;
//   onSelectionChange?: (range: Quill.RangeStatic | null, oldRange: Quill.RangeStatic | null, source: string) => void;
// }

// // Define the Editor component with forwarded ref
// const Editor = forwardRef<Quill | null, EditorProps>(
//   (
//     {
//       readOnly = false,
//       defaultValue = '',
//       onTextChange,
//       onSelectionChange,
//     },
//     ref
//   ) => {
//     // Reference to the container div where Quill will be mounted
//     const containerRef = useRef<HTMLDivElement>(null);

//     // Refs to hold the latest prop values to avoid stale closures
//     const defaultValueRef = useRef<DeltaStatic | string | undefined>(defaultValue);
//     const onTextChangeRef = useRef<typeof onTextChange>(onTextChange);
//     const onSelectionChangeRef = useRef<typeof onSelectionChange>(onSelectionChange);

//     // Update refs when props change
//     useLayoutEffect(() => {
//       onTextChangeRef.current = onTextChange;
//       onSelectionChangeRef.current = onSelectionChange;
//     }, [onTextChange, onSelectionChange]);

//     // Effect to enable or disable the editor based on readOnly prop
//     useEffect(() => {
//       if (ref && typeof ref !== 'function' && ref.current) {
//         ref.current.enable(!readOnly);
//       }
//     }, [ref, readOnly]);

//     // Effect to initialize Quill editor
//     useEffect(() => {
//       const container = containerRef.current;
//       if (!container) return;

//       // Create a div to mount Quill
//       const editorContainer = container.ownerDocument.createElement('div');
//       container.appendChild(editorContainer);

//       // Initialize Quill
//       const quill = new Quill(editorContainer, {
//         theme: 'snow',
//         readOnly: readOnly,
//       });

//       // Assign Quill instance to the forwarded ref
//       if (ref) {
//         if (typeof ref === 'function') {
//           ref(quill);
//         } else {
//           (ref as React.MutableRefObject<Quill | null>).current = quill;
//         }
//       }

//       // Set default content
//       if (defaultValueRef.current) {
//         if (typeof defaultValueRef.current === 'string') {
//           quill.setText(defaultValueRef.current);
//         } else {
//           quill.setContents(defaultValueRef.current);
//         }
//       }

//       // Listen to text-change events
//       quill.on('text-change', (delta, oldDelta, source) => {
//         onTextChangeRef.current?.(delta, oldDelta, source);
//       });

//       // Listen to selection-change events
//       quill.on('selection-change', (range, oldRange, source) => {
//         onSelectionChangeRef.current?.(range, oldRange, source);
//       });

//       // Cleanup on unmount
//       return () => {
//         if (ref) {
//           if (typeof ref === 'function') {
//             ref(null);
//           } else {
//             (ref as React.MutableRefObject<Quill | null>).current = null;
//           }
//         }
//         container.innerHTML = ''; // Remove Quill's DOM elements
//       };
//     }, [ref, defaultValueRef, readOnly]);

//     // Render the container div
//     return <div ref={containerRef} style = {{width: '50%', height: "100%"}}></div>;
//   }
// );

// // Set a display name for easier debugging
// Editor.displayName = 'Editor';

// export default Editor;

"use client";

import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill, { DeltaStatic } from "quill";
import "quill/dist/quill.snow.css"; // Import Quill's Snow theme CSS

// Define the props interface
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

// Define the Editor component with forwarded ref
const Editor = forwardRef<Quill | null, EditorProps>(
  (
    { readOnly = false, defaultValue = "", onTextChange, onSelectionChange },
    ref,
  ) => {
    // Reference to the container div where Quill will be mounted
    const containerRef = useRef<HTMLDivElement>(null);

    // Refs to hold the latest prop values to avoid stale closures
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

    // Update refs when props change
    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    }, [onTextChange, onSelectionChange]);

    // Effect to enable or disable the editor based on readOnly prop
    useEffect(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    // Effect to initialize Quill editor
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Create a div to mount Quill
      const editorContainer = container.ownerDocument.createElement("div");
      container.appendChild(editorContainer);

      // Initialize Quill
      const quill = new Quill(editorContainer, {
        theme: "snow",
        readOnly: readOnly,
      });

      // Assign Quill instance to the forwarded ref
      if (ref) {
        if (typeof ref === "function") {
          ref(quill);
        } else {
          (ref as React.MutableRefObject<Quill | null>).current = quill;
        }
      }

      // Set default content
      if (defaultValueRef.current) {
        if (typeof defaultValueRef.current === "string") {
          quill.setText(defaultValueRef.current);
        } else {
          quill.setContents(defaultValueRef.current);
        }
      }

      // Listen to text-change events
      quill.on("text-change", (delta, oldDelta, source) => {
        onTextChangeRef.current?.(delta, oldDelta, source);
      });

      // Listen to selection-change events
      quill.on("selection-change", (range, oldRange, source) => {
        onSelectionChangeRef.current?.(range, oldRange, source);
      });

      // Cleanup on unmount
      return () => {
        if (ref) {
          if (typeof ref === "function") {
            ref(null);
          } else {
            (ref as React.MutableRefObject<Quill | null>).current = null;
          }
        }
        container.innerHTML = ""; // Remove Quill's DOM elements
      };
    }, [ref, readOnly]); // Removed defaultValueRef from dependencies

    // Render the container div
    return (
      <div ref={containerRef} style={{ width: "50%", height: "100%" }}></div>
    );
  },
);

// Set a display name for easier debugging
Editor.displayName = "Editor";

export default Editor;
