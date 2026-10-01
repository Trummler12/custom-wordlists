/** Hold a popover still — its width *and* where it sits — for as long as it is
 *  open. Height is free to move: the popover hangs from a fixed top edge, so only
 *  its bottom travels. Used by the ⚙️ menu and the 🌐 panel.
 *
 *  Two separate things move it, and neither is the popover's own doing. Changing
 *  the interface language rewrites the labels inside it, and a box sized to its
 *  content is anchored on the right, so every pixel it gains comes off the left.
 *  It also rewrites the *Copy* button beside it, which shifts the button, which
 *  is what the popover is positioned against — the same shift the button's own
 *  "Copied!" produces. So rather than react to the causes, the popover watches
 *  where its anchor actually is and cancels any drift with an equal `right`
 *  offset.
 *
 *  A viewport resize releases both: the pin exists to keep the box under the
 *  cursor that is using it, and holding a stale width across a real layout
 *  change would be the bug rather than the fix. */
export function pinBox(node: HTMLElement) {
  const anchor = node.parentElement;
  if (!anchor) return;
  let left = 0;
  let viewport = window.innerWidth;
  let frame = 0;

  const baseline = () => {
    node.style.width = "";
    node.style.right = "";
    node.style.width = `${node.getBoundingClientRect().width}px`;
    left = anchor.getBoundingClientRect().left;
  };
  const hold = () => {
    if (window.innerWidth !== viewport) {
      viewport = window.innerWidth;
      baseline();
    } else {
      const drift = anchor.getBoundingClientRect().left - left;
      const right = drift ? `${drift}px` : "";
      if (node.style.right !== right) node.style.right = right;
    }
    frame = requestAnimationFrame(hold);
  };

  baseline();
  frame = requestAnimationFrame(hold);
  return { destroy: () => cancelAnimationFrame(frame) };
}
