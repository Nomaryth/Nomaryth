import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, BlockContent } from 'mdast';

export const remarkGithubAlerts: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'blockquote', (node, index, parent) => {
      if (!parent || index === undefined) return;
      
      const firstChild = node.children[0];
      if (firstChild?.type !== 'paragraph') return;
      
      const firstTextNode = firstChild.children[0];
      if (firstTextNode?.type !== 'text') return;
      
      const text = firstTextNode.value;
      const alertMatch = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|ERROR|INFO|EXAMPLE|QUOTE|TODO|CITE)\]\s*/i);
      
      if (alertMatch) {
        const alertType = alertMatch[1].toLowerCase();
        
        firstTextNode.value = text.replace(alertMatch[0], '');
        
        if (!firstTextNode.value.trim()) {
          firstChild.children.shift();
          if (firstChild.children.length === 0) {
            node.children.shift();
          }
        }
        
        (node as any).data = {
          ...((node as any).data || {}),
          hName: 'div',
          hProperties: {
            className: [`alert`, `alert-${alertType}`],
            'data-alert-type': alertType
          }
        };
      }
    });
  };
};

export const remarkCustomAnchors: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'heading', (node) => {
      const lastChild = node.children[node.children.length - 1];
      
      if (lastChild?.type === 'text') {
        const text = lastChild.value;
        const anchorMatch = text.match(/\s*\{#([^}]+)\}\s*$/);
        
        if (anchorMatch) {
          const anchorId = anchorMatch[1];
          
          lastChild.value = text.replace(anchorMatch[0], '');
          
          (node as any).data = {
            ...((node as any).data || {}),
            hProperties: {
              id: anchorId
            }
          };
        }
      }
    });
  };
};
