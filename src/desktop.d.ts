export {}

declare global {
  interface Window {
    gloammarkDesktop?: {
      platform: string
      onOpenFile: (callback: (payload: { filename: string; content: string }) => void) => () => void
    }
  }
}
