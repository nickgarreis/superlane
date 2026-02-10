export function extractValue(root: HTMLElement): string {
  let text = "";
  for (const node of Array.from(root.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || "";
      continue;
    }

    if (node.nodeName === "BR") {
      text += "\n";
      continue;
    }

    if (node instanceof HTMLElement && node.dataset.mention) {
      text += node.dataset.mention;
      continue;
    }

    if (node instanceof HTMLElement) {
      if (text.length > 0 && !text.endsWith("\n")) {
        text += "\n";
      }
      text += extractValue(node);
    }
  }

  return text;
}

export function getCursorOffset(root: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return 0;
  }

  const range = selection.getRangeAt(0);
  let offset = 0;
  let found = false;

  function nodeLength(node: Node): number {
    if (node instanceof HTMLElement && node.dataset.mention) {
      return (node.dataset.mention || "").length;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent || "").length;
    }

    if (node.nodeName === "BR") {
      return 1;
    }

    let length = 0;
    for (const child of Array.from(node.childNodes)) {
      length += nodeLength(child);
    }
    return length;
  }

  function walk(node: Node) {
    if (found) {
      return;
    }

    if (node === range.startContainer) {
      if (node.nodeType === Node.TEXT_NODE) {
        offset += range.startOffset;
      } else {
        const childNodes = Array.from(node.childNodes);
        const boundedStartOffset = Math.min(range.startOffset, childNodes.length);
        for (let index = 0; index < boundedStartOffset; index += 1) {
          const child = childNodes[index];
          if (!child) {
            continue;
          }
          offset += nodeLength(child);
        }
      }
      found = true;
      return;
    }

    if (node instanceof HTMLElement && node.dataset.mention) {
      const mentionLength = (node.dataset.mention || "").length;
      if (node.contains(range.startContainer)) {
        offset += mentionLength;
        found = true;
        return;
      }
      offset += mentionLength;
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      offset += (node.textContent || "").length;
      return;
    }

    if (node.nodeName === "BR") {
      offset += 1;
      return;
    }

    for (const child of Array.from(node.childNodes)) {
      if (found) {
        return;
      }
      walk(child);
    }
  }

  walk(root);
  return offset;
}

export function setCursorAtOffset(root: HTMLElement, target: number) {
  let current = 0;
  let resultNode: Node | null = null;
  let resultOffset = 0;

  function walk(node: Node) {
    if (resultNode) {
      return;
    }

    if (node instanceof HTMLElement && node.dataset.mention) {
      const mentionLength = (node.dataset.mention || "").length;
      if (current + mentionLength >= target) {
        const parent = node.parentNode;
        if (!parent) {
          return;
        }
        const index = Array.from(parent.childNodes).indexOf(node as ChildNode);
        resultNode = parent;
        resultOffset = index + 1;
        return;
      }
      current += mentionLength;
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = (node.textContent || "").length;
      if (current + textLength >= target) {
        resultNode = node;
        resultOffset = target - current;
        return;
      }
      current += textLength;
      return;
    }

    if (node.nodeName === "BR") {
      if (current + 1 >= target) {
        const parent = node.parentNode;
        if (!parent) {
          return;
        }
        const index = Array.from(parent.childNodes).indexOf(node as ChildNode);
        resultNode = parent;
        resultOffset = index + 1;
        return;
      }
      current += 1;
      return;
    }

    for (const child of Array.from(node.childNodes)) {
      if (resultNode) {
        return;
      }
      walk(child);
    }
  }

  walk(root);

  const selection = window.getSelection();
  const range = document.createRange();
  if (resultNode) {
    range.setStart(resultNode, resultOffset);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
    return;
  }

  range.selectNodeContents(root);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export function insertPlainTextAtSelection(root: HTMLElement, text: string): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
    return false;
  }

  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}
