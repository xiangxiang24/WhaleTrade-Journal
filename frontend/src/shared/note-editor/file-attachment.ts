import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import FileChip from './file-chip'

export const FileAttachment = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url: { default: '' },
      name: { default: '' },
      size: { default: 0 },
      mime: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'a[data-file-attachment]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        'data-file-attachment': '',
        href: node.attrs.url,
        download: node.attrs.name,
      }),
      node.attrs.name,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileChip)
  },
})
