/**
 * Extract plain text from HTML content
 */
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

/**
 * Truncate text to a specific length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 150): string {
    const plainText = stripHtml(text);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
}

/**
 * Extract the first paragraph from content as a description
 */
export function extractDescription(content: string, maxLength: number = 200): string {
    const plainText = stripHtml(content);
    const paragraphs = plainText.split('\n').filter(p => p.trim().length > 0);
    const firstParagraph = paragraphs[0] || plainText;
    
    if (firstParagraph.length <= maxLength) return firstParagraph;
    return firstParagraph.substring(0, maxLength).trim() + '...';
}