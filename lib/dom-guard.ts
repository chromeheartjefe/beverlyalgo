import * as Sentry from "@sentry/nextjs"

// Browser translation (Chrome "Translate this page", Edge Translator) and some
// extensions rewrite the DOM under React: text nodes get swapped for <font>
// wrappers, nodes get moved. React still holds references to the originals,
// so its next removeChild/insertBefore on them throws NotFoundError and the
// whole tree unmounts. Known React issue (facebook/react#11538).
//
// This makes just those two mismatched cases non-fatal: removing a node that
// has already moved is a no-op, and inserting before a node that is gone
// appends instead. Matching calls are untouched. Every save is logged as a
// Sentry breadcrumb so later events still show it happened.

let installed = false

export function installDomGuard() {
  if (installed || typeof Node !== "function" || !Node.prototype) return
  installed = true

  const breadcrumb = (op: string) =>
    Sentry.addBreadcrumb({
      category: "dom-guard",
      level:    "warning",
      message:  `Skipped ${op} on a node moved outside React (translation or extension)`,
    })

  const originalRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      breadcrumb("removeChild")
      return child
    }
    return originalRemoveChild.call(this, child) as T
  }

  const originalInsertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) {
      breadcrumb("insertBefore")
      return originalInsertBefore.call(this, node, null) as T
    }
    return originalInsertBefore.call(this, node, ref) as T
  }
}

/** Chrome/Edge mark a translated page with a class on <html>. */
export function pageTranslated(): boolean {
  if (typeof document === "undefined") return false
  const cl = document.documentElement.classList
  return cl.contains("translated-ltr") || cl.contains("translated-rtl")
}
