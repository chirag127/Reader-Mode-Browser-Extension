/**
 * Read Aloud: Intelligent Reader Mode
 * markdown-utils.js - Utilities for handling markdown content
 */

// Check if content is in markdown format
function isMarkdown(content) {
    // Check for common markdown patterns
    const markdownPatterns = [
        /^#\s+.+$/m,          // Headings
        /^\*\s+.+$/m,        // Unordered list
        /^-\s+.+$/m,         // Unordered list (dash)
        /^\d+\.\s+.+$/m,    // Ordered list
        /^>\s+.+$/m,         // Blockquote
        /^\|.+\|$/m,         // Table
        /^```[\s\S]*```$/m,  // Code block
        /^\[.+\]\(.+\)$/m   // Links
    ];
    
    return markdownPatterns.some(pattern => pattern.test(content));
}

// Convert markdown to HTML
function convertMarkdownToHtml(markdown) {
    let html = markdown;
    
    // Convert headings
    html = html.replace(/^(#{1,6})\s+(.+)$/gm, function(match, hashes, text) {
        const level = hashes.length;
        return `<h${level}>${text.trim()}</h${level}>`;
    });
    
    // Convert unordered lists
    html = html.replace(/^[\*-]\s+(.+)$/gm, '<li>$1</li>');
    
    // Wrap list items in ul tags (simplified approach)
    let inList = false;
    const lines = html.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('<li>') && !inList) {
            lines[i] = '<ul>' + lines[i];
            inList = true;
        } else if (!lines[i].startsWith('<li>') && inList) {
            lines[i-1] = lines[i-1] + '</ul>';
            inList = false;
        }
    }
    if (inList) {
        lines[lines.length-1] += '</ul>';
    }
    html = lines.join('\n');
    
    // Convert ordered lists (simplified approach)
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    
    // Wrap ordered list items in ol tags
    inList = false;
    const olLines = html.split('\n');
    for (let i = 0; i < olLines.length; i++) {
        if (olLines[i].startsWith('<li>') && !olLines[i-1]?.includes('<ul>') && !inList) {
            olLines[i] = '<ol>' + olLines[i];
            inList = true;
        } else if (!olLines[i].startsWith('<li>') && inList) {
            olLines[i-1] = olLines[i-1] + '</ol>';
            inList = false;
        }
    }
    if (inList) {
        olLines[olLines.length-1] += '</ol>';
    }
    html = olLines.join('\n');
    
    // Convert blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Convert code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Convert inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Convert images
    html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    html = html.replace(/\[IMAGE\]/g, '<div class="image-placeholder">[Image]</div>');
    
    // Convert bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic text
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Convert tables (basic support)
    const tableRegex = /^\|(.+)\|$/gm;
    if (tableRegex.test(html)) {
        // Find table rows
        const rows = html.match(/^\|(.+)\|$/gm);
        if (rows && rows.length > 1) {
            let tableHtml = '<table>';
            
            // Process header row
            const headerCells = rows[0].split('|').filter(cell => cell.trim() !== '');
            tableHtml += '<thead><tr>';
            headerCells.forEach(cell => {
                tableHtml += `<th>${cell.trim()}</th>`;
            });
            tableHtml += '</tr></thead>';
            
            // Process body rows
            tableHtml += '<tbody>';
            for (let i = 2; i < rows.length; i++) {
                const cells = rows[i].split('|').filter(cell => cell.trim() !== '');
                tableHtml += '<tr>';
                cells.forEach(cell => {
                    tableHtml += `<td>${cell.trim()}</td>`;
                });
                tableHtml += '</tr>';
            }
            tableHtml += '</tbody></table>';
            
            // Replace the table in the HTML
            for (const row of rows) {
                html = html.replace(row, '');
            }
            html = html.replace(/\n\n+/g, '\n\n');
            html += tableHtml;
        }
    }
    
    // Wrap remaining text in paragraphs
    const htmlLines = html.split('\n');
    for (let i = 0; i < htmlLines.length; i++) {
        if (htmlLines[i].trim() !== '' && 
            !htmlLines[i].startsWith('<h') && 
            !htmlLines[i].startsWith('<ul') && 
            !htmlLines[i].startsWith('<ol') && 
            !htmlLines[i].startsWith('<li') && 
            !htmlLines[i].startsWith('<blockquote') && 
            !htmlLines[i].startsWith('<pre') && 
            !htmlLines[i].startsWith('<table') && 
            !htmlLines[i].includes('</ul>') && 
            !htmlLines[i].includes('</ol>')) {
            htmlLines[i] = '<p>' + htmlLines[i] + '</p>';
        }
    }
    html = htmlLines.join('\n');
    
    return html;
}

// Format content for display, handling both markdown and plain text
function formatContent(content) {
    // Check if we need to convert from markdown
    if (isMarkdown(content)) {
        console.log('Content detected as markdown, converting to HTML');
        return convertMarkdownToHtml(content);
    }
    
    // Legacy format handling (for backward compatibility)
    console.log('Content detected as plain text, using legacy formatting');
    // Replace newlines with paragraph tags
    let formatted = content
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>");

    // Wrap in paragraph tags if not already
    if (!formatted.startsWith("<p>")) {
        formatted = "<p>" + formatted;
    }
    if (!formatted.endsWith("</p>")) {
        formatted += "</p>";
    }

    // Handle image placeholders
    formatted = formatted.replace(
        /\[IMAGE\]/g,
        '<div class="image-placeholder">[Image]</div>'
    );

    return formatted;
}
