// import { Readability } from "@mozilla/readability";
// import { omit } from "radash";
import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
});

/**
 * 解码 HTML 实体
 * @param html HTML 字符串
 * @returns 解码后的 HTML 字符串
 */
function decodeHtmlEntities(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  // 递归解码所有文本节点
  function decodeTextNodes(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const div = document.createElement('div');
      div.innerHTML = text;
      node.textContent = div.textContent;
    }
    node.childNodes.forEach(decodeTextNodes);
  }

  decodeTextNodes(doc.documentElement);
  return doc.documentElement.innerHTML;
}

/**
 * 清理 HTML，移除不需要的元素
 * @param html HTML 字符串
 * @returns 清理后的 HTML 字符串
 */
function cleanHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // 移除所有 script 标签
  doc.querySelectorAll('script').forEach(el => el.remove());

  // 移除所有 style 标签
  doc.querySelectorAll('style').forEach(el => el.remove());

  // 移除所有 CSS 链接
  doc.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());

  // 移除所有内联样式和不必要的属性
  doc.querySelectorAll('*').forEach(el => {
    el.removeAttribute('style');
    el.removeAttribute('class');
    el.removeAttribute('id');
    // 移除 data- 属性
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  // 移除空的 div 和 span
  doc.querySelectorAll('div:empty, span:empty').forEach(el => el.remove());

  return doc.documentElement.innerHTML;
}

/**
 * use `@mozilla/readability` to get page content
 * @returns article with original HTML content
 */
export function simpleParseRead() {
  // 获取完整的 HTML 内容，但只获取 body 部分
  const bodyContent = document.body.innerHTML;

  // 解码 HTML 实体
  const decodedHtml = decodeHtmlEntities(bodyContent);
  
  // 清理 HTML
  const cleanedHtml = cleanHtml(decodedHtml);

  // 转换为 Markdown
  const htmlmkdown = turndownService.turndown(cleanedHtml)
    // 额外的清理步骤
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x\w+;/g, match => {
      try {
        return String.fromCharCode(parseInt(match.slice(3, -1), 16));
      } catch {
        return match;
      }
    });

  const articleUrl = window.location.href;
  
  return {
    content: htmlmkdown,
    textContent: htmlmkdown,
    articleUrl,
    title: document.title,
    length: htmlmkdown.length
  }
}

/**
 * 将连续的\n ' '替换为单个
 * @param input 
 * @returns 
 */
export function cleanString(input: string): string {
  return input.replace(/(\n+\s+\n)|(\s{2,})/g, match => {
    if (match.includes('\n')) {
      return '\n';
    }
    return ' ';
  });
}